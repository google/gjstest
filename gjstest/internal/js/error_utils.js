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
 * Sets Error.prepareStackTrace to a function that returns the structured stack
 * trace instead of a formatted one. See here for more info:
 *
 *     http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
 *
 * Error.prepareStackTrace must be installed before any errors are thrown. See:
 *
 *     https://code.google.com/p/v8/issues/detail?id=2559
 */
gjstest.internal.installPrepareStackTrace = function() {
  Error.prepareStackTrace =
      function(error, structuredStack) {
        // Save the structured stack.
        error.structuredStack = structuredStack;

        // Prepare the usual v8 formatted stack trace, for compatibility with
        // tools that parse stack traces (like jasmine).
        return error.name + ': ' + error.message +
            structuredStack.map(function(callSite) {
              return '\n   at ' + callSite.toString();
            }).join();
      };
};

/**
 * Return an array of stack frames representing the stack attached to the
 * supplied error object, or an empty array if there is no stack. The returned
 * array is in order from the top of the stack to the bottom.
 *
 * @param {!Error} error
 * @return {!Array.<!gjstest.internal.StackFrame>}
 *
 * @suppress {missingProperties}
 */
gjstest.internal.getErrorStack = function(error) {
  // Invoke prepareStackTrace to capture the structured stack.
  var structuredStack = error.stack && error.structuredStack;

  // Some errors don't return a stack. (This was true of stack overflows in
  // earlier versions of v8, for example.) Some browsers always supply the stack
  // property as a string, without calling the Error.prepareStackTrace function
  // installed earlier.
  if (!structuredStack || typeof structuredStack == 'string') {
    return [];
  }

  // Convert each CallSite object. See the link above for documentation on
  // CallSite objects.
  var stackFrames = [];
  for (var i = 0; i < structuredStack.length; ++i) {
    var callSite = structuredStack[i];

    var stackFrame = new gjstest.internal.StackFrame;
    stackFrames.push(stackFrame);

    // Avoid storing file name and line number information for native code.
    if (callSite.isNative()) continue;

    // Pull info out of the call site.
    stackFrame.fileName = callSite.getFileName() || callSite.getEvalOrigin();
    stackFrame.lineNumber = callSite.getLineNumber();
  }

  return stackFrames;
};
