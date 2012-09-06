// Copyright 2012 Google Inc. All Rights Reserved.
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

// Attach a slice() method to ArrayBuffer, since our C++ implementation doesn't
// have one. A JS version is much easier to implement, though it won't be as
// fast.

/**
 * Verify an expectation, reporting failure when appropriate.
 *
 * @param {number} start
 *     TODO
 *
 * @param {number=} opt_end
 *     TODO
 */
ArrayBuffer.prototype.slice = function(start, opt_end) {
  throw new Error(/TODO/);
};
