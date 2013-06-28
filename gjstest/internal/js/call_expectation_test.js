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

var checkExpectationSatisfied = gjstest.internal.checkExpectationSatisfied;
var stackFrame = {};

////////////////////////////////////////////////////////////////////////
// checkExpectationSatisfied
////////////////////////////////////////////////////////////////////////

function CheckSatisfiedTest() { }
registerTestSuite(CheckSatisfiedTest);

CheckSatisfiedTest.prototype.Defaults = function() {
  // CallExpectation
  var matchers = [gjstest.equals(4)];
  var expectation = new gjstest.internal.CallExpectation(matchers, stackFrame);

  expectEq(matchers, expectation.argMatchers);
  expectEq(stackFrame, expectation.stackFrame);
  expectEq(null, expectation.expectedNumMatches);
  expectEq(0, expectation.oneTimeActions.length);
  expectEq(null, expectation.fallbackAction);
  expectEq(0, expectation.numMatches);

  // MockAction
  var func = function() {};
  var action = new gjstest.internal.MockAction(func);

  expectEq(func, action.actionFunction);
  expectEq(false, action.expired);
};

CheckSatisfiedTest.prototype.NoTimesNoActions = function() {
  // The implicit expected count is 1.
  var e = new gjstest.internal.CallExpectation([], stackFrame);

  e.numMatches = 0;
  expectEq('Expected 1 call; called 0 times.', checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq('Expected 1 call; called 2 times.', checkExpectationSatisfied(e));

  e.numMatches = 17;
  expectEq('Expected 1 call; called 17 times.', checkExpectationSatisfied(e));
};

CheckSatisfiedTest.prototype.NoTimesOnlyFallbackAction = function() {
  // Any number of calls should be expected.
  var e = new gjstest.internal.CallExpectation([], stackFrame);
  e.fallbackAction = {};

  e.numMatches = 0;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 17;
  expectEq(null, checkExpectationSatisfied(e));
};

CheckSatisfiedTest.prototype.NoTimesOnlyOneTimeActions = function() {
  var e = new gjstest.internal.CallExpectation([], stackFrame);

  ////////////////////////////////////////////////////////////////////////
  // Implicit count is 1.
  ////////////////////////////////////////////////////////////////////////
  e.oneTimeActions = [{}];

  e.numMatches = 0;
  expectEq('Expected 1 call; called 0 times.', checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq('Expected 1 call; called 2 times.', checkExpectationSatisfied(e));

  ////////////////////////////////////////////////////////////////////////
  // Implicit count is 3.
  ////////////////////////////////////////////////////////////////////////
  e.oneTimeActions = [{}, {}];

  e.numMatches = 0;
  expectEq('Expected 2 calls; called 0 times.', checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq('Expected 2 calls; called 1 time.', checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 3;
  expectEq('Expected 2 calls; called 3 times.', checkExpectationSatisfied(e));
};

CheckSatisfiedTest.prototype.NoTimesBothKindsOfActions = function() {
  var e = new gjstest.internal.CallExpectation([], stackFrame);
  e.fallbackAction = {};

  ////////////////////////////////////////////////////////////////////////
  // Implicit count is at least 1.
  ////////////////////////////////////////////////////////////////////////
  e.oneTimeActions = [{}];

  e.numMatches = 0;
  expectEq('Expected at least 1 call; called 0 times.',
           checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq(null, checkExpectationSatisfied(e));

  ////////////////////////////////////////////////////////////////////////
  // Implicit count is at least 3.
  ////////////////////////////////////////////////////////////////////////
  e.oneTimeActions = [{}, {}, {}];

  e.numMatches = 0;
  expectEq('Expected at least 3 calls; called 0 times.',
           checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq('Expected at least 3 calls; called 1 time.',
           checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq('Expected at least 3 calls; called 2 times.',
           checkExpectationSatisfied(e));

  e.numMatches = 3;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 4;
  expectEq(null, checkExpectationSatisfied(e));
};

CheckSatisfiedTest.prototype.TimesAndActions = function() {
  var e = new gjstest.internal.CallExpectation([], stackFrame);

  // Five one-time actions and a fallback action.
  e.oneTimeActions = [{}, {}, {}, {}, {}];
  e.fallbackAction = {};

  ////////////////////////////////////////////////////////////////////////
  // Explicit count is 0.
  ////////////////////////////////////////////////////////////////////////
  e.expectedNumMatches = 0;

  e.numMatches = 0;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq('Expected 0 calls; called 1 time.', checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq('Expected 0 calls; called 2 times.', checkExpectationSatisfied(e));

  ////////////////////////////////////////////////////////////////////////
  // Explicit count is 1.
  ////////////////////////////////////////////////////////////////////////
  e.expectedNumMatches = 1;

  e.numMatches = 0;
  expectEq('Expected 1 call; called 0 times.', checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq('Expected 1 call; called 2 times.', checkExpectationSatisfied(e));

  ////////////////////////////////////////////////////////////////////////
  // Explicit count is 2.
  ////////////////////////////////////////////////////////////////////////
  e.expectedNumMatches = 2;

  e.numMatches = 0;
  expectEq('Expected 2 calls; called 0 times.', checkExpectationSatisfied(e));

  e.numMatches = 1;
  expectEq('Expected 2 calls; called 1 time.', checkExpectationSatisfied(e));

  e.numMatches = 2;
  expectEq(null, checkExpectationSatisfied(e));

  e.numMatches = 3;
  expectEq('Expected 2 calls; called 3 times.', checkExpectationSatisfied(e));
};

////////////////////////////////////////////////////////////////////////
// checkArgsAgainstExpectation
////////////////////////////////////////////////////////////////////////

function CheckArgsTest() {
  this.predicateA_ = createMockFunction('predicate A');
  this.predicateB_ = createMockFunction('predicate B');

  this.matcherA_ = new gjstest.Matcher('', '', this.predicateA_);
  this.matcherB_ = new gjstest.Matcher('', '', this.predicateB_);
  var matchers = [this.matcherA_, this.matcherB_];

  this.expectation_ = new gjstest.internal.CallExpectation(matchers, {});

  var me = this;
  this.checkArgs_ = function() {
    return gjstest.internal.checkArgsAgainstExpectation(
        arguments,
        me.expectation_);
  };
}
registerTestSuite(CheckArgsTest);

CheckArgsTest.prototype.CallsMatchers = function() {
  expectCall(this.predicateA_)('taco')
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)('burrito')
    .willOnce(returnWith(true));

  this.checkArgs_('taco', 'burrito');
};

CheckArgsTest.prototype.MatcherReturnsFalse = function() {
  expectCall(this.predicateA_)(_)
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(_)
    .willOnce(returnWith(false));

  expectEq("arg 1 didn't match", this.checkArgs_('taco', 'burrito'));
};

CheckArgsTest.prototype.MatcherReturnsString = function() {
  expectCall(this.predicateA_)(_)
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(_)
    .willOnce(returnWith('which is foo'));

  expectEq(
      "arg 1 (which is foo) didn't match",
      this.checkArgs_('taco', 'burrito'));
};

CheckArgsTest.prototype.AllMatchersSayOkay = function() {
  expectCall(this.predicateA_)(_)
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(_)
    .willOnce(returnWith(true));

  expectEq(null, this.checkArgs_('taco', 'burrito'));
};

CheckArgsTest.prototype.UndefinedArgs = function() {
  expectCall(this.predicateA_)(undefined)
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(null)
    .willOnce(returnWith(true));

  expectEq(null, this.checkArgs_(undefined, null));
};

CheckArgsTest.prototype.TooManyArgs = function() {
  expectEq("number of arguments didn't match", this.checkArgs_(0, 1, 2));
  expectEq("number of arguments didn't match", this.checkArgs_(0, 1, 2, 3));
};

CheckArgsTest.prototype.OneMatcherDoesntUnderstandMissingArgs = function() {
  // First matcher doesn't understand
  this.matcherA_.understandsMissingArgs = false;
  this.matcherB_.understandsMissingArgs = true;
  expectEq("number of arguments didn't match", this.checkArgs_());

  // Second matcher doesn't understand
  this.matcherA_.understandsMissingArgs = true;
  this.matcherB_.understandsMissingArgs = false;

  expectCall(this.predicateA_)(isMissingArgSentinel)
    .willOnce(returnWith(true));

  expectEq("number of arguments didn't match", this.checkArgs_());
};

CheckArgsTest.prototype.MatchersUnderstandMissingArgs = function() {
  this.matcherA_.understandsMissingArgs = true;
  this.matcherB_.understandsMissingArgs = true;

  // Matcher A failing
  expectCall(this.predicateA_)(isMissingArgSentinel)
    .willOnce(returnWith(false));

  expectEq("arg 0 didn't match", this.checkArgs_());

  // Matcher B failing
  expectCall(this.predicateA_)(isMissingArgSentinel)
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(isMissingArgSentinel)
    .willOnce(returnWith(false));

  expectEq("arg 1 didn't match", this.checkArgs_());

  // Both passing
  expectCall(this.predicateA_)(isMissingArgSentinel)
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(isMissingArgSentinel)
    .willOnce(returnWith(true));

  expectEq(null, this.checkArgs_());
};

CheckArgsTest.prototype.OnlyOneArgMissing = function() {
  this.matcherB_.understandsMissingArgs = true;

  expectCall(this.predicateA_)('taco')
    .willOnce(returnWith(true));

  expectCall(this.predicateB_)(isMissingArgSentinel)
    .willOnce(returnWith(true));

  this.checkArgs_('taco');
};

CheckArgsTest.prototype.IsMissingArgSentinelMatcher = function() {
  var matchers = [isMissingArgSentinel];
  this.expectation_ = new gjstest.internal.CallExpectation(matchers, {});

  expectEq(null, this.checkArgs_(gjstest.missingArgSentinel));
  expectEq("number of arguments didn't match", this.checkArgs_());
};
