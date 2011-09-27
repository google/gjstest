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
 * Match objects that match all of the matchers in the supplied array. If an
 * element x of the array is not an instance of gjstest.Matcher, it will be
 * treated as the matcher equals(x). If the array is empty, all objects are
 * matched.
 *
 * For example:
 *
 *     expectThat(17, allOf([greaterThan(10), lessThan(20)]));  // Passes
 *     expectThat(17, allOf([greaterThan(17), lessThan(20)]));  // Fails
 *     expectThat('taco', allOf([containsRegExp(/t/), not(isNull)]));  // Passes
 *
 * @param {!Array} matchers
 *     An array of matchers, all of which the candidate must match. If an
 *     element x is not a gjstest.Matcher, it is treated as the matcher
 *     equals(x).
 *
 * @return {!gjstest.Matcher}
 */
gjstest.allOf = function(matchers) {
  if (!(matchers instanceof Array)) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('allOf requires an array.');
  }

  // Special case: an empty array should match anything. (The statement "for
  // each matcher M in S, M matches x" is true for any x when S is empty.)
  if (matchers.length == 0) {
    return gjstest._;
  }

  // Special case: if there is a single matcher in the array, just use that.
  if (matchers.length == 1 && matchers[0] instanceof gjstest.Matcher) {
    return matchers[0];
  }

  // Special case: if there is a single value x in the array, just use equal(x).
  if (matchers.length == 1) {
    return gjstest.equals(matchers[0]);
  }

  // Otherwise, build an appropriate description.
  var descriptions = [];
  var negativeDescriptions = [];

  for (var i = 0; i < matchers.length; ++i) {
    descriptions[i] = matchers[i].description;
    negativeDescriptions[i] = matchers[i].negativeDescription;
  }

  return new gjstest.Matcher(
      descriptions.join(', and '),
      negativeDescriptions.join(', or '),
      function(candidate) {
        for (var i = 0; i < matchers.length; ++i) {
          var result = matchers[i].predicate(candidate);
          if (result == false || typeof(result) == 'string') {
            return result;
          }
        }

        return true;
      });
};

/**
 * Match objects that match any of the matchers in the supplied array. If an
 * element x of the array is not an instance of gjstest.Matcher, it will be
 * treated as the matcher equals(x). If the array is empty, no objects are
 * matched.
 *
 * For example:
 *
 *     expectThat(1, anyOf([lessThan(2), greaterThan(3)]));  // Passes
 *     expectThat('taco', anyOf(['burrito', containsRegExp(/tac/)]));  // Passes
 *     expectThat(1, anyOf([]));  // Fails
 *     expectThat(null, anyOf([undefined]));  // Fails
 *
 * @param {!Array} matchers
 *     An array of matchers, one of which the candidate must match. If an
 *     element x is not a gjstest.Matcher, it is treated as the matcher
 *     equals(x).
 *
 * @return {!gjstest.Matcher}
 */
gjstest.anyOf = function(matchers) {
  if (!(matchers instanceof Array)) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('anyOf requires an array.');
  }

  // Special case: an empty array should match nothing. (The statement "there
  // exists a matcher M in S such that M matches x" is false for any x when S is
  // empty.
  if (matchers.length == 0) {
    return gjstest.not(gjstest._);
  }

  // Special case: if there is a single matcher in the array, just use that.
  if (matchers.length == 1 && matchers[0] instanceof gjstest.Matcher) {
    return matchers[0];
  }

  // Special case: if there is a single value x in the array, just use equal(x).
  if (matchers.length == 1) {
    return gjstest.equals(matchers[0]);
  }

  // Otherwise, build an appropriate description.
  var descriptions = [];
  var negativeDescriptions = [];

  for (var i = 0; i < matchers.length; ++i) {
    descriptions[i] = matchers[i].description;
    negativeDescriptions[i] = matchers[i].negativeDescription;
  }

  return new gjstest.Matcher(
      descriptions.join(', or '),
      negativeDescriptions.join(', and '),
      function(candidate) {
        for (var i = 0; i < matchers.length; ++i) {
          var result = matchers[i].predicate(candidate);
          if (result == true) {
            return true;
          }
        }

        return false;
      });
};

/**
 * Invert the meaning of a matcher. If the argument is not a gjstest.Matcher, it
 * will be treated as the matcher equals(x).
 *
 * @param {Object} x
 *     A matcher, or an object to be treated as the matcher equals(x).
 *
 * @return {!gjstest.Matcher}
 */
gjstest.not = function(x) {
  // Wrap the value if it's not a matcher.
  var matcher = x;
  if (!(matcher instanceof gjstest.Matcher)) {
    matcher = gjstest.equals(x);
  }

  return new gjstest.Matcher(
      matcher.negativeDescription,
      matcher.description,
      function(obj) {
        // Ask the inner matcher.
        var innerResult = matcher.predicate(obj);

        // Regard an error string as equivalent to false.
        if (typeof(innerResult) == 'string') {
          innerResult = false;
        }

        // Invert the result.
        return !innerResult;
      });
};
