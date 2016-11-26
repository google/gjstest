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

// A test file with test cases that use typed array types, for use by
// integration_test.cc. The reference when writing these tests is the spec:
//
//     http://www.khronos.org/registry/typedarray/specs/latest/
//

function TypedArraysTest() {}
registerTestSuite(TypedArraysTest);

TypedArraysTest.prototype.ArrayBuffer = function() {
  var buffer = new ArrayBuffer(4);
  var bytes = new Uint8Array(buffer);
  var last16 = new Uint16Array(buffer, 2, 1);

  expectEq(4, buffer.byteLength);
  expectEq(4, bytes.length);
  expectEq(1, last16.length);

  bytes[0] = 0x12;
  bytes[1] = 0x34;
  bytes[2] = 0x56;
  bytes[3] = 0x78;

  expectEq(0x7856, last16[0]);
};

TypedArraysTest.prototype.ArrayBufferSlices = function() {
  var slice;
  var f;

  // Create a buffer and put some data in it.
  var buffer = new ArrayBuffer(4);
  var bytes = new Uint8Array(buffer);

  bytes[0] = 0x12;
  bytes[1] = 0x34;
  bytes[2] = 0x56;
  bytes[3] = 0x78;

  // Full slice with end index.
  slice = buffer.slice(0, 4);
  bytes = new Uint8Array(slice);

  expectEq(4, slice.byteLength);
  expectThat(bytes, elementsAre([0x12, 0x34, 0x56, 0x78]));

  // The slice should be a copy of the original.
  bytes[1] = 0xff;
  expectEq(0x34, (new Uint8Array(buffer))[1]);

  // Full slice without end index.
  slice = buffer.slice(0);
  bytes = new Uint8Array(slice);

  expectEq(4, slice.byteLength);
  expectThat(bytes, elementsAre([0x12, 0x34, 0x56, 0x78]));

  // Partial slice without end index.
  slice = buffer.slice(1);
  bytes = new Uint8Array(slice);

  expectEq(3, slice.byteLength);
  expectThat(bytes, elementsAre([0x34, 0x56, 0x78]));

  // Partial slice with positive indices.
  slice = buffer.slice(1, 3);
  bytes = new Uint8Array(slice);

  expectEq(2, slice.byteLength);
  expectThat(bytes, elementsAre([0x34, 0x56]));

  // Partial slice with negative indices.
  slice = buffer.slice(-3, -1);
  bytes = new Uint8Array(slice);

  expectEq(2, slice.byteLength);
  expectThat(bytes, elementsAre([0x34, 0x56]));

  // Slice with negative length.
  slice = buffer.slice(3, 1);
  bytes = new Uint8Array(slice);

  expectEq(0, slice.byteLength);
  expectThat(bytes, elementsAre([]));

  // Indices out of bounds.
  slice = buffer.slice(-10, 17);
  bytes = new Uint8Array(slice);

  expectEq(4, slice.byteLength);
  expectThat(bytes, elementsAre([0x12, 0x34, 0x56, 0x78]));

  // No arguments.
  //
  // TODO(jacobsa): As of 2013-09-04, the version of v8 on my system is not
  // throwing an error for this. Why? For now, just make sure we don't crash.
  //
  // expectThat(f, throwsError(/enough arguments/));
  f = function() { buffer.slice(); };
  try {
    f();
  } catch (e) {
  }
};

TypedArraysTest.prototype.ArrayBufferView = function() {
  var buffer = new ArrayBuffer(100);
  var view;

  // Typed array classes implement the ArrayBufferView interface.
  view = new Uint16Array(buffer, 10, 4);
  expectEq(buffer, view.buffer);
  expectEq(10, view.byteOffset);
  expectEq(4 * 2, view.byteLength);
};

