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

var falsePred = gjstest.evalsToFalse.predicate;
var truePred = gjstest.evalsToTrue.predicate;

///////////////////////////////
// evalsToTrue, evalsToFalse
///////////////////////////////

function EvalsToTrueFalseTest() {}
registerTestSuite(EvalsToTrueFalseTest);

EvalsToTrueFalseTest.prototype.booleans = function() {
  expectFalse(truePred(false));
  expectTrue(falsePred(false));

  expectTrue(truePred(true));
  expectFalse(falsePred(true));
};

EvalsToTrueFalseTest.prototype.nullAndUndefined = function() {
  expectFalse(truePred(null));
  expectTrue(falsePred(null));

  expectFalse(truePred(undefined));
  expectTrue(falsePred(undefined));
};

EvalsToTrueFalseTest.prototype.strings = function() {
  expectFalse(truePred(''));
  expectTrue(falsePred(''));

  expectTrue(truePred(' '));
  expectFalse(falsePred(' '));

  expectTrue(truePred('taco'));
  expectFalse(falsePred('taco'));
};

EvalsToTrueFalseTest.prototype.arrays = function() {
  expectTrue(truePred([]));
  expectFalse(falsePred([]));

  expectTrue(truePred([0]));
  expectFalse(falsePred([0]));

  expectTrue(truePred([1]));
  expectFalse(falsePred([1]));
};

EvalsToTrueFalseTest.prototype.functions = function() {
  expectTrue(truePred(function() {}));
  expectFalse(falsePred(function() {}));

  expectTrue(truePred(function() { return 0; }));
  expectFalse(falsePred(function() { return 0; }));
};

EvalsToTrueFalseTest.prototype.objects = function() {
  expectTrue(truePred({}));
  expectFalse(falsePred({}));

  expectTrue(truePred({ 'foo': 'bar' }));
  expectFalse(falsePred({ 'foo': 'bar' }));
};

EvalsToTrueFalseTest.prototype.descriptions = function() {
  expectEq('evaluates to true', gjstest.evalsToTrue.description);
  expectEq('evaluates to false', gjstest.evalsToTrue.negativeDescription);

  expectEq('evaluates to false', gjstest.evalsToFalse.description);
  expectEq('evaluates to true', gjstest.evalsToFalse.negativeDescription);
};

///////////////////////////////
// not
///////////////////////////////

function NotTest() {}
registerTestSuite(NotTest);

NotTest.prototype.notAMatcher = function() {
  expectThat(function() { not(17); },
             throwsError(/TypeError.*not\(\).*matcher/));
};

NotTest.prototype.predicateReturnsBoolean = function() {
  var yesMatcher = new gjstest.Matcher('', '', function() { return true; });
  var noMatcher = new gjstest.Matcher('', '', function() { return false; });

  expectFalse(not(yesMatcher).predicate(undefined));
  expectTrue(not(noMatcher).predicate(undefined));
};

NotTest.prototype.predicateReturnsString = function() {
  var innerMatcher = new gjstest.Matcher('', '', function() { return 'blah'; });
  expectTrue(not(innerMatcher).predicate(undefined));
};

NotTest.prototype.description = function() {
  var innerMatcher =
    new gjstest.Matcher('taco', 'burrito', function() { return true; });

  var matcher = not(innerMatcher);
  expectEq('burrito', matcher.description);
  expectEq('taco', matcher.negativeDescription);
};

///////////////////////////////
// or
///////////////////////////////

function OrTest() {
  this.subpredicateA_ = createMockFunction('predicate A');
  this.subpredicateB_ = createMockFunction('predicate B');

  this.submatcherA_ =
      new gjstest.Matcher(
          'description A',
          'negative description A',
          this.subpredicateA_);

  this.submatcherB_ =
      new gjstest.Matcher(
          'description B',
          'negative description B',
          this.subpredicateB_);

  this.matcher_ = or(this.submatcherA_, this.submatcherB_);
}
registerTestSuite(OrTest);

