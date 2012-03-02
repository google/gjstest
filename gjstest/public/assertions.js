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

// Public assertion functions. They merely call the internal versions.

/**
 * Check that the supplied object matches the given matcher, reporting a failed
 * test (and continuing) if not.
 *
 * @param {*} obj
 *     The object to be verified.
 *
 * @param {!gjstest.Matcher} matcher
 *     The matcher against which to verify the object.
 *
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectThat = function(obj, matcher, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      obj,
      matcher,
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(actual, equals(expected))
 *
 * @param {*} expected
 * @param {*} actual
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectEq = function(expected, actual, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      actual,
      gjstest.equals(expected),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(actual, not(equals(expected)))
 *
 * @param {*} expected
 * @param {*} actual
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectNe = function(expected, actual, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      actual,
      gjstest.not(gjstest.equals((expected))),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(a, lessThan(b))
 *
 * @param {number} a
 * @param {number} b
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectLt = function(a, b, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      a,
      gjstest.lessThan(b),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(actual, lessOrEqual(b))
 *
 * @param {number} a
 * @param {number} b
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectLe = function(a, b, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      a,
      gjstest.lessOrEqual(b),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(a, greaterThan(b))
 *
 * @param {number} a
 * @param {number} b
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectGt = function(a, b, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      a,
      gjstest.greaterThan(b),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(a, greaterOrEqual(b))
 *
 * @param {number} a
 * @param {number} b
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectGe = function(a, b, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      a,
      gjstest.greaterOrEqual(b),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(actual, equals(false))
 *
 * @param {*} actual
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectFalse = function(actual, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      actual,
      gjstest.equals(false),
      errorMessage);
};

/**
 * Equivalent to:
 *     expectThat(actual, equals(true))
 *
 * @param {*} actual
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 */
gjstest.expectTrue = function(actual, errorMessage) {
  gjstest.internal.callInternalExpectThat_(
      actual,
      gjstest.equals(true),
      errorMessage);
};

///////////////////////////
// Implementation details
///////////////////////////

/**
 * Call the internal expectThat with the appropriate dependencies.
 *
 * @param {*} obj
 * @param {!gjstest.Matcher} matcher
 * @param {string=} errorMessage
 *     An optional error message to report on a failed expectation.
 *
 * @private
 */
gjstest.internal.callInternalExpectThat_ =
    function(
        obj,
        matcher,
        errorMessage) {
  var testEnvironment = gjstest.internal.currentTestEnvironment;
  if (!testEnvironment) {
    throw new Error('No test environment registered');
  }

  // Our stack looks like this:
  //
  //     callInternalExpectThat_
  //     gjstest.expectThat (or expectEq, etc)
  //     (user code)
  //
  testEnvironment.recordUserStack(2);

  gjstest.internal.expectThat(
      obj,
      matcher,
      gjstest.stringify,
      testEnvironment.reportFailure,
      errorMessage);

  testEnvironment.clearUserStack();
};
