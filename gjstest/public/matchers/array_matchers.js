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
 * Return true if the object can be iterated like an array.
 *
 * @param {*} obj
 * @return {boolean}
 */
gjstest.internal.isArrayLike = function(obj) {
  if (!obj) {
    return false;
  }

  return (obj instanceof Array) ||
      (typeof obj == 'object' && typeof obj.length == 'number');
}

/**
 * Match arrays and Arguments objects with the same length as matchers, whose
 * corresponding elements match each corresponding matcher.
 *
 * For example:
 *
 *     var foo = createMockFunction();
 *     expectCall(foo)('bar', elementsAre([_, 2, evalsToFalse]));
 *
 *     foo('bar', [1, 2, null]);   // Matches
 *     foo('bar', [1, 3, null]);   // Doesn't match
 *     foo('bar', [1, 2, 'baz']);  // Doesn't match
 *
 * @param {!Array|{length:number}} matchers
 *     An array-like list of matchers that the elements of the array must
 *     satisfy. If an element x is not a gjstest.Matcher, it is treated as the
 *     matcher equals(x).
 *
 * @return {!gjstest.Matcher}
 */
gjstest.elementsAre = function(matchers) {
  if (!gjstest.internal.isArrayLike(matchers)) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('elementsAre requires an array or Arguments argument.');
  }

  // Iteratively build up a description that looks like:
  //
  //     [ anything, 2, object evaluating to false ]
  //
  // as well as a transformed list of matchers where we've substituted equals(x)
  // for each raw x.
  var matcherDescriptions = [];
  var transformedMatchers = [];

  for (var i = 0; i < matchers.length; ++i) {
    var val = matchers[i];

    // Is this actually a matcher?
    if (val && val instanceof gjstest.Matcher) {
      matcherDescriptions.push(val.getDescription());
      transformedMatchers.push(val);
      continue;
    }

    // Otherwise, use equals(val).
    matcherDescriptions.push(gjstest.stringify(val));
    transformedMatchers.push(gjstest.equals(val));
  }

  var description =
      'is an array or Arguments object of length ' + matchers.length +
      ' with elements matching: [ ' + matcherDescriptions.join(', ') + ' ]';

  var negativeDescription = description.replace('is an', 'is not an');

  // Special case.
  if (matchers.length == 0) {
    description = 'is an empty array or Arguments object';
    negativeDescription = 'is not an empty array or Arguments object';
  }

  return new gjstest.Matcher(
      description,
      negativeDescription,
      function(obj) {
        // Is this object an array or Arguments object of the appropriate
        // length?
        if (!gjstest.internal.isArrayLike(obj)) {
          return "which isn't an array or Arguments object";
        } else if (obj.length !== transformedMatchers.length) {
          return 'which has length ' + obj.length;
        }

        // Does each component matcher match?
        for (var i = 0; i < obj.length; ++i) {
          var matcher = transformedMatchers[i];
          var predicateResult = matcher.predicate(obj[i]);

          if (!predicateResult || typeof(predicateResult) == 'string') {
            return 'whose element ' + i + " doesn't match";
          }
        }

        // Everything checks out.
        return true;
      }
  );
};

/**
 * Match arrays and Arguments objects that contain an element matching the
 * supplied argument.
 *
 * For example:
 *
 *     var foo = createMockFunction();
 *     expectCall(foo)('bar', contains(lessOrEqual(2)));
 *
 *     foo('bar', [null, 2]);   // Matches
 *     foo('bar', [null, 3]);   // Doesn't match
 *
 * @param {*} x
 *     A matcher that an element of the array must satisfy. If this is not a
 *     gjstest.Matcher, it is treated as the matcher equals(x).
 *
 * @return {!gjstest.Matcher}
 */
gjstest.contains = function(x) {
  // Is this actually a matcher?
  var matcher;
  var nounPhrase;
  if (x && x instanceof gjstest.Matcher) {
    matcher = x;
    nounPhrase = 'an element that ' + matcher.getDescription();
  } else {
    matcher = gjstest.equals(x);
    nounPhrase = gjstest.stringify(x);
  }

  return new gjstest.Matcher(
      'is an array or Arguments object containing ' + nounPhrase,
      'is not an array or Arguments object containing ' + nounPhrase,
      function(candidate) {
        if (!gjstest.internal.isArrayLike(candidate)) {
          return "which isn't an array or Arguments object";
        }

        var predicate = matcher.predicate;
        for (var i = 0; i < candidate.length; ++i) {
          if (predicate(candidate[i]) === true) {
            return true;
          }
        }

        return false;
      });
};

/**
 * Match arrays that match a wrapped matcher when their values are sorted using
 * Array.sort. This is useful for asserting expectations about the contents of
 * an array whose order is undefined.
 *
 * For example:
 *
 *     // Passes
 *     expectThat([19, 17, 23], whenSorted(elementsAre([17, 19, 23])));
 *
 * @param {!gjstest.Matcher} matcher
 *     A matcher whose predicate will be passed the sorted value.
 *
 * @return {!gjstest.Matcher}
 */
gjstest.whenSorted = function(matcher) {
  if (!(matcher instanceof gjstest.Matcher)) {
    throw new TypeError('The argument to whenSorted must be a matcher.');
  }

  return new gjstest.Matcher(
      'when sorted, ' + matcher.getDescription(),
      'when sorted, ' + matcher.getNegativeDescription(),
      function(candidate) {
        if (!(candidate instanceof Array)) {
          return 'which isn\'t an array';
        }

        // Avoid modifying the candidate by making a copy.
        var sorted = candidate.concat([]);
        sorted.sort();

        if (matcher.predicate(sorted) == true) {
          return true;
        }

        return false;
      });
};
