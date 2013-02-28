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

  // Install Error.prepareStackTrace before any errors are thrown, so that when
  // an error is thrown, we can obtain the structured stack trace.
  gjstest.internal.installPrepareStackTrace();

  // Keep track of whether we reported an exception failure.
  var threwException = false;

  try {
    testFn();
  } catch (error) {
    var failureMessage = '' + gjstest.stringify(error);

    // If the exception was thrown from within gjstest public code, the test
    // environment has a user stack available and reportFailure will be able to
    // automatically add the file name and line number of the user code at
    // fault.
    //
    // Otherwise, this exception may have been thrown from deep within the code
    // under test (for example in a file devoted to assertions). Add a stack
    // trace to help with debugging.
    if (testEnvironment.userStack.length == 0) {
      var errorStack = gjstest.internal.getErrorStack(error);

      // Sometimes v8 will put a weird entry like the following on the top of
      // the error stack:
      //
      //     Object.CALL_NON_FUNCTION (native)
      //
      // This describes the error itself rather than the stack frame at which it
      // was thrown, so skip the top frame if it doesn't have a line number but
      // the second one does.
      if (errorStack.length > 1 &&
          errorStack[0].lineNumber == null &&
          errorStack[1].lineNumber != null) {
        errorStack = errorStack.slice(1);
      }

      // Add a stack trace to the message.
      var formattedTrace = gjstest.internal.describeStack(errorStack);
      failureMessage = failureMessage + '\n\nStack:\n' + formattedTrace;
    }

    testEnvironment.reportFailure(failureMessage);
    threwException = true;
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

    // Don't bother reporting unsatisfied expectations if the test threw an
    // exception; it just crowds the output.
    if (unsatisfiedMessage != null && !threwException) {
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
