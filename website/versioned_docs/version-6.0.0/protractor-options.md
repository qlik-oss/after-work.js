---
id: version-6.0.0-protractor-options
title: Protractor
original_id: protractor-options
---

## Options

### --presetEnv

| Description                                                                                | Type    | Default |
| :----------------------------------------------------------------------------------------- | :------ | :------ |
| Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset | boolean | true    |

---

### --config

| Description         | Type   | Default | Alias |
| :------------------ | :----- | :------ | ----- |
| Path to config file | string |         | c     |

---

### --test

| Description  | Type  | Default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Alias |
| :----------- | :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Glob pattern | array | commands/aw/**/*.{spec,test}.{js,ts},commands/cdp/**/*.{spec,test}.{js,ts},commands/cli/**/*.{spec,test}.{js,ts},commands/node/**/*.{spec,test}.{js,ts},commands/node-cli/**/*.{spec,test}.{js,ts},commands/protractor/**/*.{spec,test}.{js,ts},commands/puppeteer/**/*.{spec,test}.{js,ts},commands/serve/**/*.{spec,test}.{js,ts},examples/chrome-js/**/*.{spec,test}.{js,ts},examples/chrome-ts/**/*.{spec,test}.{js,ts},examples/node-js/**/*.{spec,test}.{js,ts},examples/node-js-no-babel/**/*.{spec,test}.{js,ts},examples/node-ts/**/*.{spec,test}.{js,ts},examples/protractor/**/*.{spec,test}.{js,ts},examples/puppeteer/**/*.{spec,test}.{js,ts},examples/react/**/*.{spec,test}.{js,ts},examples/webpack-dev-server/**/*.{spec,test}.{js,ts},packages/register/**/*.{spec,test}.{js,ts},packages/server/**/*.{spec,test}.{js,ts},packages/transform/**/*.{spec,test}.{js,ts},packages/transform-middleware/**/*.{spec,test}.{js,ts},packages/utils/**/*.{spec,test}.{js,ts},plugins/chai-plugin-screenshot/**/*.{spec,test}.{js,ts},plugins/chai-plugin-snapshot/**/*.{spec,test}.{js,ts},plugins/interactive-plugin/**/*.{spec,test}.{js,ts},plugins/preset-plugin/**/*.{spec,test}.{js,ts},plugins/watch-plugin/**/*.{spec,test}.{js,ts},!**/node_modules/**,!./node_modules/** | glob  |

---

### --coverage

| Description       | Type    | Default |
| :---------------- | :------ | :------ |
| Generate coverage | boolean | false   |

---

### --require

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Require path | array |         |

---

### --hookRequire

| Description                                         | Type    | Default |
| :-------------------------------------------------- | :------ | :------ |
| Hook require to be able to mock and transform files | boolean | true    |

---

### --babel.enable

| Description  | Type    | Default |
| :----------- | :------ | :------ |
| Enable babel | boolean | true    |

---

### --babel.core

| Description               | Type   | Default |
| :------------------------ | :----- | :------ |
| Path to babel core module | string |         |

---

### --babel.babelPluginIstanbul

| Description                          | Type   | Default               |
| :----------------------------------- | :----- | :-------------------- |
| Path to babel plugin istanbul module | string | babel-plugin-istanbul |

---

### --babel.options

| Description   | Type   | Default         |
| :------------ | :----- | :-------------- |
| Babel options | object | [object Object] |

---

### --babel.typescript

| Description                        | Type   | Default    |
| :--------------------------------- | :----- | :--------- |
| Path to typescript compiler module | string | typescript |

---

### --filter.protractor.files

| Description                        | Type  | Default |
| :--------------------------------- | :---- | :------ |
| Filter files for Protractor runner | array | **      |

---

### --artifactsPath

| Description                                         | Type   | Default            |
| :-------------------------------------------------- | :----- | :----------------- |
| Base path to artifacts from the screenshoter plugin | string | test/__artifacts__ |

---

### --nyc.exclude

| Description | Type  | Default |
| :---------- | :---- | :------ |
|             | array | **      |

---

