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

// Don't attempt to replace an already-working slice method.
if (!('slice' in ArrayBuffer.prototype)) {
  /**
   * Slice an array buffer, as defined here:
   *
   *     http://www.khronos.org/registry/typedarray/specs/latest/
   *
   * @param {number} start
   *     The start index, inclusive. If negative, this is interpreted as an
   *     index from the end of the array.
   *
   * @param {number=} opt_end
   *     The end index, exclusive. If negative, this is interpreted as an index
   *     from the end of the array. If missing, this defaults to the length of
   *     the array.
   *
   * @return {!ArrayBuffer}
   *     A copy of the sliced data.
   *
   * @suppress {duplicate}
   */
  ArrayBuffer.prototype.slice = function(start, opt_end) {
    // Handle missing start arguments.
    if (start === undefined) {
      throw new Error('Not enough arguments.');
    }

    // Handle missing end arguments.
    var end = opt_end || this.byteLength;

    // Interpret negative values as indices from the end of the array. Convert
    // them to indices from the beginning.
    if (start < 0) { start = this.byteLength + start; }
    if (end < 0) { end = this.byteLength + end; }

    // Handle negative-length slices.
    if (end < start) {
      start = 0;
      end = 0;
    }

    // Clamp the range.
    if (start < 0) { start = 0; }
    if (end < 0) { end = 0; }

    if (start > this.byteLength) { start = this.byteLength; }
    if (end > this.byteLength) { end = this.byteLength; }

    // Create a new buffer, and copy data into it.
    var result = new ArrayBuffer(end - start);
    var inBytes = new Uint8Array(this);
    var outBytes = new Uint8Array(result);

    for (var inIndex = start, outIndex = 0;
         inIndex < end;
         ++inIndex, ++outIndex) {
      outBytes[outIndex] = inBytes[inIndex];
    }

    return result;
  };
}
