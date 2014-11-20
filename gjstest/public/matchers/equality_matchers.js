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
 * Match any object. This matcher does not match non-present arguments in a mock
 * function call.
 *
 * @type {!gjstest.Matcher}
 */
gjstest._ = new gjstest.Matcher(
    'is anything',
    'is a unicorn',
    function(obj) { return true; }
);

/**
 * Match objects that have the same type as and are equal to rhs.
 *
 * Objects x and y are considered equal iff:
 *
 *  1. x is of the same type as y, x has a gjstestEquals method, and
 *     x.gjstestEquals(y) is true; or
 *
 *  2. x === y.
 *
 * Note that this means null and undefined are considered distinct since no type
 * folding is performed, and functions, objects, and arrays are compared by
 * reference rather than by value. That is, this will fail:
 *
 *     expectThat([1, 2], equals([1, 2]));  // Fails
 *
 * If you want that to pass, use recursivelyEquals below.
 *
 * @param {*} rhs
 * @return {!gjstest.Matcher}
 */
gjstest.equals = function(rhs) {
  var getDescription = function() {
    // Use the stringified object as the description, special casing types that
    // will be compared by reference.
    if (rhs instanceof Object && !rhs['gjstestEquals']) {
      return 'is a reference to: ' + gjstest.stringify(rhs);
    }

    return gjstest.stringify(rhs);
  };

  var getNegativeDescription = function() {
    if (rhs instanceof Object && !rhs['gjstestEquals']) {
      return 'is not a reference to: ' + gjstest.stringify(rhs);
    }

    return 'does not equal: ' + gjstest.stringify(rhs);
  };

  return new gjstest.Matcher(
      getDescription,
      getNegativeDescription,
      function(obj) {
        if (obj === rhs) return true;

        // Use the gjstestEquals method if provided, and obj and rhs are of the
        // same type.
        if (rhs instanceof Object &&
            obj instanceof Object &&
            rhs['gjstestEquals'] &&
            rhs.constructor == obj.constructor) {
          return rhs['gjstestEquals'](obj);
        }

        // Give a nicer error message in the event of references.
        if (rhs instanceof Object && obj instanceof Object) {
          return 'which is a reference to a different object';
        }

        return false;
      }
  );
};

/**
 * Match null (but not undefined or anything else null-ish).
 *
 * @type {!gjstest.Matcher}
 */
gjstest.isNull = new gjstest.Matcher(
    'is null',
    'is not null',
    function(obj) { return obj === null; }
);

/**
 * Match undefined (but not null or anything else undefined-ish).
 *
 * @type {!gjstest.Matcher}
 */
gjstest.isUndefined = new gjstest.Matcher(
    'is undefined',
    'is not undefined',
    function(obj) { return obj === undefined; }
);

/**
 * Recursively match an object or array. That is, for arrays/objects x and y the
 * following expectation:
 *
 *     expectThat(x, recursivelyEquals(y));
 *
 * passes iff the following holds:
 *
 *  1. The set of indices/keys in x is equal to the set of indices/keys in y.
 *
 *  2. For each index/key k in x:
 *    a) if x[k] is an Array or Object then x[k] is recursively equal to y[k]
 *       under this definition; or
 *
 *    b) if x[k] is an instance of gjstest.Matcher, then its predicate is
 *       satisfied by y[k]; or
 *
 *    c) y[k] satisfies equals(x[k]).
 *
 * Note that this matcher only compares raw Objects and Arrays recursively;
 * functions and instances of other classes that inherit from Object are still
 * compared by reference, unless it has a gjstestEquals method, which is then
 * used as the determinant of equality. The objects and arrays given to it must
 * be tree-like (i.e. no cyclic references and only a single path to each
 * element) to avoid infinite loops or exponential comparison time.
 *
 * @param {*} expected
 * @return {!gjstest.Matcher}
 */
gjstest.recursivelyEquals = function(expected) {
  // Make sure the argument is of the right type.
  if (!expected ||
      (expected.constructor != Array && expected.constructor != Object)) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError('recursivelyEquals requires a plain object or array');
  }

  // Make sure the argument has no cycles.
  if (gjstest.internal.containsCycle_(/** @type {!Object} */(expected))) {
    gjstest.internal.currentTestEnvironment.recordUserStack(1);
    throw new TypeError(
        'recursivelyEquals given a non-tree: ' + gjstest.stringify(expected));
  }

  var predicate = function(actual) {
    // Make sure the object is of the correct type.
    if (!actual || actual.constructor != expected.constructor) {
      return 'which is not an ' + expected.constructor.name;
    }

    // Compare the objects recursively, returning an error if one is found.
    var compareResult =
        gjstest.internal.compareRecursively_(
            /** @type {!Object} */(expected),
            actual,
            '');

    return compareResult || true;
  };

  var getDescription = function() {
    return 'recursively equals ' + gjstest.stringify(expected);
  };

  var getNegativeDescription = function() {
    return 'does not recursively equal ' + gjstest.stringify(expected);
  };

  return new gjstest.Matcher(
      getDescription,
      getNegativeDescription,
      predicate);
};

