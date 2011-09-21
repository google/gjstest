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

// An interface for dependencies on the outside world (e.g. the C++ test
// runner), used by test running functions.

/**
 * An object that encapsulates the mutable environment associated with a running
 * test, including functions for modifying that environment.
 *
 * TODO(jacobsa): Add registered call expectations to this class.
 *
 * @param {function(string)} log
 *     A function that knows how to log a message to the outside world.
 *
 * @param {function(string)} reportFailure
 *     A function that knows how to report a test failure message to the outside
 *     world.
 *
 * @constructor
 */
gjstest.internal.TestEnvironment = function(log, reportFailure) {
  this.log = log;
  this.userStack = [];

  // Wrap the supplied failure reporting function in a version that adds nice
  // line number output if available.
  var me = this;
  this.reportFailure = function(message) {
    var userStack = me.userStack;
    if (userStack.length != 0) {
      var frame = userStack[0];
      message = frame.fileName + ':' + frame.lineNumber + '\n' + message;
    }

    // Report the modified message.
    reportFailure(message);
  };
};

/**
 * Log a message to somewhere convenient for the current method of running
 * tests.
 *
 * @param {string} message
 */
gjstest.internal.TestEnvironment.prototype.log = function(message) {};

/**
 * Report a test failure message to the test runner.
 *
 * @param {string} message
 */
gjstest.internal.TestEnvironment.prototype.reportFailure = function(message) {};

/**
 * Make a note of the portion of the current stack that the user is likely to
 * care about, for use in later printing pretty failure messages with line
 * numbers or stack traces.
 *
 * @param {number} excludedTopSize
 *     The number of frames at the top of the stack occupied by gjstest
 *     internals.  This many frames at the top of the stack will be excluded.
 *     This does not include the frame occupied by recordUserStack itself.
 */
gjstest.internal.TestEnvironment.prototype.recordUserStack =
    function(excludedTopSize) {
  // Get the current stack and remove the number of frames requested, plus one
  // more for this function itself.
  this.userStack = gjstest.internal.getCurrentStack();
  this.userStack.splice(0, excludedTopSize + 1);
};

/**
 * Clear the stack previously collected with recordUserStack. Call this on exit
 * from a functions that used recordUserStack.
 */
gjstest.internal.TestEnvironment.prototype.clearUserStack = function() {
  this.userStack.length = 0;
};

/**
 * The last recorded user stack, or the empty array if none has been recorded or
 * the last one was cleared.
 *
 * @type {!Array.<!gjstest.internal.StackFrame>}
 */
gjstest.internal.TestEnvironment.prototype.userStack;

/**
 * The currently registered global test environment, used by public functions
 * that need to inject a test environment into their internal counterparts.
 *
 * @type {gjstest.internal.TestEnvironment?}
 */
gjstest.internal.currentTestEnvironment = null;
