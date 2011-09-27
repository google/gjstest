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

//////////////////////////////////////////////////////
// allOf
//////////////////////////////////////////////////////

function AllOfTest() {}
registerTestSuite(AllOfTest);

AllOfTest.prototype.NonArrayArguments = function() {
  expectThat(function() { allOf(null) },
             throwsError(/TypeError.*allOf.*requires an array/));

  expectThat(function() { allOf(17) },
             throwsError(/TypeError.*allOf.*requires an array/));
};

AllOfTest.prototype.EmptyArray = function() {
  var matcher = allOf([]);

  expectEq('is anything', matcher.description);

  expectTrue(matcher.predicate(null));
  expectTrue(matcher.predicate(undefined));
  expectTrue(matcher.predicate(17));
  expectTrue(matcher.predicate(''));
  expectTrue(matcher.predicate('taco'));
  expectTrue(matcher.predicate(false));
};

AllOfTest.prototype.SingleMatcherArray = function() {
  var wrapped =
      new gjstest.Matcher(
          'is a taco',
          'is not a taco',
          function(candidate) { return candidate == 'taco'; });

  var matcher = allOf([wrapped]);

  expectEq('is a taco', matcher.description);
  expectEq('is not a taco', matcher.negativeDescription);

  expectFalse(matcher.predicate(null));
  expectFalse(matcher.predicate(17));
  expectFalse(matcher.predicate('burrito'));

  expectTrue(matcher.predicate('taco'));
};

AllOfTest.prototype.SingleValueArray = function() {
  var matcher = allOf(['taco']);

  expectEq('\'taco\'', matcher.description);
  expectEq('does not equal: \'taco\'', matcher.negativeDescription);

  expectFalse(matcher.predicate(null));
  expectFalse(matcher.predicate(17));
  expectFalse(matcher.predicate('burrito'));

  expectTrue(matcher.predicate('taco'));
};

AllOfTest.prototype.MultipleElementArray = function() {
  var matcher = allOf([greaterThan(2), lessThan(10), not(isNull)]);

  expectEq('is greater than 2, and is less than 10, and is not null',
           matcher.description);

  expectEq('is less than or equal to 2, or is greater than or equal to 10, ' +
               'or is null',
           matcher.negativeDescription);

  expectEq('which is not a number', matcher.predicate(null));
  expectEq('which is not a number', matcher.predicate('taco'));

  expectFalse(matcher.predicate(2));
  expectTrue(matcher.predicate(3));
  expectTrue(matcher.predicate(9));
  expectFalse(matcher.predicate(10));
};

AllOfTest.prototype.OneSubMatcherDoesntUnderstandMissingArgs = function() {
  var matcherA = new hoon.Matcher('', '', createMockFunction('predicate A'));
  var matcherB = new hoon.Matcher('', '', createMockFunction('predicate B'));
  var matcherC = new hoon.Matcher('', '', createMockFunction('predicate C'));

  matcherA.understandsMissingArgs = true;
  matcherB.understandsMissingArgs = false;
  matcherC.understandsMissingArgs = true;

  var matcher = allOf([matcherA, matcherB, matcherC]);

  expectFalse(matcher.understandsMissingArgs);
};

AllOfTest.prototype.SubMatchersAllUnderstandMissingArgs = function() {
  var matcherA = new hoon.Matcher('', '', createMockFunction('predicate A'));
  var matcherB = new hoon.Matcher('', '', createMockFunction('predicate B'));
  var matcherC = new hoon.Matcher('', '', createMockFunction('predicate C'));

  matcherA.understandsMissingArgs = true;
  matcherB.understandsMissingArgs = true;
  matcherC.understandsMissingArgs = true;

  var matcher = allOf([matcherA, matcherB, matcherC]);

  // One says no.
  expectCall(matcherA.predicate)(gjstest.missingArgSentinel)
      .willOnce(returnWith(true));

  expectCall(matcherB.predicate)(gjstest.missingArgSentinel)
      .willOnce(returnWith('is not a taco'));

  expectEq('is not a taco', matcher.predicate(gjstest.missingArgSentinel));
};

