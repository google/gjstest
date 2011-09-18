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
 * Match numbers that are greater than the supplied number.
 *
 * @param {number} x
 * @return {!gjstest.Matcher}
 */
gjstest.greaterThan = function(x) {
  if (typeof(x) != 'number') {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('greaterThan requires a number');
  }

  return new gjstest.Matcher(
      'is greater than ' + x,
      'is less than or equal to ' + x,
      function(actual) {
        return typeof(actual) == 'number' ?
            actual > x : 'which is not a number';
      });
};

/**
 * Match numbers that are greater than or equal to the supplied number.
 *
 * @param {number} x
 * @return {!gjstest.Matcher}
 */
gjstest.greaterOrEqual = function(x) {
  if (typeof(x) != 'number') {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('greaterOrEqual requires a number');
  }

  return new gjstest.Matcher(
      'is greater than or equal to ' + x,
      'is less than ' + x,
      function(actual) {
        return typeof(actual) == 'number' ?
            actual >= x : 'which is not a number';
      });
};

/**
 * Match numbers that are less than the supplied number.
 *
 * @param {number} x
 * @return {!gjstest.Matcher}
 */
gjstest.lessThan = function(x) {
  if (typeof(x) != 'number') {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('lessThan requires a number');
  }

  return new gjstest.Matcher(
      'is less than ' + x,
      'is greater than or equal to ' + x,
      function(actual) {
        return typeof(actual) == 'number' ?
            actual < x : 'which is not a number';
      });
};

/**
 * Match numbers that are less than or equal to the supplied number.
 *
 * @param {number} x
 * @return {!gjstest.Matcher}
 */
gjstest.lessOrEqual = function(x) {
  if (typeof(x) != 'number') {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('lessOrEqual requires a number');
  }

  return new gjstest.Matcher(
      'is less than or equal to ' + x,
      'is greater than ' + x,
      function(actual) {
        return typeof(actual) == 'number' ?
            actual <= x : 'which is not a number';
      });
};

/**
 * Match numbers that are within absoluteError of x.
 *
 * @param {number} x
 * @param {number} absoluteError
 * @return {!gjstest.Matcher}
 */
gjstest.isNearNumber = function(x, absoluteError) {
  if (typeof(x) != 'number' || typeof(absoluteError) != 'number') {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('isNearNumber requires two number arguments');
  }

  return new gjstest.Matcher(
      'is a number within ' + absoluteError + ' of ' + x,
      'is not a number within ' + absoluteError + ' of ' + x,
      function(actual) {
        if (typeof(actual) != 'number') return 'which is not a number';

        return Math.abs(x - actual) <= absoluteError;
      });
};
