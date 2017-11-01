# This is a sample for requirejs

## From the project root run

```shell
./src/cli.js chrome --url examples/requirejs/index.html --glob examples/requirejs/*.spec.js
```

## Generating coverage

To be able to generate coverage we need to serve the files with a http server and instrument the source files

```shell
./src/cli.js chrome --url http://localhost:9676/examples/requirejs/index.html --glob examples/requirejs/*.spec.js --coverage
```
