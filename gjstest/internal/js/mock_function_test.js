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

var createMockFunction = gjstest.internal.createMockFunction;

var CallExpectation = gjstest.internal.CallExpectation;
var MockAction = gjstest.internal.MockAction;

function MockFunctionTest() {
  // A list of failure messages that have been reported.
  this.failureMessages_ = [];

  // Set up the mock function and its dependencies.
  var me = this;
  var stringify = function(obj) { return 'stringified: ' + obj; };
  var reportFailure = function(msg) { me.failureMessages_.push(msg); };

  this.checkArgs_ = gjstest.createMockFunction();

  this.mockFunction_ =
      createMockFunction(stringify, this.checkArgs_, reportFailure);
}
registerTestSuite(MockFunctionTest);

////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////

MockFunctionTest.prototype.NoExpectationsRegistered = function() {
  // Call the function without first registering expectations. Do it once with
  // and once without arguments.
  this.mockFunction_('taco', 2);
  this.mockFunction_();

  var messages = this.failureMessages_;
  expectEq(2, messages.length);

  expectThat(messages[0], containsRegExp(/^mock_function_test\.js:\d+/));
  expectThat(messages[1], containsRegExp(/^mock_function_test\.js:\d+/));

  expectThat(
      messages[0],
      hasSubstr(
          'Call matches no expectation.\n' +
              '    Arg 0: stringified: taco\n' +
              '    Arg 1: stringified: 2\n' +
              '\n' +
              'Stack:\n' +
              '    mock_function_test.js:'));

  expectThat(
      messages[1],
      hasSubstr(
          'Call matches no expectation.\n' +
              '    (No arguments.)\n' +
              '\n' +
              'Stack:\n' +
              '    mock_function_test.js:'));
};

MockFunctionTest.prototype.CallsCheckArgs = function() {
  // Expecations
  var expectation_0 = new CallExpectation([], {});
  var expectation_1 = new CallExpectation([], {});

  this.mockFunction_.__gjstest_expectations.push(expectation_0);
  this.mockFunction_.__gjstest_expectations.push(expectation_1);

  // checkArgs
  var expected = ['taco', 'burrito'];
  expectCall(this.checkArgs_)(elementsAre(expected), expectation_0)
    .willOnce(returnWith('error'));

  expectCall(this.checkArgs_)(elementsAre(expected), expectation_1)
    .willOnce(returnWith('error'));

  // Call with the expected arguments.
  this.mockFunction_('taco', 'burrito');
};

MockFunctionTest.prototype.CheckArgsSaysNo = function() {
  // Expectations
  var expectation_0 =
    new CallExpectation(
        [equals(2)],
        { fileName: 'foo.js', lineNumber: 17 });

  var expectation_1 =
    new CallExpectation(
        [equals(2), equals(7)],
        { fileName: 'foo.js', lineNumber: 19 });

  this.mockFunction_.__gjstest_expectations.push(expectation_0);
  this.mockFunction_.__gjstest_expectations.push(expectation_1);

  // checkArgs
  expectCall(this.checkArgs_)(_, expectation_0)
    .willOnce(returnWith('taco'));

  expectCall(this.checkArgs_)(_, expectation_1)
    .willOnce(returnWith('burrito'));

  // Call
  this.mockFunction_('a', 'b');

  var messages = this.failureMessages_;
  expectEq(1, messages.length);

  expectThat(messages[0], containsRegExp(/^mock_function_test\.js:\d+/));

  expectThat(
      messages[0],
      hasSubstr(
          'Call matches no expectation.\n' +
              '    Arg 0: stringified: a\n' +
              '    Arg 1: stringified: b\n' +
              '\n' +
              'Tried expectation at foo.js:19, but burrito:\n' +
              '    Arg 0: 2\n' +
              '    Arg 1: 7\n' +
              '\n' +
              'Tried expectation at foo.js:17, but taco:\n' +
              '    Arg 0: 2\n' +
              '\n' +
              'Stack:\n' +
              '    mock_function_test.js:'));
};

MockFunctionTest.prototype.NoMatchingExpectationsWithNamedFunction =
    function() {
  // Re-create the mock function with a name.
  var me = this;
  var stringify = function(obj) { return 'stringified: ' + obj; };
  var reportFailure = function(msg) { me.failureMessages_.push(msg); };
  this.mockFunction_ =
      createMockFunction(
          stringify,
          this.checkArgs_,
          reportFailure,
          'some name');

  // Make an unmatched call.
  this.mockFunction_('taco', 2);

  expectEq(1, this.failureMessages_.length);

  expectThat(
      this.failureMessages_[0],
      containsRegExp(/^mock_function_test\.js:\d+/));

  expectThat(
      this.failureMessages_[0],
      hasSubstr(
          'Call to some name matches no expectation.\n' +
              '    Arg 0: stringified: taco\n' +
              '    Arg 1: stringified: 2\n' +
              '\n' +
              'Stack:\n' +
              '    mock_function_test.js:'));
};

