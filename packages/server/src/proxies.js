const httpProxyMiddleware = require("http-proxy-middleware");

const getProxyMiddleware = (proxyConfig) => {
  if (typeof proxyConfig.logLevel === "undefined") {
    proxyConfig.logLevel = "error";
  }
  const context = proxyConfig.context || proxyConfig.path;
  // It is possible to use the `bypass` method without a `target`.
  // However, the proxy middleware has no use in this case, and will fail to instantiate.
  if (proxyConfig.target) {
    return httpProxyMiddleware(context, proxyConfig);
  }
  return null;
};

const normalize = (options) =>
  Object.keys(options).map((context) => {
    let proxyOptions;
    const correctedContext = context.replace(/^\*$/, "**").replace(/\/\*$/, "");
    if (typeof options.proxy[context] === "string") {
      proxyOptions = {
        context: correctedContext,
        target: options.proxy[context],
      };
    } else {
      proxyOptions = Object.assign({}, options.proxy[context]);
      proxyOptions.context = correctedContext;
    }
    proxyOptions.logLevel = proxyOptions.logLevel || "warn";
    return proxyOptions;
  });

const applyProxies = (app, options = []) => {
  const websocketProxies = [];
  const proxy = !Array.isArray(options) ? normalize(options) : options;
  proxy.forEach((proxyConfigOrCallback) => {
    let proxyConfig;
    let proxyMiddleware;

    if (typeof proxyConfigOrCallback === "function") {
      proxyConfig = proxyConfigOrCallback();
    } else {
      proxyConfig = proxyConfigOrCallback;
    }

    proxyMiddleware = getProxyMiddleware(proxyConfig);

    if (proxyConfig.ws) {
      websocketProxies.push(proxyMiddleware);
    }

    // eslint-disable-next-line consistent-return
    app.use((req, res, next) => {
      if (typeof proxyConfigOrCallback === "function") {
        const newProxyConfig = proxyConfigOrCallback();

        if (newProxyConfig !== proxyConfig) {
          proxyConfig = newProxyConfig;
          proxyMiddleware = getProxyMiddleware(proxyConfig);
        }
      }

      const bypass = typeof proxyConfig.bypass === "function";

      const bypassUrl =
        (bypass && proxyConfig.bypass(req, res, proxyConfig)) || false;

      if (bypassUrl) {
        req.url = bypassUrl;

        next();
      } else if (proxyMiddleware) {
        return proxyMiddleware(req, res, next);
      } else {
        next();
      }
    });
  });
  return websocketProxies;
};

module.exports = applyProxies;
