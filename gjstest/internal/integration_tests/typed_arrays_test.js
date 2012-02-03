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
// integration_test.cc.

function TypedArraysTest() {}
registerTestSuite(TypedArraysTest);

TypedArraysTest.prototype.ArrayBuffer = function() {
  var bytes = new Uint8Array(4);
  var middle16 = new Uint16Array(bytes.buffer, 1, 1);

  expectEq(4, bytes.length);
  expectEq(1, middle16.length);

  bytes[0] = 0x12;
  bytes[1] = 0x34;
  bytes[2] = 0x56;
  bytes[3] = 0x78;

  expectEq(0x3456, middle16[0]);
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
};

TypedArraysTest.prototype.Float32Array = function() {
  var a = new Float32Array(2);

  expectEq(4, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  a[0] = 17.5;
  a[1] = -17.5


  expectEq(17.5, a[0]);
  expectEq(-17.5, a[1]);
  expectThat(a, elementsAre([17.5, -17.5]));
};

TypedArraysTest.prototype.Float64Array = function() {
  var a = new Float64Array(2);

  expectEq(8, a.BYTES_PER_ELEMENT);
  expectEq(2, a.length);

  a[0] = 17.5;
  a[1] = -17.5


  expectEq(17.5, a[0]);
  expectEq(-17.5, a[1]);
  expectThat(a, elementsAre([17.5, -17.5]));
};
