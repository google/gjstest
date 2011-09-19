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
 * Run a test function returned by gjstest.internal.getTestFunctions.
 *
 * @param {function()} testFn
 *     The test function.
 *
 * @param {!gjstest.internal.TestEnvironment} testEnvironment
 *     The environment in which this test should be run.
 */
gjstest.internal.runTest = function runTest(testFn, testEnvironment) {
  // Register the test environment and run the test.
  gjstest.internal.currentTestEnvironment = testEnvironment;

  try {
    testFn();
  } catch (error) {
    // We want to print the exception that was thrown along with a line number.
    // For example:
    //
    //     foo_test.js:73
    //     ReferenceError: bar is undefined.
    //
    // However if this is an exception thrown from within gjstest public code,
    // we want to use the *user* stack to give a better error. For example, even
    // though the following error might be thrown from mocking.js:60, we want to
    // use the user's test line:
    //
    //     foo_test.js:93
    //     TypeError: Supplied function is not a mock.
    //
    // The test environment will do this latter part for us, so skip adding a
    // stack frame if there is already a user stack frame present.
    var failureMessage = '' + error;
    if (testEnvironment.userStack.length == 0) {
      var errorStack = gjstest.internal.getErrorStack(error);
      var stackFrame = errorStack[0];

      // Sometimes v8 will put a weird entry like the following on the top of
      // the error stack:
      //
      //     Object.CALL_NON_FUNCTION (native)
      //
      // This describes the error itself rather than the stack frame at which it
      // was thrown, so skip the top frame if it doesn't have a line number but
      // the second one does.
      if (errorStack.length > 1 &&
          stackFrame.lineNumber == null &&
          errorStack[1].lineNumber != null) {
        stackFrame = errorStack[1];
      }

      // Modify the error message if we have a proper stack frame.
      if (stackFrame) {
        var frameDesc = stackFrame.fileName + ':' + stackFrame.lineNumber;
        failureMessage = frameDesc + '\n' + failureMessage;
      }
    }

    testEnvironment.reportFailure(failureMessage);
  }

  // Make sure each mock expectation was satisfied.
  //
  // NOTE(jacobsa): If the complexity of the interaction between gjstest the
  // testing framework and gjstest the mocking framework grows too much,
  // consider adding a facility for registering arbitrary pre-test and post-test
  // functions to be run, and moving this there.
  for (var i = 0; i < gjstest.internal.registeredCallExpectations.length; ++i) {
    var expectation = gjstest.internal.registeredCallExpectations[i];
    var unsatisfiedMessage =
        gjstest.internal.checkExpectationSatisfied(expectation);

    if (unsatisfiedMessage != null) {
      var stackFrame = expectation.stackFrame;
      var frameDesc = stackFrame.fileName + ':' + stackFrame.lineNumber;
      var failureLines = ['Unsatisfied expectation at ' + frameDesc + ':'];
      failureLines =
          failureLines.concat(
              gjstest.internal.describeExpectation(expectation));

      failureLines.push('');
      failureLines.push(unsatisfiedMessage);
      testEnvironment.reportFailure(failureLines.join('\n'));
    }
  }

  // Clear the list of registered expectations, so that we don't interfere with
  // the next test.
  gjstest.internal.registeredCallExpectations.length = 0;

  // Reset the test environment.
  gjstest.internal.currentTestEnvironment = null;
};
