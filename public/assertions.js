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
 */
gjstest.expectThat = function(obj, matcher) {
  gjstest.internal.callInternalExpectThat_(obj, matcher);
};

/**
 * Equivalent to:
 *     expectThat(actual, equals(expected))
 *
 * @param {*} expected
 * @param {*} actual
 */
gjstest.expectEq = function(expected, actual) {
  gjstest.internal.callInternalExpectThat_(actual, gjstest.equals(expected));
};

/**
 * Equivalent to:
 *     expectThat(actual, not(equals(expected)))
 *
 * @param {*} expected
 * @param {*} actual
 */
gjstest.expectNe = function(expected, actual) {
  gjstest.internal.callInternalExpectThat_(
      actual,
      gjstest.not(gjstest.equals((expected))));
};

/**
 * Equivalent to:
 *     expectThat(a, lessThan(b))
 *
 * @param {number} a
 * @param {number} b
 */
gjstest.expectLt = function(a, b) {
  gjstest.internal.callInternalExpectThat_(a, gjstest.lessThan(b));
};

/**
 * Equivalent to:
 *     expectThat(actual, lessOrEqual(b))
 *
 * @param {number} a
 * @param {number} b
 */
gjstest.expectLe = function(a, b) {
  gjstest.internal.callInternalExpectThat_(a, gjstest.lessOrEqual(b));
};

/**
 * Equivalent to:
 *     expectThat(a, greaterThan(b))
 *
 * @param {number} a
 * @param {number} b
 */
gjstest.expectGt = function(a, b) {
  gjstest.internal.callInternalExpectThat_(a, gjstest.greaterThan(b));
};

/**
 * Equivalent to:
 *     expectThat(a, greaterOrEqual(b))
 *
 * @param {number} a
 * @param {number} b
 */
gjstest.expectGe = function(a, b) {
  gjstest.internal.callInternalExpectThat_(a, gjstest.greaterOrEqual(b));
};

/**
 * Equivalent to:
 *     expectThat(actual, equals(false))
 *
 * @param {*} actual
 */
gjstest.expectFalse = function(actual) {
  gjstest.internal.callInternalExpectThat_(actual, gjstest.equals(false));
};

/**
 * Equivalent to:
 *     expectThat(actual, equals(true))
 *
 * @param {*} actual
 */
gjstest.expectTrue = function(actual) {
  gjstest.internal.callInternalExpectThat_(actual, gjstest.equals(true));
};

///////////////////////////
// Implementation details
///////////////////////////

/**
 * Call the internal expectThat with the appropriate dependencies.
 *
 * @param {*} obj
 * @param {!gjstest.Matcher} matcher
 *
 * @private
 */
gjstest.internal.callInternalExpectThat_ = function(obj, matcher) {
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
      testEnvironment.reportFailure);

  testEnvironment.clearUserStack();
};
