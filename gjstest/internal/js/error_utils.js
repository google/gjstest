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
 * Return an array of stack frames representing the stack attached to the
 * supplied error object, or an empty array if there is no stack. The returned
 * array is in order from the top of the stack to the bottom.
 *
 * @param {!Error} error
 * @return {!Array.<!gjstest.internal.StackFrame>}
 */
gjstest.internal.getErrorStack = function(error) {
  // Some errors, e.g. RangeErrors for stack overflows, have no stacks attached.
  if (!error.stack) return [];

  var stackFrames = [];

  // Grab the string stack trace from the error. In v8, it looks something like
  // this:
  //
  //     Error
  //         at stack_utils.js:12:15
  //         at fooBar (stack_utils_test.js:33:12)
  //         at GetCurrentStackTest.basicStack (stack_utils_test.js:36:21)
  //         at register.js:44:12
  //         at Object.runTest (run_test.js:45:3)
  //         at unknown source
  //
  var traceLines = error.stack.split('\n');

  // Skip the first line, which contains the name of the error.
  traceLines.splice(0, 1);

  for (var i = 0; i < traceLines.length; ++i) {
    var line = traceLines[i];
    var frame = { fileName: null, lineNumber: null, functionName: null };

    // Strip out junk we don't care about, giving strings like the following:
    //
    //     Object.foo [as bar] (stack_utils_test.js:63:44)
    //     [object Object].foo (stack_utils_test.js:85:55)
    //     Function.APPLY_PREPARE (native)
    //     new MyConstructor (stack_utils_test.js:56:39)
    //     GetCurrentStackTest.basicStack (stack_utils_test.js:36:21)
    //     stack_utils.js:12:15
    //     unknown source
    //
    line = line.replace(/^\s*at |\s*$/g, '');

    // Is this a fully-detailed line with an 'as' clause?
    var match;
    if (match = /^\S+ \[as (\S+)\] \((\S+):(\d+):\d+\)$/.exec(line)) {
      frame.functionName = match[1];
      frame.fileName = match[2];
      frame.lineNumber = parseFloat(match[3]);

      stackFrames.push(frame);
      continue;
    }

    // Is this a fully-detailed line without an 'as' clause?
    if (match = /^(new )?([^(]+) \((\S+):(\d+):\d+\)$/.exec(line)) {
      frame.functionName = match[2];
      frame.fileName = match[3];
      frame.lineNumber = parseFloat(match[4]);

      stackFrames.push(frame);
      continue;
    }

    // Is this native code?
    if (match = /^(new )?([^(]+) \(native\)$/.exec(line)) {
      frame.functionName = match[2];

      stackFrames.push(frame);
      continue;
    }

    // Does this line give a source-code position only?
    if (match = /(\S+):(\d+):\d+$/.exec(line)) {
      frame.fileName = match[1];
      frame.lineNumber = parseFloat(match[2]);

      stackFrames.push(frame);
      continue;
    }

    // Is this frame from unknown source?
    if (line == 'unknown source') {
      stackFrames.push(frame);
      continue;
    }

    throw new Error('Unhandled stack line:\n' + line);
  }

  return stackFrames;
};
