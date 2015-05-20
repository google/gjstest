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
 * Describe the supplied set of arguments to a mock function as a list of lines
 * to be displayed.
 *
 * @param {!Arguments} args
 *
 * @param {!function(*):!string} stringify
 *     A function that turns arbitrary objects into a convenient human-readable
 *     form.
 *
 * @return {!Array.<string>}
 *
 * @private
 */
gjstest.internal.describeArgs_ = function(args, stringify) {
  if (args.length == 0) return ['    (No arguments.)'];

  var result = [];
  for (var i = 0; i < args.length; ++i) {
    result.push('    Arg ' + i + ': ' + stringify(args[i]));
  }

  return result;
};

/**
 * Find the next active action for an expectation and return its function,
 * returning the empty function if none is available. If a one-time action is
 * chosen, mark it as expired.
 *
 * @param {!gjstest.internal.CallExpectation} expectation
 * @return {!Function}
 *
 * @private
 */
gjstest.internal.consumeAction_ = function(expectation) {
  // Is there an unexpired one-time action?
  for (var i = 0; i < expectation.oneTimeActions.length; ++i) {
    var action = expectation.oneTimeActions[i];
    if (!action.expired) {
      action.expired = true;
      return action.actionFunction;
    }
  }

  // Is there a fallback action?
  if (!!expectation.fallbackAction) {
    return expectation.fallbackAction.actionFunction;
  }

  // Fall back to the empty function.
  return function() {};
};

/**
 * Describe the matchers composing a call expectation as a list of lines to be
 * displayed.
 *
 * @param {!gjstest.internal.CallExpectation} expectation
 * @return {!Array.<string>}
 */
gjstest.internal.describeExpectation = function(expectation) {
  var result = [];
  var matchers = expectation.argMatchers;

  for (var i = 0; i < matchers.length; ++i) {
    var description = matchers[i].getDescription();
    result.push('    Arg ' + i + ': ' + description);
  }

  return result;
};

/**
 * Create a mock function that verifies against a list of expectation and takes
 * the appropriate action when called.
 *
 * @param {function(*):!string} stringify
 *     A function that turns arbitrary objects into a convenient human-readable
 *     form.
 *
 * @param {function(!Arguments, !gjstest.internal.CallExpectation):string?}
 *     checkArgs
 *     A function that knows how to check function call arguments against a call
 *     expectation, returning null if it matches and an error message otherwise.
 *
 * @param {function(string)} reportFailure
 *     A function that will be called with a descriptive error message in the
 *     event of failure.
 *
 * @param {string} opt_name
 *     A name for this mock function, used in unexpected call output.
 *
 * @return {!Function}
 */
gjstest.internal.createMockFunction =
    function(stringify, checkArgs, reportFailure, opt_name) {
  // Initialize a list of call expectations for this function.
  var callExpectations =
      /** @type !Array.<gjstest.internal.CallExpectation> */([]);

  // Create a function that checks its arguments against the expectations that
  // have been registered.
  var result = function() {
    // Check the arguments against each expectation, building up information
    // about why each didn't match. Each element of nonMatchInfo is an array
    // whose first element is the expectation that didn't match, and whose
    // second element is the failure message for that expectation.
    //
    // If some expectation does match, perform an action and return early.
    var nonMatchInfo = [];

    for (var i = callExpectations.length - 1; i >= 0; --i) {
      var expectation = /** @type {!gjstest.internal.CallExpectation} */ (
          callExpectations[i]);

      // Does this expectation match?
      var expectationFailureMessage = checkArgs(arguments, expectation);
      if (expectationFailureMessage === null) {
        ++expectation.numMatches;

        // Take the appropriate action.
        var actionFunc = gjstest.internal.consumeAction_(expectation);
        return actionFunc.apply(this, arguments);
      }

      nonMatchInfo.push([expectation, expectationFailureMessage]);
    }

    // We failed to match an expectation. Grab the calling stack frame.
    var stackFrames = gjstest.internal.getCurrentStack();
    var callingFrame = stackFrames[1];
    var frameDesc = callingFrame.fileName + ':' + callingFrame.lineNumber;

    // Build a failure message.
    var failureLines = [];

    if (opt_name) {
      failureLines.push(
          frameDesc + ': ' + 'Call to ' + opt_name +
          ' matches no expectation.');
    } else {
      failureLines.push(
          frameDesc + ': ' + 'Call matches no expectation.');
    }

    // Describe the arguments we were called with.
    failureLines = failureLines.concat(
        gjstest.internal.describeArgs_(arguments, stringify));

    // Add expectation descriptions.
    for (var i = 0; i < nonMatchInfo.length; ++i) {
      var expectation = nonMatchInfo[i][0];
      var expectationFailureMessage = nonMatchInfo[i][1];
      var stackFrame = expectation.stackFrame;

      failureLines.push('');
      failureLines.push(
          'Tried expectation at ' +
              stackFrame.fileName + ':' + stackFrame.lineNumber +
              ', but ' + expectationFailureMessage + ':');

      failureLines = failureLines.concat(
          gjstest.internal.describeExpectation(expectation));
    }

    // Add the stack trace, skipping the unexpected call itself.
    var errorStack = gjstest.internal.getCurrentStack().slice(1);
    failureLines.push('');
    failureLines.push('Stack:');
    failureLines.push(gjstest.internal.describeStack(errorStack));

    // Report the failure.
    reportFailure(failureLines.join('\n'));
  };

  // Add a reference to the list of expectations.
  result.__gjstest_expectations = callExpectations;

  return result;
};
