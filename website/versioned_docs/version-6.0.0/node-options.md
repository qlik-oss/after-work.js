---
id: version-6.0.0-node-options
title: Node
original_id: node-options
---

## Options

### --config

| Description         | Type   | Default | Alias |
| :------------------ | :----- | :------ | ----- |
| Path to config file | string |         | c     |

---

### --glob

| Description  | Type  | Default                |
| :----------- | :---- | :--------------------- |
| Glob pattern | array | test/**/*.spec.{js,ts} |

---

### --src

| Description                       | Type  | Default          |
| :-------------------------------- | :---- | :--------------- |
| Glob pattern for all source files | array | src/**/*.{js,ts} |

---

### --require

| Description  | Type  | Default |
| :----------- | :---- | :------ |
| Require path | array |         |

---

### --watch

| Description   | Type    | Default | Alias |
| :------------ | :------ | :------ | ----- |
| Watch changes | boolean | false   | w     |

---

### --watchGlob

| Description | Type  | Default                                 | Alias |
| :---------- | :---- | :-------------------------------------- | ----- |
| Watch glob  | array | src/**/*.{js,ts},test/**/*.spec.{js,ts} | wg    |

---

### --coverage

| Description       | Type    | Default |
| :---------------- | :------ | :------ |
| Generate coverage | boolean | false   |

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
| Timeout     | number |         |

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

| Description  | Type  | Default                                     |
| :----------- | :---- | :------------------------------------------ |
| Exclude glob | array | **/coverage/**,**/dist/**,**/*.spec.{js,ts} |

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

