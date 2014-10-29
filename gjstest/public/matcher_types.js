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
 * A function that implicitly creates a set of objects that are matched by a
 * matcher, returning true for matched objects and false for others. This is
 * distinct from gjstest.Matcher, which has other (implementation detail)
 * properties.
 *
 * In the case of an object that doesn't match, instead of returning false the
 * function may optionally return a string containing a relative clause that
 * describes why the object didn't match.
 *
 * For example, a predicate that matches arrays of length 2 may, when supplied
 * with an array of length 3, return the following string:
 *
 *     'which has length 3'
 *
 * Then the failure message may look like:
 *
 *     Expected: array of length 2
 *     Actual: [1, 2, 3], which has length 3
 *
 * If it instead simply returned false, the message might be:
 *
 *     Expected: array of length 2
 *     Actual: [1, 2, 3]
 *
 * @typedef {function(*):(boolean|string)}
 */
gjstest.Predicate;

/**
 * An object that can be used with expectThat and mock call expecations. It
 * primarily consists of a predicate, but has other properties as internal
 * implementation details.
 *
 * @param {string} description
 *     A verb phrase describing the property a value matching this matcher
 *     should have, where the subject is the value. For example, "is greater
 *     than 7", or "has 7 elements".
 *
 * @param {string} negativeDescription
 *     A verb phrase describing the negation of the property a value matching
 *     this matcher should have, where the subject is the value. For example,
 *     "is less than or equal to 7", or "doesn't have 7 elements".
 *
 * @param {!gjstest.Predicate} predicate
 *     A predicate defining the set of values that should be matched.
 *
 * @constructor
 */
gjstest.Matcher = function(description, negativeDescription, predicate) {
  this.getDescription = function() { return description; };
  this.getNegativeDescription = function() { return negativeDescription; };
  this.predicate = predicate;

  // TODO(b/18146974): Delete these two statements when the properties are
  // deleted.
  this.description = this.getDescription();
  this.negativeDescription = this.getNegativeDescription();
};

/**
 * A function that returns a description of objects matched by this matcher.
 * @type {function():string}
 */
gjstest.Matcher.prototype.getDescription;

/**
 * A function that returns a description of objects not matched by this matcher.
 * @type {function():string}
 */
gjstest.Matcher.prototype.getNegativeDescription;

/**
 * The predicate that defines the set of objects matched by this matcher.
 * @type {!gjstest.Predicate}
 */
gjstest.Matcher.prototype.predicate;

/**
 * DEPRECATED: Do not use.
 * TODO(b/18146974): Delete this when it's no longer used.
 *
 * @type {string}
 */
gjstest.Matcher.prototype.description;

/**
 * DEPRECATED: Do not use.
 * TODO(b/18146974): Delete this when it's no longer used.
 *
 * @type {string}
 */
gjstest.Matcher.prototype.negativeDescription;

/**
 * Does this matcher understand missing arguments?
 *
 * By default, a matcher in a mock call expecation is not even consulted when
 * the corresponding argument is missing. By setting this to true, you indicate
 * that the matcher's predicate will check potential objects against
 * gjstest.missingArgSentinel, and do the appropriate thing.
 *
 * For example, a notPresent matcher would return true iff the supplied object
 * is equal to gjstest.missingArgSentinel.
 *
 * @type {boolean}
 */
gjstest.Matcher.prototype.understandsMissingArgs = false;

/**
 * A special sentinel object for missing arguments in mock function calls, used
 * for implementing matching of missing arguments. See
 * Matcher.prototype.understandsMissingArgs.
 *
 * @type {!Object}
 */
gjstest.missingArgSentinel = {
  /** @return {string} */
  toString: function() { return '(missing)'; }
};