////////////////////////////////////////////////////////////////////////
// Implementation details
////////////////////////////////////////////////////////////////////////

/**
 * Decide whether the supplied object contains a cycle.
 *
 * @param {(!Object|!Array)} obj
 * @return {boolean}
 *
 * @private
 */
gjstest.internal.containsCycle_ = function(obj) {
  // Do a depth-first search of the object, regarding elements that aren't
  // Objects or Arrays as leaves and keeping track of the non-leaf nodes we've
  // already seen.
  for (var key in obj) {
    var node = obj[key];

    // Is this a leaf node?
    if (!node || (node.constructor != Object && node.constructor != Array)) {
      continue;
    }

    // Have we already seen this node?
    if (node.__gjstest_containsCycle_already_seen) return true;

    // Mark this node as having already been seen; clean up later.
    node.__gjstest_containsCycle_already_seen = true;

    // See if any of the node's children contain a reference to something we've
    // already seen.
    var foundCycle = gjstest.internal.containsCycle_(node);

    // Clean up the property we set above.
    delete node.__gjstest_containsCycle_already_seen;

    if (foundCycle) return true;
  }

  return false;
};

/**
 * Compare the two supplied objects recursively, keeping track of the full chain
 * of keys, for use in error messages.
 *
 * @param {(!Object|!Array)} lhs
 * @param {(!Object|!Array)} rhs
 * @param {string} keyPrefix
 * @return {string?}
 *
 * @private
 */
gjstest.internal.compareRecursively_ = function(lhs, rhs, keyPrefix) {
  // Iterate over the keys in lhs, checking each one against rhs.
  for (var key in lhs) {
    // Compute the full path to this key.
    var keyPath = keyPrefix ? keyPrefix + '.' + key : key;

    if (!(key in rhs)) {
      return 'which differs in key ' + keyPath;
    }

    // If the value for this key is not a plain Object or Array, compare it for
    // equality.
    var lhsValue = lhs[key];
    var rhsValue = rhs[key];

    // If the lhs is itself a matcher, invoke it.
    if (lhsValue instanceof gjstest.Matcher) {
      var matches = lhsValue.predicate(rhsValue);
      if (matches == true) continue;
      return 'which does not satisfy matcher for key ' + keyPath +
          ' (' + (matches || lhsValue.getNegativeDescription()) + ')';
    }

    if (!lhsValue ||
        (lhsValue.constructor != Object && lhsValue.constructor != Array)) {
      if (lhsValue === rhsValue) continue;

      // Use the gjstestEquals method if provided, and lhsValue and rhsValue are
      // of the same type.
      if (lhsValue instanceof Object &&
          rhsValue instanceof Object &&
          lhsValue['gjstestEquals'] &&
          lhsValue.constructor == rhsValue.constructor) {
        if (lhsValue['gjstestEquals'](rhsValue)) {
          continue;
        } else {
          return 'which differs in value for key ' + keyPath;
        }
      }

      // Return a special error for things that are compared by reference.
      if (lhsValue instanceof Object) {
        return 'which differs in reference for key ' + keyPath;
      }

      return 'which differs in value for key ' + keyPath;
    }

    // Otherwise, we'll want to compare recursively. Make sure that the rhs
    // value is of the same type.
    if (!rhsValue || rhsValue.constructor != lhsValue.constructor) {
      return 'which has wrong type for key ' + keyPath;
    }

    // Compare recursively.
    var subResult =
        gjstest.internal.compareRecursively_(lhsValue, rhsValue, keyPath);
    if (subResult) return subResult;
  }

  // rhs should also be a subset of lhs.
  for (var key in rhs) {
    // Compute the full path to this key.
    var keyPath = keyPrefix ? keyPrefix + '.' + key : key;

    if (!(key in lhs)) {
      return 'which differs in key ' + keyPath;
    }
  }

  return null;
};