TypedArraysTest.prototype.DataViewReading = function() {
  var bytes = new Uint8Array(10);
  var view = new DataView(bytes.buffer, 1, 9);

  ////////////////////////////////////////////////////////////////////////
  // Unsigned integers
  ////////////////////////////////////////////////////////////////////////

  bytes[1] = 0x12;
  bytes[2] = 0x34;
  bytes[3] = 0xcd;
  bytes[4] = 0xef;

  // Uint8
  expectEq(0x12, view.getUint8(0));
  expectEq(0x34, view.getUint8(1));
  expectEq(0xcd, view.getUint8(2));
  expectEq(0xef, view.getUint8(3));

  // Uint16
  expectEq(0x1234, view.getUint16(0));
  expectEq(0x34cd, view.getUint16(1));
  expectEq(0xcdef, view.getUint16(2));

  expectEq(0x1234, view.getUint16(0, false));
  expectEq(0x34cd, view.getUint16(1, false));
  expectEq(0xcdef, view.getUint16(2, false));

  expectEq(0x3412, view.getUint16(0, true));
  expectEq(0xcd34, view.getUint16(1, true));
  expectEq(0xefcd, view.getUint16(2, true));

  // Uint32
  expectEq(0x1234cdef, view.getUint32(0));
  expectEq(0x1234cdef, view.getUint32(0, false));
  expectEq(0xefcd3412, view.getUint32(0, true));

  ////////////////////////////////////////////////////////////////////////
  // Signed integers
  ////////////////////////////////////////////////////////////////////////

  bytes[1] = 0x12;
  bytes[2] = 0x34;
  bytes[3] = 0xcd;
  bytes[4] = 0xef;

  // Int8
  expectEq(0x12, view.getInt8(0));
  expectEq(0x34, view.getInt8(1));
  expectEq(-(0x100 - 0xcd), view.getInt8(2));
  expectEq(-(0x100 - 0xef), view.getInt8(3));

  // Int16
  expectEq(0x1234, view.getInt16(0));
  expectEq(0x34cd, view.getInt16(1));
  expectEq(-(0x10000 - 0xcdef), view.getInt16(2));

  expectEq(0x1234, view.getInt16(0, false));
  expectEq(0x34cd, view.getInt16(1, false));
  expectEq(-(0x10000 - 0xcdef), view.getInt16(2, false));

  expectEq(0x3412, view.getInt16(0, true));
  expectEq(-(0x10000 - 0xcd34), view.getInt16(1, true));
  expectEq(-(0x10000 - 0xefcd), view.getInt16(2, true));

  // Int32
  expectEq(0x1234cdef, view.getInt32(0));
  expectEq(0x1234cdef, view.getInt32(0, false));
  expectEq(-(0x100000000 - 0xefcd3412), view.getInt32(0, true));

  ////////////////////////////////////////////////////////////////////////
  // 32-bit floating point
  ////////////////////////////////////////////////////////////////////////

  bytes[1] = 0x47;
  bytes[2] = 0x1b;
  bytes[3] = 0xcf;
  bytes[4] = 0x90;

  expectEq(39887.5625, view.getFloat32(0));
  expectEq(39887.5625, view.getFloat32(0, false));
  expectEq(-8.16891310928799e-29, view.getFloat32(0, true));

  ////////////////////////////////////////////////////////////////////////
  // 64-bit floating point
  ////////////////////////////////////////////////////////////////////////

  bytes[1] = 0x47;
  bytes[2] = 0x1b;
  bytes[3] = 0xcf;
  bytes[4] = 0x90;
  bytes[5] = 0x12;
  bytes[6] = 0x34;
  bytes[7] = 0x56;
  bytes[8] = 0x78;

  expectEq(3.610047211445024e+34, view.getFloat64(0));
  expectEq(3.610047211445024e+34, view.getFloat64(0, false));
  expectEq(4.691975668764521e+271, view.getFloat64(0, true));
};

