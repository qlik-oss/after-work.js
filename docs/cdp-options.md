---
id: chrome-options
title: Chrome
---

## Options

### --presetEnv

| Description                                                           | Type    | Default |
| :-------------------------------------------------------------------- | :------ | :------ |
| Preset the test environment with Sinon, Chai, Sinon-Chai, Chai subset | boolean | true    |

---

### --config

| Description         | Type   | Default | Alias |
| :------------------ | :----- | :------ | ----- |
| Path to config file | string |         | c     |

---

### --url

| Description      | Type   | Default |
| :--------------- | :----- | :------ |
| Url to html file | string |         |

---

### --scope

| Description      | Type  | Default | Alias |
| :--------------- | :---- | :------ | ----- |
| Scope to package | array |         | s     |

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

### --srcExt

| Description                       | Type   | Default |
| :-------------------------------- | :----- | :------ |
| Test file extensions glob pattern | string |         |

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

| Description        | Type    | Default |
| :----------------- | :------ | :------ |
| Generate coverage? | boolean | false   |

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

### --transform.typescript.config

| Description            | Type   | Default       |
| :--------------------- | :----- | :------------ |
| Typescript config file | string | tsconfig.json |

---

### --transform.typescript.babelOptions

| Description              | Type   | Default         |
| :----------------------- | :----- | :-------------- |
| Typescript babel options | object | [object Object] |

---

### --transform.include

| Description                 | Type  | Default |
| :-------------------------- | :---- | :------ |
| Transform files with babel? | array |         |

---

### --transform.exclude

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Exclude glob | array |         |

---

### --transform.defaultExclude

| Description          | Type  | Default                                                                                                                                                                     |
| :------------------- | :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default exclude glob | array | **/node_modules/**,./node_modules/**,**/coverage/**,**/external/**,**/autogenerated/**,**/*.{html,css,json,txt,ttf,woff,svg,ico},**/*require*.js,**/*sinon*.js,**/*chai*.js |

---

### --mocha.bail

| Description      | Type    | Default |
| :--------------- | :------ | :------ |
| Bails on failure | boolean | true    |

---

### --mocha.ui

| Description    | Type   | Default |
| :------------- | :----- | :------ |
| Test interface | string | bdd     |

---

### --mocha.timeout

| Description | Type   | Default |
| :---------- | :----- | ------: |
| Timeout     | number |    2000 |

---

### --mocha.useColors

| Description          | Type    | Default |
| :------------------- | :------ | :------ |
| Use colors in output | boolean | true    |

---

### --mocha.reporter

| Description | Type   | Default |
| :---------- | :----- | :------ |
| Reporter    | string | min     |

---

### --client.port

| Description | Type   | Default |
| :---------- | :----- | ------: |
| Chrome port | number |    9222 |

---

### --chrome.launch

| Description   | Type    | Default |
| :------------ | :------ | :------ |
| Launch Chrome | boolean | true    |

---

### --chrome.devtools

| Description                | Type    | Default |
| :------------------------- | :------ | :------ |
| Open Chrome with dev tools | boolean | false   |

---

### --chrome.port

| Description | Type   | Default |
| :---------- | :----- | ------: |
| Chrome port | number |    9222 |

---

### --chrome.chromeFlags

| Description  | Type  | Default                                                 |
| :----------- | :---- | :------------------------------------------------------ |
| Chrome flags | array | --headless,--disable-gpu,--allow-file-access-from-files |

---

### --http.port

| Description              | Type   | Default |
| :----------------------- | :----- | ------: |
| Listen on this http port | number |    9676 |

---

### --http.root

| Description           | Type  | Default |
| :-------------------- | :---- | :------ |
| Root folders to serve | array | ./      |

---

### --http.rewrite

| Description    | Type   | Default         |
| :------------- | :----- | :-------------- |
| Rewrite url(s) | object | [object Object] |

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

### --nyc.exclude

| Description  | Type  | Default                                                                                                                                                                     |
| :----------- | :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exclude glob | array | **/node_modules/**,./node_modules/**,**/coverage/**,**/external/**,**/autogenerated/**,**/*.{html,css,json,txt,ttf,woff,svg,ico},**/*require*.js,**/*sinon*.js,**/*chai*.js |

---

### --interactive

| Description             | Type    | Default | Alias |
| :---------------------- | :------ | :------ | ----- |
| Run in interactive mode | boolean | false   | i     |

---

### --filter.chrome.packages

| Description                       | Type  | Default |
| :-------------------------------- | :---- | :------ |
| Filter packages for Chrome runner | array | **      |

---

### --filter.chrome.files

| Description                    | Type  | Default |
| :----------------------------- | :---- | :------ |
| Filter files for Chrome runner | array | **      |

---

