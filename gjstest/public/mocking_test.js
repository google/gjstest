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

////////////////////////////////////////////////////////////////////////
// expectCall
////////////////////////////////////////////////////////////////////////

function ExpectCallTest() {
  // Set up a fake mock function.
  this.mockFunc_ = function() {};
  this.mockFunc_.__gjstest_expectations = [];
}
registerTestSuite(ExpectCallTest);

ExpectCallTest.prototype.tearDown = function() {
  // Clean up after any mock functions registered.
  gjstest.internal.registeredCallExpectations.length = 0;
};

ExpectCallTest.prototype.NotAMockFunction = function() {
  var expected = /TypeError.*not a mock/;

  expectThat(function() { expectCall(null) }, throwsError(expected));
  expectThat(function() { expectCall(undefined) }, throwsError(expected));
  expectThat(function() { expectCall('taco') }, throwsError(expected));
  expectThat(function() { expectCall(function() {}) }, throwsError(expected));
};

ExpectCallTest.prototype.AddsExpectationsToMockAndArray = function() {
  expectCall(this.mockFunc_)(isNull, isUndefined);
  expectCall(this.mockFunc_)(7, 9);

  // Each place should have two expectations, and they should be the same ones.
  var funcExpectations = this.mockFunc_.__gjstest_expectations;
  var registeredExpectations = gjstest.internal.registeredCallExpectations;

  expectEq(2, funcExpectations.length);
  expectEq(2, registeredExpectations.length);

  expectEq(funcExpectations[0], registeredExpectations[0]);
  expectEq(funcExpectations[1], registeredExpectations[1]);
};

ExpectCallTest.prototype.UsesSuppliedMatchers = function() {
  var matcher_0 = isNull;
  var matcher_1 = equals(2);
  expectCall(this.mockFunc_)(matcher_0, matcher_1);

  var expectation = gjstest.internal.registeredCallExpectations[0];
  var matchers = expectation.argMatchers;

  expectEq(2, matchers.length);
  expectEq(matcher_0, matchers[0]);
  expectEq(matcher_1, matchers[1]);
};

ExpectCallTest.prototype.SetsStackFrame = function() {
  expectCall(this.mockFunc_)();

  var expectation = gjstest.internal.registeredCallExpectations[0];
  var stackFrame = expectation.stackFrame;

  expectEq('mocking_test.js', stackFrame.fileName);
  expectEq(70, stackFrame.lineNumber);
};

ExpectCallTest.prototype.NonMatcherValues = function() {
  var obj = {};
  expectCall(this.mockFunc_)(0, undefined, obj);

  var expectation = gjstest.internal.registeredCallExpectations[0];
  var matchers = expectation.argMatchers;

  expectEq(3, matchers.length);
  var predicate;

  // 0
  predicate = matchers[0].predicate;
  expectTrue(predicate(0));
  expectFalse(predicate(false));
  expectFalse(predicate(null));
  expectFalse(predicate(undefined));
  expectFalse(predicate([]));

  // undefined
  predicate = matchers[1].predicate;
  expectTrue(predicate(undefined));
  expectFalse(predicate(false));
  expectFalse(predicate(null));
  expectFalse(predicate(0));
  expectFalse(predicate([]));

  // obj
  predicate = matchers[2].predicate;
  expectTrue(predicate(obj));
  expectEq('which is a reference to a different object', predicate({}));
};

ExpectCallTest.prototype.Times = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectEq(null, expectation.expectedNumMatches);

  result.times(7);
  expectEq(7, expectation.expectedNumMatches);
};

ExpectCallTest.prototype.TimesCalledTwice = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectThat(
      function() {
        result
          .times(7)
          .times(11);
      },
      throwsError(/times\(\) has already been called/));
};

ExpectCallTest.prototype.NoActionsRegistered = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectEq(0, expectation.oneTimeActions.length);
  expectEq(null, expectation.fallbackAction);
};

ExpectCallTest.prototype.WillOnce = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  var func_0 = function() {};
  var func_1 = function() {};

  result
    .willOnce(func_0)
    .willOnce(func_1);

  expectEq(2, expectation.oneTimeActions.length);
  expectEq(func_0, expectation.oneTimeActions[0].actionFunction);
  expectEq(func_1, expectation.oneTimeActions[1].actionFunction);
};

ExpectCallTest.prototype.WillRepeatedly = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  var func = function() {};
  result.willRepeatedly(func);

  expectEq(func, expectation.fallbackAction.actionFunction);
};

ExpectCallTest.prototype.WillRepeatedlyCalledTwice = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectThat(
      function() {
        result
          .willRepeatedly(function() {})
          .willRepeatedly(function() {});
      },
      throwsError(/willRepeatedly\(\) has already been called/));
};

ExpectCallTest.prototype.WillOnceCalledAfterWillRepeatedly = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectThat(
      function() {
        result
          .willOnce(function() {})
          .willRepeatedly(function() {})
          .willOnce(function() {});
      },
      throwsError(/willOnce\(\) called after willRepeatedly\(\)/));
};

ExpectCallTest.prototype.TimesCalledAfterWillOnce = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectThat(
      function() {
        result
          .willOnce(function() {})
          .times(7);
      },
      throwsError(/times\(\) called after willOnce\(\)/));
};

ExpectCallTest.prototype.TimesCalledAfterWillRepeatedly = function() {
  var result = expectCall(this.mockFunc_)();
  var expectation = gjstest.internal.registeredCallExpectations[0];

  expectThat(
      function() {
        result
          .willRepeatedly(function() {})
          .times(7);
      },
      throwsError(/times\(\) called after willRepeatedly\(\)/));
};
