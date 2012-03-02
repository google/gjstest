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

PassingTest.prototype.SomeString = function() {
  expectThat(this.someString_, containsRegExp(/burrito|taco/));
};

PassingTest.prototype.PassingTest = function() {
  expectThat(returnMe('s'), evalsToTrue);
  expectThat(returnMe(null), evalsToFalse);
};

PassingTest.prototype.StringMatchers = function() {
  expectThat('burritos and tacos', containsRegExp(/taco/));
  expectThat('burritos and tacos', hasSubstr('taco'));
  expectThat('enchiladas', not(hasSubstr('taco')));
};

PassingTest.prototype.Logging = function() {
  gjstest.log('foo bar');
};

PassingTest.prototype.NumberExpectations = function() {
  expectLe(1, 1);
  expectLe(1, 2);
  expectLt(1, 2);

  expectGt(1, 0);
  expectGe(1, 0);
  expectGe(1, 1);
};

PassingTest.prototype.UserErrors = function() {
  expectThat('taco', hasSubstr('t'), 'foo');
  expectEq('', '', 'foo');
  expectNe('', 'a', 'foo');
  expectFalse(false, 'foo');
  expectTrue(true, 'foo');
  expectGe(1, 1, 'foo');
  expectGt(1, 0, 'foo');
  expectLe(1, 2, 'foo');
  expectLt(1, 2, 'foo');
};