TypedArraysTest.prototype.DataViewWriting = function() {
  var bytes = new Uint8Array(10);
  var view = new DataView(bytes.buffer, 1, 9);

  function clearBytes() {
    for (var i = 0; i < bytes.length; ++i) {
      bytes[i] = 0x00;
    }
  };

  function sliceBytes(start, end) {
    var result = [];
    for (var i = start; i < end; ++i) {
      result[i - start] = bytes[i];
    }

    return result;
  };

  ////////////////////////////////////////////////////////////////////////
  // Unsigned integers
  ////////////////////////////////////////////////////////////////////////

  // Uint8
  clearBytes();
  view.setUint8(1, 0x12);
  view.setUint8(2, 0x34);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x12, 0x34]));

  // Uint16
  clearBytes();
  view.setUint16(1, 0x1234);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x12, 0x34]));

  clearBytes();
  view.setUint16(1, 0x1234, false);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x12, 0x34]));

  clearBytes();
  view.setUint16(1, 0x1234, true);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x34, 0x12]));

  // Uint32
  clearBytes();
  view.setUint32(1, 0x1234cdef);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x12, 0x34, 0xcd, 0xef]));

  clearBytes();
  view.setUint32(1, 0x1234cdef, false);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x12, 0x34, 0xcd, 0xef]));

  clearBytes();
  view.setUint32(1, 0x1234cdef, true);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0xef, 0xcd, 0x34, 0x12]));

  ////////////////////////////////////////////////////////////////////////
  // Signed integers
  ////////////////////////////////////////////////////////////////////////

  // Positive Int8
  clearBytes();
  view.setInt8(1, 0x12);
  view.setInt8(2, 0x34);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x12, 0x34]));

  // Negative Int8
  clearBytes();
  view.setInt8(1, -1);
  view.setInt8(2, -2);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0xff, 0xfe]));

  // Positive Int16
  clearBytes();
  view.setInt16(1, 0x1234);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x12, 0x34]));

  clearBytes();
  view.setInt16(1, 0x1234, false);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x12, 0x34]));

  clearBytes();
  view.setInt16(1, 0x1234, true);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0x34, 0x12]));

  // Negative Int16
  clearBytes();
  view.setInt16(1, -(0x10000 - 0xcdef));
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0xcd, 0xef]));

  clearBytes();
  view.setInt16(1, -(0x10000 - 0xcdef));
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0xcd, 0xef]));

  clearBytes();
  view.setInt16(1, -(0x10000 - 0xcdef), true);
  expectThat(sliceBytes(1, 4), elementsAre([0x00, 0xef, 0xcd]));

  // Positive Int32
  clearBytes();
  view.setInt32(1, 0x12345678);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x12, 0x34, 0x56, 0x78]));

  clearBytes();
  view.setInt32(1, 0x12345678, false);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x12, 0x34, 0x56, 0x78]));

  clearBytes();
  view.setInt32(1, 0x12345678, true);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x78, 0x56, 0x34, 0x12]));

  // Negative Int32
  clearBytes();
  view.setInt32(1, -(0x100000000 - 0xcdef1234));
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0xcd, 0xef, 0x12, 0x34]));

  clearBytes();
  view.setInt32(1, -(0x100000000 - 0xcdef1234), false);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0xcd, 0xef, 0x12, 0x34]));

  clearBytes();
  view.setInt32(1, -(0x100000000 - 0xcdef1234), true);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x34, 0x12, 0xef, 0xcd]));

  ////////////////////////////////////////////////////////////////////////
  // 32-bit floating point
  ////////////////////////////////////////////////////////////////////////

  clearBytes();
  view.setFloat32(1, 39887.5625);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x47, 0x1b, 0xcf, 0x90]));

  clearBytes();
  view.setFloat32(1, 39887.5625, false);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x47, 0x1b, 0xcf, 0x90]));

  clearBytes();
  view.setFloat32(1, 39887.5625, true);
  expectThat(sliceBytes(1, 6), elementsAre([0x00, 0x90, 0xcf, 0x1b, 0x47]));

  ////////////////////////////////////////////////////////////////////////
  // 64-bit floating point
  ////////////////////////////////////////////////////////////////////////

  clearBytes();
  view.setFloat64(1, 3.610047211445024e+34);
  expectThat(
      sliceBytes(1, 10),
      elementsAre([0x00, 0x47, 0x1b, 0xcf, 0x90, 0x12, 0x34, 0x56, 0x78]));

  clearBytes();
  view.setFloat64(1, 3.610047211445024e+34, false);
  expectThat(
      sliceBytes(1, 10),
      elementsAre([0x00, 0x47, 0x1b, 0xcf, 0x90, 0x12, 0x34, 0x56, 0x78]));

  clearBytes();
  view.setFloat64(1, 3.610047211445024e+34, true);
  expectThat(
      sliceBytes(1, 10),
      elementsAre([0x00, 0x78, 0x56, 0x34, 0x12, 0x90, 0xcf, 0x1b, 0x47]));
};

