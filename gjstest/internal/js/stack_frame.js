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
 * A representation of a single stack frame.
 * @constructor
 */
gjstest.internal.StackFrame = function() {
  this.fileName = null;
  this.lineNumber = null;
};

/**
 * The name of the source file if known, or null otherwise.
 *
 * @type {string?}
 */
gjstest.internal.StackFrame.prototype.fileName;

/**
 * The line number of the source file if known, or null otherwise.
 *
 * @type {number?}
 */
gjstest.internal.StackFrame.prototype.lineNumber;
