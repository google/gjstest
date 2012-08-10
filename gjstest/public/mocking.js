// Copyright 2011 Google Inc. All Rights Reserved.
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

/**
 * Create a new mock function that can be used with expectCall.
 *
 * @param {string} opt_name
 *     A name that will be used in 'unexpected call' errors, to aid in
 *     debugging.
 *
 * @return {!Function}
 */
gjstest.createMockFunction = function(opt_name) {
  gjstest.internal.currentTestEnvironment.recordUserStack(1);

  var result =
      gjstest.internal.createMockFunction(
          gjstest.stringify,
          gjstest.internal.checkArgsAgainstExpectation,
          gjstest.internal.currentTestEnvironment.reportFailure,
          opt_name);

  gjstest.internal.currentTestEnvironment.clearUserStack();

  return result;
};

/**
 * Given a constructor for a class, create an instance of that class that has
 * mock functions for each of the class's prototype methods.
 *
 * @param {!Function} ctor
 * @return {!Object}
 */
gjstest.createMockInstance = function(ctor) {
  gjstest.internal.currentTestEnvironment.recordUserStack(1);
  var result =
      gjstest.internal.createMockInstance(ctor, gjstest.createMockFunction);
  gjstest.internal.currentTestEnvironment.clearUserStack();

  return result;
};

/**
 * Begin an expectation for a call to a mock function, returning a function that
 * accepts the argument matchers for the call. To be used in the following
 * manner:
 *
 *     var foo = [some mock function];
 *
 *     [...]
 *
 *     expectCall(foo)('bar', atLeast(2))
 *         .willOnce(returnWith(17))
 *         .willOnce(returnWith(19));
 *
 * Expectations set with this function are automatically verified at the end of
 * the test.
 *
 * @param {!Function} mockFunc
 *     The mock function that should be called.
 *
 * @return {!Function}
 *     A function that should be called with argument matchers. It may also be
 *     given objects that should be matched exactly instead of matchers. Calling
 *     it with an object x is equivalent to calling it with gjstest.equals(x).
 */
gjstest.expectCall = function(mockFunc) {
  gjstest.internal.currentTestEnvironment.recordUserStack(1);

  // Make sure this is actually a mock function.
  var expectations = mockFunc &&
      /** @type {Array.<!gjstest.internal.CallExpectation>} */(
          mockFunc['__gjstest_expectations']);

  if (!expectations) {
    throw new TypeError('Supplied function is not a mock.');
  }

  // Return an appropriate stub that will accept argument expectations.
  var result = gjstest.internal.makeMockFunctionStub_(expectations);

  gjstest.internal.currentTestEnvironment.clearUserStack();
  return result;
};

////////////////////////////////////////////////////////////////////////
// Implementation details
////////////////////////////////////////////////////////////////////////

/**
 * Given a call expectation, create a wrapper with methods like times() and
 * willRepeatedly() that can be called to modify the expectation.
 *
 * @param {!gjstest.internal.CallExpectation} expectation
 * @return {Object}
 *
 * @private
 */
gjstest.internal.makeExpectationWrapper_ = function(expectation) {
  var result = {};

  result.times = function(n) {
    // Detect errors in the sequence of calls.
    if (expectation.expectedNumMatches != null) {
      throw new Error('times() has already been called.');
    }

    if (expectation.oneTimeActions.length != 0) {
      throw new Error('times() called after willOnce().');
    }

    if (expectation.fallbackAction != null) {
      throw new Error('times() called after willRepeatedly().');
    }

    // Record the number.
    expectation.expectedNumMatches = n;

    // Allow chaining.
    return result;
  };

  result.willRepeatedly = function(func) {
    if (expectation.fallbackAction != null) {
      throw new Error('willRepeatedly() has already been called.');
    }

    expectation.fallbackAction = new gjstest.internal.MockAction(func);

    // Allow chaining.
    return result;
  };

  result.willOnce = function(func) {
    if (expectation.fallbackAction != null) {
      throw new Error('willOnce() called after willRepeatedly().');
    }

    expectation.oneTimeActions.push(new gjstest.internal.MockAction(func));

    // Allow chaining.
    return result;
  };

  return result;
};

/**
 * Given an array into which to store expectations, create a function that, when
 * called with matchers or values, will create an appropriate expectation and
 * save it into that array and the global list of registered expectations.
 *
 * @param {!Array.<gjstest.internal.CallExpectation>} expectations
 * @return {!function()}
 *
 * @private
 */
gjstest.internal.makeMockFunctionStub_ = function(expectations) {
  return function() {
    // Convert each argument to a matcher.
    var matchers = [];
    for (var i = 0; i < arguments.length; ++i) {
      // Is this already a matcher?
      var arg = arguments[i];
      matchers.push(arg instanceof gjstest.Matcher ? arg : gjstest.equals(arg));
    }

    // Create a call expectation. Add to it the stack frame before this one,
    // which is the frame in the test that created this expectation.
    var stackFrames = gjstest.internal.getCurrentStack();
    var expectation =
        new gjstest.internal.CallExpectation(
            matchers,
            stackFrames[1]);

    // Register the expectation.
    expectations.push(expectation);
    gjstest.internal.registeredCallExpectations.push(expectation);

    // Return an object with additional methods that can be called to modify the
    // expectation.
    return gjstest.internal.makeExpectationWrapper_(expectation);
  };
};

/**
 * A list of mock expectations that have been created, for use by the test
 * runner in verifying whether or not all expectations were fulfilled.
 *
 * @type {!Array.<!gjstest.internal.CallExpectation>}
 */
gjstest.internal.registeredCallExpectations = [];
