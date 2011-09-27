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
 * Match only non-present arguments. This is mostly useful in conjunction with
 * other matchers. For example:
 *
 *     // The second argument must be 23 if it's present, but it's okay for it
 *     // to not be present.
 *     expectCall(foo)(_, anyOf([notPresent, 23]));
 *
 * @type {!gjstest.Matcher}
 */
gjstest.notPresent = new gjstest.Matcher(
    'is not present',
    'is present',
    function(obj) { return obj === gjstest.missingArgSentinel; }
);

/** @inheritDoc */
gjstest.notPresent.understandsMissingArgs = true;

/**
 * Match anything, including non-present arguments. For example:
 *
 *     var foo = createMockFunction();
 *     expectCall(foo)(_, maybePresent)
 *         .willRepeatedly(function() {});
 *
 *     foo();               // Fails
 *     foo(17);             // Passes
 *     foo(17, 19);         // Passes
 *     foo(17, undefined);  // Passes
 *     foo(17, 19, 23);     // Fails
 *
 * @type {!gjstest.Matcher}
 */
gjstest.maybePresent = gjstest.anyOf([gjstest._, gjstest.notPresent]);

/**
 * Match the missing argument sentinel (see docs for gjstest.missingArgSentinel)
 * when it is actually fed to the relevant mock function, but not when it is
 * present due to a missing argument.
 *
 * This is supported by special-case logic in the guts of gjstest, and is useful
 * only for testing matchers that call other matchers. For an example, see
 * boolean_matchers_test.js.
 *
 * @type {!gjstest.Matcher}
 */
gjstest.isMissingArgSentinel =
    new gjstest.Matcher(
        'is the missing arg sentinel',
        'is not the missing arg sentinel',
        /** @type {function():boolean} */(function() {
          throw new Error('this predicate should never be called');
        }));
