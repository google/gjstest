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

  expectEq(4, bytes.length);
  expectEq(1, last16.length);

  bytes[0] = 0x12;
  bytes[1] = 0x34;
  bytes[2] = 0x56;
  bytes[3] = 0x78;

  expectEq(0x7856, last16[0]);
}

TypedArraysTest.prototype.ArrayBufferView = function() {
  var buffer = new ArrayBuffer(100);
  var view;

  // Typed array classes implement the ArrayBufferView interface.
  view = new Uint16Array(buffer, 10, 4);
  expectEq(buffer, view.buffer);
  expectEq(10, view.byteOffset);
  expectEq(4 * 2, view.byteLength);
}

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
      -0,
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
          0,
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
      -0,
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
          0,
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
      -0,
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
          0,
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
      -0,
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
          0,
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
      -0,
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
          0,
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
      -0,
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
          0,
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
  a[1] = -17.5


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
      -0,
  ];

  a = new kType(numberArray);
  expectEq(-17.75, a[0]);
  expectEq(0, a[1]);
  expectEq(17.75, a[2]);
  expectTrue(isNaN(a[3]))
  expectEq(Infinity, a[4]);
  expectEq(-Infinity, a[5]);
  expectEq(-0, a[6]);

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectEq(0, a[0]);
  expectEq(17, a[1]);
  expectTrue(isNaN(a[2]))
  expectTrue(isNaN(a[3]))
  expectEq(1, a[4]);
};

TypedArraysTest.prototype.Float64Array = function() {
  var kType = Float64Array;
  var a = new kType(2);

  expectEq(8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  a[0] = 17.5;
  a[1] = -17.5


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
      -0,
  ];

  a = new kType(numberArray);
  expectEq(-17.75, a[0]);
  expectEq(0, a[1]);
  expectEq(17.75, a[2]);
  expectTrue(isNaN(a[3]))
  expectEq(Infinity, a[4]);
  expectEq(-Infinity, a[5]);
  expectEq(-0, a[6]);

  // Converted from non-numbers.
  var nonNumberArray = ['', '17', 'foo', {}, true];

  a = new kType(nonNumberArray);
  expectEq(0, a[0]);
  expectEq(17, a[1]);
  expectTrue(isNaN(a[2]))
  expectTrue(isNaN(a[3]))
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
  f = function() { new ArrayBuffer(-1) };
  expectThat(f, throwsError(/positive integer|not be negative/));

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
  f = function() { new Uint16Array(-1) };
  expectThat(f, throwsError(/positive integer|not be negative/));

  // Offset not a multiple of element size.
  buffer = new ArrayBuffer(6);
  f = function() { new Uint16Array(buffer, 1, 1) };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|offset.*not aligned/));

  // View runs off end of buffer.
  buffer = new ArrayBuffer(6);
  f = function() { new Uint16Array(buffer, 2, 3) };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|Length.*out of range/));

  // Buffer length minus offset not multiple of element size.
  buffer = new ArrayBuffer(5);
  f = function() { new Uint16Array(buffer, 2) };
  expectThat(f, throwsError(/INDEX_SIZE_ERR|not aligned/));

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