TypedArraysTest.prototype.DataViewErrors = function() {
  var bytes;
  var view;

  // Construct with offset out of bounds.
  bytes = new Uint8Array(4);
  f = function() { new DataView(bytes.buffer, 4, 1); };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|RangeError.*Invalid (data view|DataView)/));

  // Construct with length too long.
  bytes = new Uint8Array(4);
  f = function() { new DataView(bytes.buffer, 2, 3); };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|RangeError.*Invalid (data view|DataView)/));

  // Read off end of view.
  bytes = new Uint8Array(100);
  view = new DataView(bytes.buffer, 10, 17);
  f = function() { view.getUint16(16); };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|RangeError.*Offset/));

  // Write off end of view.
  bytes = new Uint8Array(100);
  view = new DataView(bytes.buffer, 10, 17);
  f = function() { view.setUint16(16, 10); };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|RangeError.*Offset/));
};

TypedArraysTest.prototype.Int8Array = function() {
  var kType = Int8Array;
  var kBitWidth = 8;

  var a = new kType(2);
  expectEq(kBitWidth / 8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  var kMax = Math.pow(2, kBitWidth - 1) - 1;
  var kMin = -1 * kMax - 1;

  // Non-overflowing
  a[0] = kMin;
  a[1] = kMax;

  expectEq(kMin, a[0]);
  expectEq(kMax, a[1]);
  expectThat(a, elementsAre([kMin, kMax]));

  // Overflowing
  a[0] = kMin - 2;
  a[1] = kMax + 3;

  expectEq(kMax - 1, a[0]);
  expectEq(kMin + 2, a[1]);
  expectThat(a, elementsAre([kMax - 1, kMin + 2]));

  // Convert from numbers.
  var numberArray = [
      kMin - 1,
      kMin,
      kMin + 1,
      -1.7,
      0,
      1.7,
      kMax - 1,
      kMax,
      kMax + 1,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectThat(
      a,
      elementsAre([
          kMax,  // Overflowed
          kMin,
          kMin + 1,
          -1,    // Truncated toward zero
          0,
          1,     // Truncated toward zero
          kMax - 1,
          kMax,
          kMin,  // Overflowed
          0,
          0,
          0,
          0
      ]));

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectThat(a, elementsAre([0, 17, 0, 0, 1]));
};

TypedArraysTest.prototype.Int16Array = function() {
  var kType = Int16Array;
  var kBitWidth = 16;

  var a = new kType(2);
  expectEq(kBitWidth / 8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  var kMax = Math.pow(2, kBitWidth - 1) - 1;
  var kMin = -1 * kMax - 1;

  // Non-overflowing
  a[0] = kMin;
  a[1] = kMax;

  expectEq(kMin, a[0]);
  expectEq(kMax, a[1]);
  expectThat(a, elementsAre([kMin, kMax]));

  // Overflowing
  a[0] = kMin - 2;
  a[1] = kMax + 3;

  expectEq(kMax - 1, a[0]);
  expectEq(kMin + 2, a[1]);
  expectThat(a, elementsAre([kMax - 1, kMin + 2]));

  // Convert from numbers.
  var numberArray = [
      kMin - 1,
      kMin,
      kMin + 1,
      -1.7,
      0,
      1.7,
      kMax - 1,
      kMax,
      kMax + 1,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectThat(
      a,
      elementsAre([
          kMax,  // Overflowed
          kMin,
          kMin + 1,
          -1,    // Truncated toward zero
          0,
          1,     // Truncated toward zero
          kMax - 1,
          kMax,
          kMin,  // Overflowed
          0,
          0,
          0,
          0
      ]));

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectThat(a, elementsAre([0, 17, 0, 0, 1]));
};

TypedArraysTest.prototype.Int32Array = function() {
  var kType = Int32Array;
  var kBitWidth = 32;

  var a = new kType(2);
  expectEq(kBitWidth / 8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  var kMax = Math.pow(2, kBitWidth - 1) - 1;
  var kMin = -1 * kMax - 1;

  // Non-overflowing
  a[0] = kMin;
  a[1] = kMax;

  expectEq(kMin, a[0]);
  expectEq(kMax, a[1]);
  expectThat(a, elementsAre([kMin, kMax]));

  // Overflowing
  a[0] = kMin - 2;
  a[1] = kMax + 3;

  expectEq(kMax - 1, a[0]);
  expectEq(kMin + 2, a[1]);
  expectThat(a, elementsAre([kMax - 1, kMin + 2]));

  // Convert from numbers.
  var numberArray = [
      kMin - 1,
      kMin,
      kMin + 1,
      -1.7,
      0,
      1.7,
      kMax - 1,
      kMax,
      kMax + 1,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectThat(
      a,
      elementsAre([
          kMax,  // Overflowed
          kMin,
          kMin + 1,
          -1,    // Truncated toward zero
          0,
          1,     // Truncated toward zero
          kMax - 1,
          kMax,
          kMin,  // Overflowed
          0,
          0,
          0,
          0
      ]));

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectThat(a, elementsAre([0, 17, 0, 0, 1]));
};

TypedArraysTest.prototype.Uint8Array = function() {
  var kType = Uint8Array;
  var kBitWidth = 8;

  var a = new kType(2);
  expectEq(kBitWidth / 8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  var kMin = 0;
  var kMax = Math.pow(2, kBitWidth) - 1;

  // Non-overflowing
  a[0] = kMin;
  a[1] = kMax;

  expectEq(kMin, a[0]);
  expectEq(kMax, a[1]);
  expectThat(a, elementsAre([kMin, kMax]));

  // Overflowing
  a[0] = kMin - 2;
  a[1] = kMax + 3;

  expectEq(kMax - 1, a[0]);
  expectEq(kMin + 2, a[1]);
  expectThat(a, elementsAre([kMax - 1, kMin + 2]));

  // Convert from numbers.
  var numberArray = [
      kMin - 1,
      kMin,
      kMin + 1,
      0,
      1.7,
      kMax - 1,
      kMax,
      kMax + 1,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectThat(
      a,
      elementsAre([
          kMax,  // Overflowed
          kMin,
          kMin + 1,
          0,
          1,     // Truncated toward zero
          kMax - 1,
          kMax,
          kMin,  // Overflowed
          0,
          0,
          0,
          0
      ]));

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectThat(a, elementsAre([0, 17, 0, 0, 1]));
};

TypedArraysTest.prototype.Uint16Array = function() {
  var kType = Uint16Array;
  var kBitWidth = 16;

  var a = new kType(2);
  expectEq(kBitWidth / 8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  var kMin = 0;
  var kMax = Math.pow(2, kBitWidth) - 1;

  // Non-overflowing
  a[0] = kMin;
  a[1] = kMax;

  expectEq(kMin, a[0]);
  expectEq(kMax, a[1]);
  expectThat(a, elementsAre([kMin, kMax]));

  // Overflowing
  a[0] = kMin - 2;
  a[1] = kMax + 3;

  expectEq(kMax - 1, a[0]);
  expectEq(kMin + 2, a[1]);
  expectThat(a, elementsAre([kMax - 1, kMin + 2]));

  // Convert from numbers.
  var numberArray = [
      kMin - 1,
      kMin,
      kMin + 1,
      0,
      1.7,
      kMax - 1,
      kMax,
      kMax + 1,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectThat(
      a,
      elementsAre([
          kMax,  // Overflowed
          kMin,
          kMin + 1,
          0,
          1,     // Truncated toward zero
          kMax - 1,
          kMax,
          kMin,  // Overflowed
          0,
          0,
          0,
          0
      ]));

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectThat(a, elementsAre([0, 17, 0, 0, 1]));
};

TypedArraysTest.prototype.Uint32Array = function() {
  var kType = Uint32Array;
  var kBitWidth = 32;

  var a = new kType(2);
  expectEq(kBitWidth / 8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  var kMin = 0;
  var kMax = Math.pow(2, kBitWidth) - 1;

  // Non-overflowing
  a[0] = kMin;
  a[1] = kMax;

  expectEq(kMin, a[0]);
  expectEq(kMax, a[1]);
  expectThat(a, elementsAre([kMin, kMax]));

  // Overflowing
  a[0] = kMin - 2;
  a[1] = kMax + 3;

  expectEq(kMax - 1, a[0]);
  expectEq(kMin + 2, a[1]);
  expectThat(a, elementsAre([kMax - 1, kMin + 2]));

  // Convert from numbers.
  var numberArray = [
      kMin - 1,
      kMin,
      kMin + 1,
      0,
      1.7,
      kMax - 1,
      kMax,
      kMax + 1,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectThat(
      a,
      elementsAre([
          kMax,  // Overflowed
          kMin,
          kMin + 1,
          0,
          1,     // Truncated toward zero
          kMax - 1,
          kMax,
          kMin,  // Overflowed
          0,
          0,
          0,
          0
      ]));

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectThat(a, elementsAre([0, 17, 0, 0, 1]));
};

TypedArraysTest.prototype.Float32Array = function() {
  var kType = Float32Array;
  var a = new kType(2);

  expectEq(4, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  a[0] = 17.5;
  a[1] = -17.5;


  expectEq(17.5, a[0]);
  expectEq(-17.5, a[1]);
  expectThat(a, elementsAre([17.5, -17.5]));

  // Convert from numbers.
  var numberArray = [
      -17.75,
      0,
      17.75,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectEq(-17.75, a[0]);
  expectEq(0, a[1]);
  expectEq(17.75, a[2]);
  expectTrue(isNaN(a[3]));
  expectEq(Infinity, a[4]);
  expectEq(-Infinity, a[5]);
  expectEq(-0, a[6]);

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectEq(0, a[0]);
  expectEq(17, a[1]);
  expectTrue(isNaN(a[2]));
  expectTrue(isNaN(a[3]));
  expectEq(1, a[4]);
};

TypedArraysTest.prototype.Float64Array = function() {
  var kType = Float64Array;
  var a = new kType(2);

  expectEq(8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  a[0] = 17.5;
  a[1] = -17.5;


  expectEq(17.5, a[0]);
  expectEq(-17.5, a[1]);
  expectThat(a, elementsAre([17.5, -17.5]));

  // Convert from numbers.
  var numberArray = [
      -17.75,
      0,
      17.75,
      NaN,
      Infinity,
      -Infinity,
      -0
  ];

  a = new kType(numberArray);
  expectEq(-17.75, a[0]);
  expectEq(0, a[1]);
  expectEq(17.75, a[2]);
  expectTrue(isNaN(a[3]));
  expectEq(Infinity, a[4]);
  expectEq(-Infinity, a[5]);
  expectEq(-0, a[6]);

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectEq(0, a[0]);
  expectEq(17, a[1]);
  expectTrue(isNaN(a[2]));
  expectTrue(isNaN(a[3]));
  expectEq(1, a[4]);
};

TypedArraysTest.prototype.ConstructFromOtherTypedArray = function() {
  var a;
  var b;

  // Integer to larger integer.
  a = new Int8Array([-128, 0, 127]);
  b = new Int16Array(a);

  expectThat(b, elementsAre([-128, 0, 127]));

  // Integer to smaller integer.
  a = new Int16Array([-129, -2, 0, 2, 128]);
  b = new Int8Array(a);

  expectThat(b, elementsAre([127, -2, 0, 2, -128]));

  // Signed to unsigned.
  a = new Int8Array([-128, -1, 0, 10, 127]);
  b = new Uint8Array(a);

  expectThat(b, elementsAre([128, 255, 0, 10, 127]));

  // Unsigned to signed.
  a = new Uint8Array([0, 17, 127, 128, 255]);
  b = new Int8Array(a);

  expectThat(b, elementsAre([0, 17, 127, -128, -1]));

  // Float to integer.
  a = new Float32Array([-129, -128, -1.7, 0, 1.7, 127, 128, NaN]);
  b = new Int8Array(a);

  expectThat(b, elementsAre([127, -128, -1, 0, 1, 127, -128, 0]));
};

TypedArraysTest.prototype.ArrayBufferContructorErrors = function() {
  var f;

  // Negative length.
  //
  // TODO(jacobsa): As of 2013-09-04, the version of v8 on my system is not
  // throwing an error for this. Why? For now, just make sure we don't crash.
  //
  // expectThat(f, throwsError(/positive integer|not be negative/));
  f = function() { new ArrayBuffer(-1) };
  try {
    f();
  } catch (e) {
  }

  // No arguments. This should be an error according to the spec, but Chrome
  // doesn't treat it as one. In order to make sure this test runs correctly in
  // Chrome as well as the gjstest runner, simply make sure we don't crash.
  try {
    new ArrayBuffer();
  } catch (e) {
  }

  // Too many arguments. This should be an error according to the spec, but
  // Chrome doesn't treat it as one. In order to make sure this test runs
  // correctly in Chrome as well as the gjstest runner, simply make sure we
  // don't crash.
  try {
    new ArrayBuffer(10, 12);
  } catch (e) {
  }
};

TypedArraysTest.prototype.TypedArrayContructorErrors = function() {
  var buffer;
  var f;

  // Negative length.
  //
  // TODO(jacobsa): As of 2013-09-04, the version of v8 on my system is not
  // throwing an error for this. Why? For now, just make sure we don't crash.
  //
  // expectThat(f, throwsError(/positive integer|not be negative/));
  f = function() { new Uint16Array(-1) };
  try {
    f();
  } catch (e) {
  }

  // Offset not a multiple of element size.
  buffer = new ArrayBuffer(6);
  f = function() { new Uint16Array(buffer, 1, 1) };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|should be a multiple/));

  // View runs off end of buffer.
  buffer = new ArrayBuffer(6);
  f = function() { new Uint16Array(buffer, 2, 3) };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|RangeError.*length/));

  // Buffer length minus offset not multiple of element size.
  buffer = new ArrayBuffer(5);
  f = function() { new Uint16Array(buffer, 2) };
  expectThat(f, throwsError(/not a multiple|should be a multiple/));

  // No arguments. This should be an error according to the spec, but Chrome
  // doesn't treat it as one. In order to make sure this test runs correctly in
  // Chrome as well as the gjstest runner, simply make sure we don't crash.
  try {
    new Uint16Array();
  } catch (e) {
  }

  // Too many arguments. This should be an error according to the spec, but
  // Chrome doesn't treat it as one. In order to make sure this test runs
  // correctly in Chrome as well as the gjstest runner, simply make sure we
  // don't crash.
  try {
    new Uint16Array(new ArrayBuffer(2), 0, 1, 17);
  } catch (e) {
  }
};

TypedArraysTest.prototype.ZeroInitialization = function() {
  // Created via array buffer.
  var buffer = new ArrayBuffer(8192);
  var bytes = new Uint8Array(buffer);

  for (var i = 0; i < bytes.length; ++i) {
    expectEq(0, bytes[i]);
  }

  // Created directly.
  bytes = new Uint8Array(8192);

  for (var i = 0; i < bytes.length; ++i) {
    expectEq(0, bytes[i]);
  }
};
