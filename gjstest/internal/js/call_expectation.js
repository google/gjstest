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
 * An expectation for a set of calls to a mock function, and a set of actions to
 * be taken when those calls are made.
 *
 * @param {!Array.<!gjstest.Matcher>} argMatchers
 *     Matchers for the expected arguments for this call.
 *
 * @param {!gjstest.internal.StackFrame} stackFrame
 *     The stack frame at which this expectaiton was created.
 *
 * @constructor
 */
gjstest.internal.CallExpectation = function(argMatchers, stackFrame) {
  this.argMatchers = argMatchers;
  this.stackFrame = stackFrame;
  this.expectedNumMatches = null;
  this.oneTimeActions = [];
  this.fallbackAction = null;
  this.numMatches = 0;
};

/**
 * An array of matchers representing the arguments that match this expectation.
 *
 * @type {!Array.<!gjstest.Matcher>}
 */
gjstest.internal.CallExpectation.prototype.argMatchers;

/**
 * The stack frame at which this expectation was created, for use in mock
 * expectation errors.
 *
 * @type {!gjstest.internal.StackFrame}
 */
gjstest.internal.CallExpectation.prototype.stackFrame;

/**
 * The number of times this call should happen, as explicitly set by the user.
 * If no explicit setting has been made, this is null.
 *
 * @type {number?}
 */
gjstest.internal.CallExpectation.prototype.expectedNumMatches;

/**
 * Actions to be taken upon the first N matching calls, where N is the length of
 * this array.
 *
 * @type {!Array.<!gjstest.internal.MockAction>}
 */
gjstest.internal.CallExpectation.prototype.oneTimeActions;

/**
 * A fallback action to take when oneTimeActions has been exhausted. If it is
 * exhausted and this is null, the empty function will be used.
 *
 * @type {gjstest.internal.MockAction}
 */
gjstest.internal.CallExpectation.prototype.fallbackAction;

/**
 * The number of times this expectation has been matched so far.
 *
 * @type {!number}
 */
gjstest.internal.CallExpectation.prototype.numMatches;

/**
 * A collection composed of a function defining an action to be taken in
 * response to a call to a mock function and metadata about it.
 *
 * @param {!Function} func
 * @constructor
 */
gjstest.internal.MockAction = function(func) {
  this.actionFunction = func;
  this.expired = false;
};

/**
 * The function to be executed by the action. Its return value, if any, will be
 * used as the return value of the mock function.
 *
 * @type {!Function}
 */
gjstest.internal.MockAction.prototype.actionFunction;

/**
 * Has this action expired, by virtue of being used?
 *
 * @type {!boolean}
 */
gjstest.internal.MockAction.prototype.expired;

/**
 * Check the supplied call expectation to see if it has been satisfied.
 *
 * @param {!gjstest.internal.CallExpectation} expectation
 *
 * @return {string?}
 *     An error message if the expectation isn't satisfied, or null if it is.
 */
gjstest.internal.checkExpectationSatisfied = function(expectation) {
  // A function that helps pluralize nouns.
  var plural = function(count, noun) {
    return count + ' ' + noun + (count != 1 ? 's' : '');
  };

  // A function that evaluates a count against the actual number of matches,
  // optionally treating it as a lower-bounds. It returns null or an error
  // message of the form:
  //
  //     Expected (at least) N call(s); called M time(s).
  //
  var decide = function(count, lowerBound) {
    var actual = expectation.numMatches;
    if (actual == count || (lowerBound && actual > count)) return null;

    var preamble = lowerBound ? 'Expected at least ' : 'Expected ';
    return preamble + plural(count, 'call') +
        '; called ' + plural(actual, 'time') + '.';
  };

  // If there is an explicit cardinality set, check against it.
  if (expectation.expectedNumMatches != null) {
    return decide(expectation.expectedNumMatches, false);
  }

  // If there were one-time actions set up, evaluate against their count. Treat
  // this as a lower-bound iff there was a fallback action set up.
  var oneTimeCount = expectation.oneTimeActions.length;
  if (oneTimeCount) return decide(oneTimeCount, !!expectation.fallbackAction);

  // There were no one-time actions set up. If there was a fallback action set
  // up, this expectation is entirely optional.
  if (!!expectation.fallbackAction) return null;

  // Otherwise, the implicit count is 1.
  return decide(1, false);
};

/**
 * Check the supplied arguments against a call expectation, returning an error
 * message if they don't match or null if they do.
 *
 * @param {!Arguments} args
 * @param {!gjstest.internal.CallExpectation} expectation
 * @return {string?}
 */
gjstest.internal.checkArgsAgainstExpectation = function(args, expectation) {
  var matchers = expectation.argMatchers;

  // If there are too many arguments, we fail.
  if (args.length > matchers.length) {
    return "number of arguments didn't match";
  }

  // Check against each matcher.
  for (var i = 0; i < matchers.length; ++i) {
    // Special-case: if this argument is the missing argument sentinel itself
    // (and *not* a missing argument) and this matcher is isMissingArgSentinel,
    // pass.
    var matcher = matchers[i];
    if (i < args.length &&
        args[i] === gjstest.missingArgSentinel &&
        matcher === gjstest.isMissingArgSentinel) {
      continue;
    }

    // Have we run past the end of the arguments present?
    var arg = (i < args.length) ? args[i] : gjstest.missingArgSentinel;

    // If this is a missing argument but the matcher doesn't support that, we're
    // done.
    if (arg === gjstest.missingArgSentinel && !matcher.understandsMissingArgs) {
      return "number of arguments didn't match";
    }

    // Check the argument (or missing argument sentinel) against the matcher.
    var predicateResult = matcher.predicate(arg);
    if (predicateResult === false) {
      return "arg " + i + " didn't match";
    } else if (typeof(predicateResult) === 'string') {
      return "arg " + i + " (" + predicateResult + ") didn't match";
    }
  }

  return null;
};