OrTest.prototype.understandsMissingArgs = function() {
  expectTrue(this.matcher_.understandsMissingArgs);
};

OrTest.prototype.nonMatcherArgs = function() {
  expectThat(function() { or(17, gjstest.evalsToFalse); },
             throwsError(/TypeError.*or\(\).*matcher/));

  expectThat(function() { or(gjstest.evalsToFalse); },
             throwsError(/TypeError.*or\(\).*matcher/));
};

OrTest.prototype.callsSubmatchers = function() {
  var obj = {};

  expectCall(this.subpredicateA_)(obj)
    .willOnce(returnWith(false));

  expectCall(this.subpredicateB_)(obj)
    .willOnce(returnWith(false));

  this.matcher_.predicate(obj);
};

OrTest.prototype.firstSubmatcherSaysTrue = function() {
  expectCall(this.subpredicateA_)(_)
    .willOnce(returnWith(true));

  expectTrue(this.matcher_.predicate({}));
};

OrTest.prototype.secondSubmatcherSaysTrue = function() {
  expectCall(this.subpredicateA_)(_)
    .willOnce(returnWith(false))
    .willOnce(returnWith('error'));

  expectCall(this.subpredicateB_)(_)
    .willOnce(returnWith(true))
    .willOnce(returnWith(true));

  expectTrue(this.matcher_.predicate({}));
  expectTrue(this.matcher_.predicate({}));
};

OrTest.prototype.neitherSubmatcherSaysTrue = function() {
  expectCall(this.subpredicateA_)(_)
    .willOnce(returnWith('error'))
    .willOnce(returnWith(false));

  expectCall(this.subpredicateB_)(_)
    .willOnce(returnWith(false))
    .willOnce(returnWith('error'));

  expectFalse(this.matcher_.predicate({}));
  expectFalse(this.matcher_.predicate({}));
};

OrTest.prototype.neitherSubmatcherUnderstandsMissingArgs = function() {
  expectCall(this.subpredicateA_)(_)
    .times(0);

  expectCall(this.subpredicateB_)(_)
    .times(0);

  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
};

OrTest.prototype.firstSubmatcherUnderstandsMissingArgs = function() {
  this.submatcherA_.understandsMissingArgs = true;

  expectCall(this.subpredicateA_)(isMissingArgSentinel)
    .willOnce(returnWith(false))
    .willOnce(returnWith('error'))
    .willOnce(returnWith(true));

  expectCall(this.subpredicateB_)(_)
    .times(0);

  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectTrue(this.matcher_.predicate(gjstest.missingArgSentinel));
};

OrTest.prototype.secondSubmatcherUnderstandsMissingArgs = function() {
  this.submatcherB_.understandsMissingArgs = true;

  expectCall(this.subpredicateA_)(_)
    .times(0);

  expectCall(this.subpredicateB_)(isMissingArgSentinel)
    .willOnce(returnWith(false))
    .willOnce(returnWith('error'))
    .willOnce(returnWith(true));

  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectTrue(this.matcher_.predicate(gjstest.missingArgSentinel));
};

OrTest.prototype.bothSubmatchersUnderstandsMissingArgs = function() {
  this.submatcherA_.understandsMissingArgs = true;
  this.submatcherB_.understandsMissingArgs = true;

  expectCall(this.subpredicateA_)(isMissingArgSentinel)
    .willOnce(returnWith(false))
    .willOnce(returnWith('error'))
    .willOnce(returnWith(true))
    .willOnce(returnWith(false));

  expectCall(this.subpredicateB_)(isMissingArgSentinel)
    .willOnce(returnWith('error'))
    .willOnce(returnWith(false))
    .willOnce(returnWith(true));

  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectFalse(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectTrue(this.matcher_.predicate(gjstest.missingArgSentinel));
  expectTrue(this.matcher_.predicate(gjstest.missingArgSentinel));
};

OrTest.prototype.description = function() {
  expectEq('description A or description B', this.matcher_.description);
  expectEq('negative description A and negative description B',
           this.matcher_.negativeDescription);
};
