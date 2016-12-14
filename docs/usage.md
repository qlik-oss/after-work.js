# Using after-work.js

## Tools
The following tools are bundled into after-work.js:
* **Mocha**: an extensible testing framework for TDD or BDD.
* **Chai**: an assertion library used together with a JavaScript testing framework.
* **Sinon**: a framework for standalone test spies, stubs and mocks for JavaScript.
* **Protractor**: a framework that utilizes Selenium for GUI tests in all major browsers.
* **Istanbul**: a JavaScript code coverage tool written in JavaScript.

## Test on the right "level"
Always start testing on the lowest level (unit) to make your tests run as fast as possible (no setup), and as stable as possible (no dependencies). The following levels exist, where **unit** is the lowest level:
* [unit](unit.md): used for testing business logic and business rules without interaction with UI components at all.
* [component](component.md): used for testing interaction with components on isolated part of the system (fixtures that contains stubs, spies, mocks).
* [integration](integration.md): used for testing interaction with components that communicates with peer components.
* [system / end to end](e2e.md): used for testing a flow scenario of the whole product.

## Test your code and trust dependencies
The main purpose is to test the code you produce and not the dependencies. For example, if you have a functions that adds a class to an element using a framework, you should verify that the function that adds the class is called with the correct arguments. You should not verify that the element has the correct class in the DOM.

## Isolate as much as possible
* Sandboxes should be used for unit tests to ensure a clean starting state.
* Dependencies should be stubs or mocks, so that all calls to functions can be controlled and verified and that you do not need to have a full system running.

## Package.json scripts
All the different CLI commands can be used inside a script-object defined in your package.json for easy executions.

```sh
"test:unit": "aw-test-runner ./test/unit",
"test:unit:watch": "aw-test-runner ./test/unit -w",
```
