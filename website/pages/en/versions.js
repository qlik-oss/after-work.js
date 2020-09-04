const React = require("react");

const { Container } = require("../../core/CompLibrary");

const cwd = process.cwd();

const siteConfig = require(`${cwd}/siteConfig.js`);
const versions = require(`${cwd}//versions.json`);

class Versions extends React.Component {
  render() {
    const latestVersion = versions[0];
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer versionsContainer">
          <div className="post">
            <header className="postHeader">
              <h2>{siteConfig.title} Versions</h2>
            </header>
            <h3 id="latest">Current version (Stable)</h3>
            <p>Latest version of after-work.js.</p>
            <table className="versions">
              <tbody>
                <tr>
                  <th>{latestVersion}</th>
                  <td>
                    <a href={`${siteConfig.baseUrl}docs/installation`}>
                      Documentation
                    </a>
                  </td>
                  <td>
                    <a
                      href={`https://github.com/qlik-oss/after-work.js/releases/tag/v${latestVersion}`}
                    >
                      Release Notes
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 id="rc">Latest Version</h3>
            Here you can find the latest documentation and unreleased code.
            <table className="versions">
              <tbody>
                <tr>
                  <th>master</th>
                  <td>
                    <a href={`${siteConfig.baseUrl}docs/next/installation`}>
                      Documentation
                    </a>
                  </td>
                  <td>
                    <a href="https://github.com/qlik-oss/after-work.js">
                      Source Code
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 id="archive">Past Versions</h3>
            <p>
              Here you can find documentation for previous versions of
              after-work.js.
            </p>
            <table className="versions">
              <tbody>
                {versions.map(
                  (version) =>
                    version !== latestVersion && (
                      <tr key={version}>
                        <th>{version}</th>
                        <td>
                          <a
                            href={`${siteConfig.baseUrl}docs/${version}/installation`}
                          >
                            Documentation
                          </a>
                        </td>
                        <td>
                          <a
                            href={`https://github.com/qlik-oss/after-work.js/releases/tag/v${version}`}
                          >
                            Release Notes
                          </a>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
            <p>
              You can find past versions of this project on{" "}
              <a href="https://github.com/qlik-oss/after-work.js/releases">
                GitHub
              </a>
              .
            </p>
          </div>
        </Container>
      </div>
    );
  }
}

Versions.title = "Versions";

module.exports = Versions;
