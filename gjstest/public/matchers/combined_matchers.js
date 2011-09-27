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
  return null;
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
  return null;
};
