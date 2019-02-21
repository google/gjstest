// Copyright 2010 Google Inc. All Rights Reserved.
// Author: jacobsa@google.com (Aaron Jacobs)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Helper functions for registering gjstest test cases. Use it as follows:
//
//     class MyTestFixture() {
//       // This constructor will be called for each test. Do per-test setup
//       // here.
//       constructor() {
//         this.objectUnderTest_ = ...;
//       }
//     }
//     registerTestSuite(MyTestFixture);
//
//     // Add a test case named returnsFalse to the fixture. The full name of
//     // test, as reported in the test output, is MyTestFixture.returnsFalse.
//     addTest(MyTestFixture, function returnsFalse() {
//       expectFalse(this.objectUnderTest_.bar());
//     });
//

/**
 * Register a test constructor to be executed by the test runner.
 *
 * Any enumerable property of ctor.prototype whose value is a function will be
 * treated as a test function, unless:
 *
 *  *  The property's name ends with an underscore. Use this to create private
 *     helper functions.
 *
 *  *  The property's name is 'tearDown'. This name is reserved for tear-down
 *     helpers. If you use leading-upper-case CamelCase for test names, you
 *     don't need to worry about this exception.
 *
 * Rather than attaching tests to ctor.prototype directly, consider using the
 * addTest function below. See its documentation for the benefits of doing so.
 *
 * @param {!Function} ctor
 *     A constructor for the test suite class.
 */
gjstest.registerTestSuite = function(ctor) {
  if (!(ctor instanceof Function)) {
    throw new TypeError('registerTestSuite() requires a function');
  }

  // Make sure this constructor hasn't already been registered.
  if (gjstest.internal.testSuites.indexOf(ctor) != -1) {
    throw new Error('Test suite already registered: ' + ctor.name);
  }

  gjstest.internal.testSuites.push(ctor);
};

/**
 * Add a test function to the supplied test suite. The function's name is used
 * to decide on the test name, so it must have one (see the top of the file for
 * an example).
 *
 * The function's name must not fit into one of the exceptions on test function
 * names listed above; in this case addTest will throw an error to make sure
 * that you realize your test will not be executed.
 *
 * Note that this function *does* correctly handle the case of magic property
 * names like 'constructor'. JS adds a 'constructor' property to Foo.prototype
 * for any function named Foo, but marks it as non-enumerable. The
 * non-enumerable bit is sticky, which means that if you simply say
 *
 *     MyTest.prototype.constructor = function() {
 *       expectTrue(false);
 *     };
 *
 * then the test function will never be run. In contrast, saying
 *
 *     addTest(MyTest, function constructor() {
 *       expectTrue(false);
 *     });
 *
 * will work as expected.
 *
 * @param {function(new:THIS)} testSuite
 *     The test suite class, which must have previously been registered with
 *     registerTestSuite.
 *
 * @param {function(this:THIS)} testFunc
 *     The test function.
 *
 * @template THIS
 */
gjstest.addTest = function(testSuite, testFunc) {
  // Check types.
  if (!(testSuite instanceof Function)) {
    throw new TypeError('addTest() requires a function for the test suite.');
  }

  if (!(testFunc instanceof Function)) {
    throw new TypeError('addTest() requires a function for the test function.');
  }

  // Make sure the suite has been registered.
  if (gjstest.internal.testSuites.indexOf(testSuite) == -1) {
    throw new Error('Test suite has not been registered: ' + testSuite.name);
  }

  // Make sure the test function's name is legal.
  var testFuncName = testFunc.name;
  if (!testFuncName) {
    throw new Error('Test functions must have names.');
  }

  if (/_$/.test(testFuncName) || testFuncName == 'tearDown') {
    throw new Error('Illegal test function name: ' + testFuncName);
  }

  // Make sure the test name hasn't already been used. We must check both for
  // the existence of the property and its enumerability because there may be a
  // default non-emurable property (e.g. 'constructor' or 'prototype').
  var suitePrototype = testSuite.prototype;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

  if (hasOwnProperty.apply(suitePrototype, [testFuncName]) &&
      propertyIsEnumerable.apply(suitePrototype, [testFuncName])) {
    throw new Error('Test function already registered: ' + testFuncName);
  }

  // Make sure the property is enumerable.
  Object.defineProperty(
      suitePrototype,
      testFuncName,
      {
        value: testFunc,
        writable: true,
        configurable: true,
        enumerable: true
      });
};

////////////////////////////////////////////////////////////////////////
// Implementation details
////////////////////////////////////////////////////////////////////////

/**
 * A list of test suites that have been registered.
 * @type {!Array.<!Function>}
 */
gjstest.internal.testSuites = [];

/**
 * Given a constructor and the name of a test method on that contructor, return
 * a function that will execute the test.
 *
 * @param {!Function} ctor
 * @param {string} propertyName
 * @return {function()}
 *
 * @private
 */
gjstest.internal.makeTestFunction_ = function(ctor, propertyName) {
  return function() {
    // Run the test, making sure we run the tearDown method, if any, regardless
    // of whether an error is thrown.
    try {
      var instance = new ctor();
      instance[propertyName]();
    } finally {
      // NOTE(jacobsa): We quote 'tearDown' to stop the complaining the JS
      // compiler does as of 2011-01-19.
      var tearDown = instance && instance['tearDown'];
      tearDown && tearDown.apply(instance);
    }
  };
};

/**
 * Given a constructor registered with registerTestSuite, return a map from full
 * test names (e.g. FooTest.doesBar) to functions that can be executed to run
 * the particular test.
 *
 * @param {!Function} ctor
 * @return {!Object.<function()>}
 */
gjstest.internal.getTestFunctions = function(ctor) {
  var result = {};

  function addTestFunction(name) {
    // Compute the full name for the test, and create a function that performs
    // the appropriate test.
    var fullName = ctor.name + '.' + name;
    result[fullName] = gjstest.internal.makeTestFunction_(ctor, name);
  }

  // Consider each enumerable key belonging directly to the constructor's
  // prototype.
  Object.keys(ctor.prototype).forEach(function(key) {
    // Skip this property if it's private or the tearDown method.
    if (/_$/.test(key) || key == 'tearDown') {
      return;
    }

    // Skip this property if it's not a function.
    if (!(ctor.prototype[key] instanceof Function)) {
      return;
    }

    addTestFunction(key);
  });

  return result;
};
