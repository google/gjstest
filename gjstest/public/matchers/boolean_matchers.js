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

/**
 * A matcher for objects that evaluate to true.
 *
 * @type {gjstest.Matcher}
 */
gjstest.evalsToTrue = new gjstest.Matcher(
    'evaluates to true',
    'evaluates to false',
    function(obj) { return !!obj; }
);

/**
 * A matcher for objects that evaluate to false.
 *
 * @type {gjstest.Matcher}
 */
gjstest.evalsToFalse = new gjstest.Matcher(
    'evaluates to false',
    'evaluates to true',
    function(obj) { return !obj; }
);

/**
 * Invert the meaning of a matcher.
 *
 * @param {!gjstest.Matcher} matcher
 * @return {!gjstest.Matcher}
 */
gjstest.not = function(matcher) {
  if (!(matcher instanceof gjstest.Matcher)) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('not() requires a matcher');
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

/**
 * Match objects matched by either one of the matchers supplied.
 *
 * @param {!gjstest.Matcher} matcherA
 * @param {!gjstest.Matcher} matcherB
 * @return {!gjstest.Matcher}
 */
gjstest.or = function(matcherA, matcherB) {
  if (!(matcherA instanceof gjstest.Matcher) ||
      !(matcherB instanceof gjstest.Matcher)) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('or() requires a matcher');
  }

  // Wrap in functions that understand string errors, for convenience below.
  function predA(obj) {
    return matcherA.predicate(obj) === true;
  }

  function predB(obj) {
    return matcherB.predicate(obj) === true;
  }

  var result = new gjstest.Matcher(
      matcherA.description + ' or ' + matcherB.description,
      matcherA.negativeDescription + ' and ' + matcherB.negativeDescription,
      function(obj) {
        if (obj === gjstest.missingArgSentinel) {
          return (matcherA.understandsMissingArgs && predA(obj)) ||
                 (matcherB.understandsMissingArgs && predB(obj));
        }

        return predA(obj) || predB(obj);
      });
  result.understandsMissingArgs = true;

  return result;
};
