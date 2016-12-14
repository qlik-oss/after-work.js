# System / End 2 End test
System Testing is a level of the software testing where a complete and integrated software is tested from an enduser perspective.

## CLI commands
A set of CLI commands are included in after-work.js to execute different test runners and tools.

See [aw-webdriver-test-runner](component.md)

## Best practices
* Use a [Page Model/Object](http://martinfowler.com/bliki/PageObject.html).
  * Implement as ES6 class.
  * No assertions in page model.
* Use CSS as selector.
  * Preferred selector types are Type selectors (for example input, button) together with Class selector.
* Do not use callbacks. Selenium is promise based and Mocha is promise friendly. Mixing them is not considered best practices.
