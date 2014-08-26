<g:plusone></g:plusone>

Google JS Test is a fast javascript unit testing framework that runs on the [http://code.google.com/p/v8/ V8 engine], without needing to launch a full browser. Features include:

  * Extremely fast test startup and execution time, without having to run a browser.
  * Clean, readable output in the case of both passing and failing tests.
  * A [http://code.google.com/p/google-js-test/wiki/FAQ#Can_I_use_a_browser_to_work_on_my_tests_locally? browser-based test runner] that can simply be refreshed whenever JS is changed.
  * Style and semantics that resemble [http://code.google.com/p/googletest/ Google Test] for C++.
  * A built-in mocking framework that requires minimal boilerplate code (e.g. no `$tearDown` or `$verifyAll`) with style and semantics based on the [http://code.google.com/p/googlemock/ Google C++ Mocking Framework].

The trade-off is that since tests are run in V8 without a browser, there is no DOM available. You can still use Google JS Test for tests of DOM-manipulating code however; see [http://code.google.com/p/google-js-test/wiki/IsItForMe "Is it for me?"] for more details.

<wiki:comment>
TODO(jacobsa): Create the Is it for me page and link it above.
</wiki:comment>

=Example=

Below is an example of a basic test for a class called `UserInfo`, which accepts a database lookup function in its constructor.

{{{
function UserInfoTest() {
  // Each test function gets its own instance of UserInfoTest, so tests can
  // use instance variables to store state that doesn't affect other tests.
  // There's no need to write a tearDown method, unless you modify global
  // state.
  //
  // Create an instance of the class under test here, giving it a mock
  // function that we also keep a reference to below.
  this.getInfoFromDb_ = createMockFunction();
  this.userInfo_ = new UserInfo(this.getInfoFromDb_);
}
registerTestSuite(UserInfoTest);

UserInfoTest.prototype.formatsUSPhoneNumber = function() {
  // Expect a call to the database function with the argument 0xdeadbeef. When
  // the call is received, return the supplied string.
  expectCall(this.getInfoFromDb_)(0xdeadbeef)
    .willOnce(returnWith('phone_number: "650 253 0000"'));

  // Make sure that our class returns correctly formatted output.
  expectEq('(650) 253-0000', this.userInfo_.getPhoneForId(0xdeadbeef));
};

UserInfoTest.prototype.returnsLastNameFirst = function() {
  expectCall(this.getInfoFromDb_)(0xdeadbeef)
    .willOnce(returnWith('given_name: "John" family_name: "Doe"'));

  // Make sure that our class puts the last name first.
  expectEq('Doe, John', this.userInfo_.getNameForId(0xdeadbeef));
};
}}}

The test's output is clean and readable:

{{{
[ RUN      ] UserInfoTest.formatsUSPhoneNumber
[       OK ] UserInfoTest.formatsUSPhoneNumber
[ RUN      ] UserInfoTest.returnsLastNameFirst
user_info_test.js:32
Expected: 'Doe, John'
Actual:   'John Doe'

[  FAILED  ] UserInfoTest.returnsLastNameFirst
[ RUN      ] UserInfoTest.understandsChineseNames
[       OK ] UserInfoTest.understandsChineseNames
}}}

=Getting Started=

See [http://code.google.com/p/google-js-test/wiki/Installing Installing] for information about installing Google JS Test on your system. Once you've done so, GettingStarted will take you through an end to end example of using Google JS Test. While writing your own tests, you can use the [http://code.google.com/p/google-js-test/wiki/Matchers Matchers] and [http://code.google.com/p/google-js-test/wiki/Mocking Mocking] pages for reference.