//////////////////////////////////////////////////////
// anyOf
//////////////////////////////////////////////////////

function AnyOfTest() {}
registerTestSuite(AnyOfTest);

AnyOfTest.prototype.NonArrayArguments = function() {
  expectThat(function() { anyOf(null) },
             throwsError(/TypeError.*anyOf.*requires an array/));

  expectThat(function() { anyOf(17) },
             throwsError(/TypeError.*anyOf.*requires an array/));
};

AnyOfTest.prototype.EmptyArray = function() {
  var matcher = anyOf([]);

  expectEq('is a unicorn', matcher.description);
  expectEq('is anything', matcher.negativeDescription);

  expectFalse(matcher.predicate(null));
  expectFalse(matcher.predicate(undefined));
  expectFalse(matcher.predicate(17));
  expectFalse(matcher.predicate(''));
  expectFalse(matcher.predicate('taco'));
  expectFalse(matcher.predicate(false));
};

AnyOfTest.prototype.SingleMatcherArray = function() {
  var wrapped =
      new gjstest.Matcher(
          'is a taco',
          'is not a taco',
          function(candidate) { return candidate == 'taco'; });

  var matcher = anyOf([wrapped]);

  expectEq('is a taco', matcher.description);
  expectEq('is not a taco', matcher.negativeDescription);

  expectFalse(matcher.predicate(null));
  expectFalse(matcher.predicate(17));
  expectFalse(matcher.predicate('burrito'));

  expectTrue(matcher.predicate('taco'));
};

AnyOfTest.prototype.SingleValueArray = function() {
  var matcher = anyOf(['taco']);

  expectEq('\'taco\'', matcher.description);
  expectEq('does not equal: \'taco\'', matcher.negativeDescription);

  expectFalse(matcher.predicate(null));
  expectFalse(matcher.predicate(17));
  expectFalse(matcher.predicate('burrito'));

  expectTrue(matcher.predicate('taco'));
};

AnyOfTest.prototype.MultipleElementArray = function() {
  var matcher = anyOf([greaterThan(20), lessThan(10), isNull]);

  expectEq('is greater than 20, or is less than 10, or is null',
           matcher.description);

  expectEq('is less than or equal to 20, and is greater than or equal to 10, ' +
               'and is not null',
           matcher.negativeDescription);

  expectFalse(matcher.predicate(undefined));
  expectFalse(matcher.predicate('taco'));

  expectTrue(matcher.predicate(null));

  expectTrue(matcher.predicate(9));
  expectFalse(matcher.predicate(10));
  expectFalse(matcher.predicate(20));
  expectTrue(matcher.predicate(21));
};

///////////////////////////////
// not
///////////////////////////////

function NotTest() {}
registerTestSuite(NotTest);

NotTest.prototype.NonMatcher = function() {
  var matcher = not(17);

  expectEq('does not equal: 17', matcher.description);
  expectEq('17', matcher.negativeDescription);

  expectTrue(matcher.predicate(null));
  expectTrue(matcher.predicate(undefined));
  expectTrue(matcher.predicate(16));
  expectTrue(matcher.predicate('taco'));

  expectFalse(matcher.predicate(17));
};

NotTest.prototype.PredicateReturnsBoolean = function() {
  var yesMatcher = new gjstest.Matcher('', '', function() { return true; });
  var noMatcher = new gjstest.Matcher('', '', function() { return false; });

  expectFalse(not(yesMatcher).predicate(undefined));
  expectTrue(not(noMatcher).predicate(undefined));
};

NotTest.prototype.PredicateReturnsString = function() {
  var innerMatcher = new gjstest.Matcher('', '', function() { return 'blah'; });
  expectTrue(not(innerMatcher).predicate(undefined));
};

NotTest.prototype.Description = function() {
  var innerMatcher =
    new gjstest.Matcher('taco', 'burrito', function() { return true; });

  var matcher = not(innerMatcher);
  expectEq('burrito', matcher.description);
  expectEq('taco', matcher.negativeDescription);
};
