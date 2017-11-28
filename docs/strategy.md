# Getting the most out of after-work.js
[![Testing Pyramid](./Pyramid.png)](http://martinfowler.com/bliki/TestPyramid.html)

## Test on the right "level"
Always start testing on the lowest level (unit) to make your tests run as fast as possible (no setup), and as stable as possible (no dependencies). The following levels exist, where **unit** is the lowest level:
* unit: used for testing business logic and business rules without interaction with UI components at all.
* component: used for testing interaction with components on isolated part of the system (fixtures that contains stubs, spies, mocks).
* integration: used for testing interaction with components that communicates with peer components.
* system / end to end: used for testing a flow scenario of the whole product.

## Test your code and trust dependencies
The main purpose is to test the code you produce and not the dependencies. For example, if you have a functions that adds a class to an element using a framework, you should verify that the function that adds the class is called with the correct arguments. You should not verify that the element has the correct class in the DOM.

## Isolate as much as possible
* Sandboxes should be used for unit tests to ensure a clean starting state.
* Dependencies should be stubs or mocks, so that all calls to functions can be controlled and verified and that you do not need to have a full system running.

## Unit test
When running unit tests you should isolate your code so much that it could run in a controlled environment and asserted whether it behaves exactly as you expect.

## Component test
Component test should test a bigger part of the code than unit test, it should test something that gives value to the user but still limited to a "component". The definition of component is vague but it deliberately neglect parts of the system outside the scope of the test.

To isolate the components we use mocked data that is "injected" into the code or even a fixture to initiate the code to be tested.

If the code is to run inside a browser the fixture is often a html page to bootstrap the code.

## Integration test
Integration test is performed to expose defects in the interfaces and
interaction between integrated components.

## System / End 2 End test
System Testing is a level of the software testing where a complete and integrated software is tested from an enduser perspective.

### Best practices using Protractor
* Use a [Page Model/Object](http://martinfowler.com/bliki/PageObject.html).
  * Implement as ES6 class.
  * No assertions in page model.
* Use CSS as selector.
  * Preferred selector types are Type selectors (for example input, button) together with Class selector.
* Do not use callbacks. Selenium is promise based and Mocha is promise friendly. Mixing them is not considered best practices.