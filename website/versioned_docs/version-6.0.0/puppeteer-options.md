---
id: version-6.0.0-puppeteer-options
title: Puppeteer
original_id: puppeteer-options
---

## Options

### --presetEnv

| Description                                                                                | Type    | Default |
| :----------------------------------------------------------------------------------------- | :------ | :------ |
| Preset the test environment with Sinon, Chai, Sinon-Chai, Chai as promised and Chai subset | boolean | true    |

---

### --require

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Require path | array |         |

---

### --scope

| Description      | Type  | Default | Alias |
| :--------------- | :---- | :------ | ----- |
| Scope to package | array |         | s     |

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

### --testExt

| Description                       | Type   | Default               |
| :-------------------------------- | :----- | :-------------------- |
| Test file extensions glob pattern | string | *.{spec,test}.{js,ts} |

---

### --src

| Description                       | Type  | Default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :-------------------------------- | :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Glob pattern for all source files | array | commands/aw/**/*.{js,ts},commands/cdp/**/*.{js,ts},commands/cli/**/*.{js,ts},commands/node/**/*.{js,ts},commands/node-cli/**/*.{js,ts},commands/protractor/**/*.{js,ts},commands/puppeteer/**/*.{js,ts},commands/serve/**/*.{js,ts},examples/chrome-js/**/*.{js,ts},examples/chrome-ts/**/*.{js,ts},examples/node-js/**/*.{js,ts},examples/node-js-no-babel/**/*.{js,ts},examples/node-ts/**/*.{js,ts},examples/protractor/**/*.{js,ts},examples/puppeteer/**/*.{js,ts},examples/react/**/*.{js,ts},examples/webpack-dev-server/**/*.{js,ts},packages/register/**/*.{js,ts},packages/server/**/*.{js,ts},packages/transform/**/*.{js,ts},packages/transform-middleware/**/*.{js,ts},packages/utils/**/*.{js,ts},plugins/chai-plugin-screenshot/**/*.{js,ts},plugins/chai-plugin-snapshot/**/*.{js,ts},plugins/interactive-plugin/**/*.{js,ts},plugins/preset-plugin/**/*.{js,ts},plugins/watch-plugin/**/*.{js,ts},!**/node_modules/**,!./node_modules/** |

---

### --watch

| Description   | Type    | Default | Alias |
| :------------ | :------ | :------ | ----- |
| Watch changes | boolean | false   | w     |

---

### --watchGlob

| Description | Type  | Default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Alias |
| :---------- | :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| Watch glob  | array | commands/aw/**/*.{spec,test}.{js,ts},commands/cdp/**/*.{spec,test}.{js,ts},commands/cli/**/*.{spec,test}.{js,ts},commands/node/**/*.{spec,test}.{js,ts},commands/node-cli/**/*.{spec,test}.{js,ts},commands/protractor/**/*.{spec,test}.{js,ts},commands/puppeteer/**/*.{spec,test}.{js,ts},commands/serve/**/*.{spec,test}.{js,ts},examples/chrome-js/**/*.{spec,test}.{js,ts},examples/chrome-ts/**/*.{spec,test}.{js,ts},examples/node-js/**/*.{spec,test}.{js,ts},examples/node-js-no-babel/**/*.{spec,test}.{js,ts},examples/node-ts/**/*.{spec,test}.{js,ts},examples/protractor/**/*.{spec,test}.{js,ts},examples/puppeteer/**/*.{spec,test}.{js,ts},examples/react/**/*.{spec,test}.{js,ts},examples/webpack-dev-server/**/*.{spec,test}.{js,ts},packages/register/**/*.{spec,test}.{js,ts},packages/server/**/*.{spec,test}.{js,ts},packages/transform/**/*.{spec,test}.{js,ts},packages/transform-middleware/**/*.{spec,test}.{js,ts},packages/utils/**/*.{spec,test}.{js,ts},plugins/chai-plugin-screenshot/**/*.{spec,test}.{js,ts},plugins/chai-plugin-snapshot/**/*.{spec,test}.{js,ts},plugins/interactive-plugin/**/*.{spec,test}.{js,ts},plugins/preset-plugin/**/*.{spec,test}.{js,ts},plugins/watch-plugin/**/*.{spec,test}.{js,ts},!**/node_modules/**,!./node_modules/**,commands/aw/**/*.{js,ts},commands/cdp/**/*.{js,ts},commands/cli/**/*.{js,ts},commands/node/**/*.{js,ts},commands/node-cli/**/*.{js,ts},commands/protractor/**/*.{js,ts},commands/puppeteer/**/*.{js,ts},commands/serve/**/*.{js,ts},examples/chrome-js/**/*.{js,ts},examples/chrome-ts/**/*.{js,ts},examples/node-js/**/*.{js,ts},examples/node-js-no-babel/**/*.{js,ts},examples/node-ts/**/*.{js,ts},examples/protractor/**/*.{js,ts},examples/puppeteer/**/*.{js,ts},examples/react/**/*.{js,ts},examples/webpack-dev-server/**/*.{js,ts},packages/register/**/*.{js,ts},packages/server/**/*.{js,ts},packages/transform/**/*.{js,ts},packages/transform-middleware/**/*.{js,ts},packages/utils/**/*.{js,ts},plugins/chai-plugin-screenshot/**/*.{js,ts},plugins/chai-plugin-snapshot/**/*.{js,ts},plugins/interactive-plugin/**/*.{js,ts},plugins/preset-plugin/**/*.{js,ts},plugins/watch-plugin/**/*.{js,ts},!**/node_modules/**,!./node_modules/** | wg    |

---

### --coverage

| Description       | Type    | Default |
| :---------------- | :------ | :------ |
| Generate coverage | boolean | false   |

---

### --launch

| Description                 | Type    | Default |
| :-------------------------- | :------ | :------ |
| Launch or connect to Chrome | boolean | true    |

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

### --filter.puppeteer.packages

| Description                          | Type  | Default |
| :----------------------------------- | :---- | :------ |
| Filter packages for Puppeteer runner | array | **      |

---

### --filter.puppeteer.files

| Description                       | Type  | Default |
| :-------------------------------- | :---- | :------ |
| Filter files for Puppeteer runner | array | **      |

---

### --exit

| Description                                                            | Type    | Default |
| :--------------------------------------------------------------------- | :------ | :------ |
| Force its own process to exit once it was finished executing all tests | boolean | false   |

---

### --updateSnapshot

| Description      | Type    | Default | Alias |
| :--------------- | :------ | :------ | ----- |
| Update snapshots | boolean | false   | u     |

---

### --mocks

| Description                | Type  | Default           |
| :------------------------- | :---- | :---------------- |
| Automagically mock modules | array | *.{scss,less,css} |

---

### --mocha.reporter

| Description           | Type   | Default |
| :-------------------- | :----- | :------ |
| Which reporter to use | string |         |

---

### --mocha.bail

| Description      | Type    | Default |
| :--------------- | :------ | :------ |
| Bails on failure | boolean | true    |

---

### --mocha.timeout

| Description | Type   | Default |
| :---------- | :----- | ------: |
| Timeout     | number |    2000 |

---

### --nyc.hookRequire

| Description  | Type    | Default |
| :----------- | :------ | :------ |
| Hook require | boolean | false   |

---

### --nyc.hookRunInContext

| Description  | Type    | Default |
| :----------- | :------ | :------ |
| Hook require | boolean | false   |

---

### --nyc.hookRunInThisContext

| Description  | Type    | Default |
| :----------- | :------ | :------ |
| Hook require | boolean | false   |

---

### --nyc.require

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Require path | array |         |

---

### --nyc.include

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Include glob | array |         |

---

### --nyc.exclude

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Exclude glob | array | **      |

---

### --nyc.sourceMap

| Description                            | Type    | Default |
| :------------------------------------- | :------ | :------ |
| Sets if NYC should handle source maps. | boolean | false   |

---

### --nyc.tempDirectory

| Description                                     | Type   | Default                |
| :---------------------------------------------- | :----- | :--------------------- |
| Directory to output raw coverage information to | string | ./coverage/.nyc_output |

---

### --nyc.reporter

| Description                 | Type  | Default           |
| :-------------------------- | :---- | :---------------- |
| Coverage reporter(s) to use | array | lcov,text-summary |

---

### --nyc.reportDir

| Description                             | Type   | Default  |
| :-------------------------------------- | :----- | :------- |
| Directory to output coverage reports in | string | coverage |

---

### --interactive

| Description             | Type    | Default | Alias |
| :---------------------- | :------ | :------ | ----- |
| Run in interactive mode | boolean | false   | i     |

---

### --chrome.headless

| Description         | Type    | Default |
| :------------------ | :------ | :------ |
| Run chrome headless | boolean | true    |

---

### --chrome.args

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Chrome flags | array |         |

---

### --chrome.stable

| Description       | Type    | Default |
| :---------------- | :------ | :------ |
| Use stable Chrome | boolean | true    |

---

### --http.port

| Description              | Type   | Default |
| :----------------------- | :----- | ------: |
| Listen on this http port | number |    9677 |

---

### --httpServer

| Description             | Type    | Default |
| :---------------------- | :------ | :------ |
| Configure a http server | boolean | false   |

---

