# Integration test
Integration test is performed to expose defects in the interfaces and
interaction between integrated components.

## CLI commands
A set of CLI commands are included in after-work.js to execute different test runners and tools.

### aw-contract-tester
**aw-contract-tester** executes a defined service's endpoints and verifies them against given contracts.
```
aw-contract-tester --dir ./test/contracts/* --bin ./test/contract-runner.js
```
##### Arguments
  * `--dir`: Takes a glob pattern to a directory.
  * `--bin`: Takes a file-path to a runnable file responsible for starting your service.
