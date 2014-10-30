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

// Internal implementation of expectThat.

/**
 * Verify an expectation, reporting failure when appropriate.
 *
 * @param {*} obj
 *     The object that should satisfy the supplied predicate.
 *
 * @param {!gjstest.Matcher} matcher
 *     A matcher that the supplied object should satisfy.
 *
 * @param {function(*):!string} stringify
 *     A function that turns arbitrary objects into a convenient human-readable
 *     form.
 *
 * @param {function(string)} reportFailure
 *     A function that will be called with a descriptive error message in the
 *     event of failure.
 *
 * @param {string|undefined} errorMessage
 *     An optional error message to report with a failure.
 */
gjstest.internal.expectThat = function(
    obj,
    matcher,
    stringify,
    reportFailure,
    errorMessage) {
  // Ask the matcher about the object.
  var predicateResult = matcher.predicate(obj);

  // If the matcher says the object is okay, we're done.
  if (predicateResult === true) return;

  // Describe the failure.
  var failureMessage = '';

  failureMessage += 'Expected: ' + matcher.getDescription() + '\n';
  failureMessage += 'Actual:   ' + stringify(obj);

  // Add a clause like "which has length 7" if one is available.
  if (typeof(predicateResult) == 'string') {
    failureMessage += ', ' + predicateResult;
  }

  if (errorMessage != null) {
    failureMessage += '\n' + errorMessage;
  }

  // Report the failure.
  reportFailure(failureMessage);
};
