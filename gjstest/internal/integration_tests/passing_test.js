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

// A test file with test cases that all pass, for use by integration_test.cc.

function returnMe(obj) {
  return obj;
}

function PassingTest() {
  this.someString_ = 'taco';
}
registerTestSuite(PassingTest);

PassingTest.prototype.someString = function() {
  expectThat(this.someString_, containsRegExp(/burrito|taco/));
};

PassingTest.prototype.passingTest = function() {
  expectThat(returnMe('s'), evalsToTrue);
  expectThat(returnMe(null), evalsToFalse);
};

PassingTest.prototype.logging = function() {
  gjstest.log('foo bar');
};

PassingTest.prototype.numberExpectations = function() {
  expectLe(1, 1);
  expectLe(1, 2);
  expectLt(1, 2);

  expectGt(1, 0);
  expectGe(1, 0);
  expectGe(1, 1);
};
