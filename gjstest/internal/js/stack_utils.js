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
 * Return an array of stack frames representing the current stack up to the
 * point at which this function was called. The returned array is in order from
 * the top of the stack to the bottom.
 *
 * @return {!Array.<!gjstest.internal.StackFrame>}
 */
gjstest.internal.getCurrentStack = function() {
  // Create an error with the current stack, and get its frames.
  var stackFrames = gjstest.internal.getErrorStack(new Error);

  // Skip the first line, which contains the current stack frame.
  stackFrames.splice(0, 1);

  return stackFrames;
};

/**
 * Return a human-readable description of the supplied stack trace. Each line of
 * the description is indented, for convenient printing.
 *
 * @param {!Array.<!gjstest.internal.StackFrame>} stackFrames
 * @return {!string}
 */
gjstest.internal.describeStack = function(stackFrames) {
  // Special case: handle the empty array.
  if (!stackFrames.length) {
    return '    (Empty)';
  }

  // Describe each frame.
  function describeFrame(frame) {
    var fileName = frame.fileName || '(unknown)';
    var lineNumber = '' + (frame.lineNumber || '(unknown)');

    return '    ' + fileName + ':' + lineNumber;
  }

  return stackFrames.map(describeFrame).join('\n');
};