MockFunctionTest.prototype.SecondExpectationMatches = function() {
  // Expectations
  var expectation_0 =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  var expectation_1 =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 19 });

  var expectation_2 =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 23 });

  this.mockFunction_.__gjstest_expectations.push(expectation_0);
  this.mockFunction_.__gjstest_expectations.push(expectation_1);
  this.mockFunction_.__gjstest_expectations.push(expectation_2);

  // Say no by default.
  expectCall(this.checkArgs_)(_, _)
    .willRepeatedly(returnWith('error'));

  // Say the second expectation matches.
  expectCall(this.checkArgs_)(_, expectation_1)
    .times(3)
    .willRepeatedly(returnWith(null));

  // Make three calls.
  this.mockFunction_();
  this.mockFunction_();
  this.mockFunction_();

  // There should be no failure message.
  var messages = this.failureMessages_;
  expectEq(0, messages.length);

  // numMatches should have been incremented as appropriate.
  expectEq(0, expectation_0.numMatches);
  expectEq(3, expectation_1.numMatches);
  expectEq(0, expectation_2.numMatches);
};

MockFunctionTest.prototype.NoActions = function() {
  // Set up an expectation without actions.
  var expectation =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  this.mockFunction_.__gjstest_expectations.push(expectation);

  // Make some matching calls. Nothing should break.
  expectCall(this.checkArgs_)(_, expectation)
    .willRepeatedly(returnWith(null));

  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);

  expectEq(0, this.failureMessages_.length);
};

MockFunctionTest.prototype.OnlyFallbackAction = function() {
  // An action that increments a counter when it's called.
  var counter = 0;
  var action = new MockAction(function() { ++counter; });

  // Set up an expectation with the above action as a fallback.
  var expectation =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  expectation.fallbackAction = action;
  this.mockFunction_.__gjstest_expectations.push(expectation);

  // Make some matching calls. The action should be called each time.
  expectCall(this.checkArgs_)(_, expectation)
    .willRepeatedly(returnWith(null));

  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);

  expectEq(0, this.failureMessages_.length);
  expectEq(3, counter);
};

MockFunctionTest.prototype.OnlyOneTimeActions = function() {
  // Two actions that keep track of when they were called.
  var callSequence = [];
  var action_0 = new MockAction(function() { callSequence.push(0); });
  var action_1 = new MockAction(function() { callSequence.push(1); });

  // Set up an expectation with the above as one-time actions.
  var expectation =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  expectation.oneTimeActions.push(action_0);
  expectation.oneTimeActions.push(action_1);

  this.mockFunction_.__gjstest_expectations.push(expectation);

  // Make many matching calls. The actions should each be run once, in sequence.
  expectCall(this.checkArgs_)(_, expectation)
    .willRepeatedly(returnWith(null));

  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);

  expectEq(0, this.failureMessages_.length);
  expectEq(2, callSequence.length);
  expectEq(0, callSequence[0]);
  expectEq(1, callSequence[1]);
};

MockFunctionTest.prototype.BothTypesOfActions = function() {
  // Three actions that keep track of when they were called.
  var callSequence = [];
  var action_0 = new MockAction(function() { callSequence.push(0); });
  var action_1 = new MockAction(function() { callSequence.push(1); });
  var action_2 = new MockAction(function() { callSequence.push(2); });

  // Use the first two as one-time actions, and the last as a fallback.
  var expectation =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  expectation.oneTimeActions.push(action_0);
  expectation.oneTimeActions.push(action_1);
  expectation.fallbackAction = action_2;

  this.mockFunction_.__gjstest_expectations.push(expectation);

  // Make many matching calls.
  expectCall(this.checkArgs_)(_, expectation)
    .willRepeatedly(returnWith(null));

  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);
  this.mockFunction_(2);

  expectEq(0, this.failureMessages_.length);
  expectEq(5, callSequence.length);
  expectEq(0, callSequence[0]);
  expectEq(1, callSequence[1]);
  expectEq(2, callSequence[2]);
  expectEq(2, callSequence[3]);
  expectEq(2, callSequence[4]);
};

MockFunctionTest.prototype.ActionArguments = function() {
  // An action that makes a copy of its arguments.
  var args = null;
  var action = new MockAction(function() { args = arguments; });

  // Set up an expectation with the above action.
  var expectation =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  expectation.fallbackAction = action;
  this.mockFunction_.__gjstest_expectations.push(expectation);

  // Make a matching call.
  expectCall(this.checkArgs_)(_, expectation)
    .willRepeatedly(returnWith(null));

  this.mockFunction_(2, 3, 4);

  expectEq(0, this.failureMessages_.length);
  expectThat(args, elementsAre([2, 3, 4]));
};

MockFunctionTest.prototype.ActionReturnValues = function() {
  // An expectation with an action that returns 17.
  var action_0 = new MockAction(function() { return 17; });
  var expectation_0 =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 17 });

  expectation_0.fallbackAction = action_0;

  this.mockFunction_.__gjstest_expectations.push(expectation_0);

  // An expectation with an action that doesn't return anything.
  var action_1 = new MockAction(function() {});
  var expectation_1 =
    new CallExpectation([], { fileName: 'foo.js', lineNumber: 19 });

  expectation_1.fallbackAction = action_1;

  this.mockFunction_.__gjstest_expectations.push(expectation_1);

  // Make some matching calls.
  expectCall(this.checkArgs_)(_, _)
    .willRepeatedly(returnWith('error'));

  expectCall(this.checkArgs_)(elementsAre([0]), expectation_0)
    .willRepeatedly(returnWith(null));

  expectCall(this.checkArgs_)(elementsAre([1]), expectation_1)
    .willRepeatedly(returnWith(null));

  expectEq(17, this.mockFunction_(0));
  expectEq(undefined, this.mockFunction_(1));

  expectEq(0, this.failureMessages_.length);
};
