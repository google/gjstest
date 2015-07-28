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

// A test file with a test case that intentionally fails, for use by
// integration_test.cc.

function FailingTest() {}
registerTestSuite(FailingTest);

FailingTest.prototype.PassingTest1 = function() {
  expectThat(null, evalsToFalse);
};

FailingTest.prototype.FailingTest1 = function() {
  expectThat('a', evalsToFalse);
};

FailingTest.prototype.FailingTest2 = function() {
  expectThat(2, evalsToFalse);
  expectThat([1, 2], elementsAre([1, 2, 3]));
};

FailingTest.prototype.StringMatchers = function() {
  expectThat('burritos and tacos', containsRegExp(/enchilada/));
  expectThat('burritos and tacos', hasSubstr('enchilada'));
  expectThat('tacos', not(hasSubstr('taco')));
};

FailingTest.prototype.FailureWithLogOutput = function() {
  expectThat(2, evalsToFalse);
  gjstest.log('foo bar');
  expectThat(3, evalsToFalse);
};

FailingTest.prototype.MissingArrayElementWithRecursivelyEquals = function() {
  var a = [];
  a[0] = 0;
  a[2] = 2;

  var b = [0, undefined, 2];

  expectThat(a, recursivelyEquals(b));
};

FailingTest.prototype.PassingTest2 = function() {
  expectThat(undefined, evalsToFalse);
};

FailingTest.prototype.NumberExpectations = function() {
  expectLt(1, 0);
  expectLt(1, 1);

  expectLe(1, -1);
  expectLe(1, 0);

  expectGt(7, 7);
  expectGt(7, 9);

  expectGe(7, 8);
  expectGe(7, 9);
};

FailingTest.prototype.UserErrors = function() {
  expectThat('taco', hasSubstr('burrito'), 'foo');
  expectEq('', 'a', 'foo');
  expectNe('a', 'a', 'foo');
  expectFalse(true, 'foo');
  expectTrue(false, 'foo');
  expectGe(0, 1, 'foo');
  expectGt(0, 0, 'foo');
  expectLe(3, 2, 'foo');
  expectLt(2, 2, 'foo');
};

FailingTest.prototype.FailingTestWithStack = function() {
  helper1();
};

function helper1() {
  helper2();
}

function helper2() {
  expectThat('a', evalsToFalse);
}
