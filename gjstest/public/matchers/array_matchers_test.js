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
// Helpers
////////////////////////////////////////////////////////////////////////

// Helper function for getting ahold of an Arguments object.
function returnArgs() { return arguments; }

////////////////////////////////////////////////////////////////////////
// elementsAre
////////////////////////////////////////////////////////////////////////

function ElementsAreTest() {}
registerTestSuite(ElementsAreTest);

ElementsAreTest.prototype.NonArrayArgument = function() {
  var error;

  expectThat(function() { elementsAre(null) },
             throwsError(/TypeError.*elementsAre.*array or Arguments/));

  expectThat(function() { elementsAre(undefined) },
             throwsError(/TypeError.*elementsAre.*array or Arguments/));

  expectThat(function() { elementsAre(2) },
             throwsError(/TypeError.*elementsAre.*array or Arguments/));
};

ElementsAreTest.prototype.NonArrayCandidates = function() {
  var pred = elementsAre([]).predicate;

  expectEq('which isn\'t an array or Arguments object', pred(undefined));
  expectEq('which isn\'t an array or Arguments object', pred(null));
  expectEq('which isn\'t an array or Arguments object', pred(''));
  expectEq('which isn\'t an array or Arguments object', pred({}));
  expectEq('which isn\'t an array or Arguments object', pred(2));
  expectEq('which isn\'t an array or Arguments object', pred(equals(2)));
};

ElementsAreTest.prototype.WrongLength = function() {
  var pred = elementsAre([_, _]).predicate;

  expectEq('which has length 0', pred([]));
  expectEq('which has length 1', pred([0]));
  expectEq('which has length 3', pred([0, 1, 2]));
};

ElementsAreTest.prototype.NonMatchingMatchers = function() {
  var pred =
    elementsAre([equals(0), containsRegExp(/^t.*o$/)]).predicate;

  expectEq('whose element 0 doesn\'t match', pred([1, 'taco']));
  expectEq('whose element 1 doesn\'t match', pred([0, 'taco filling']));
};

ElementsAreTest.prototype.AllMatch = function() {
  var pred =
    elementsAre([equals(17), containsRegExp(/^t.*o$/)]).predicate;

  expectTrue(pred([17, 'taco']));
  expectTrue(pred([17, 'taco and burrito']));
};

ElementsAreTest.prototype.MatcherReturnsString = function() {
  var innerMatcher = new gjstest.Matcher('', '', function() { return 'taco'; });
  var pred = elementsAre([innerMatcher]).predicate;

  expectEq('whose element 0 doesn\'t match', pred([undefined]));
};

ElementsAreTest.prototype.RawValues = function() {
  var obj = {};
  var pred = elementsAre([null, 0, 'taco', obj]).predicate;

  // Everything equal.
  expectTrue(pred([null, 0, 'taco', obj]));

  // Some non-equal.
  expectEq('whose element 0 doesn\'t match', pred([0, 0, 'taco', obj]));
  expectEq('whose element 1 doesn\'t match', pred([null, false, 'taco', obj]));
  expectEq('whose element 2 doesn\'t match', pred([null, 0, 'burrito', obj]));
  expectEq('whose element 3 doesn\'t match', pred([null, 0, 'taco', {}]));
};

ElementsAreTest.prototype.ArgumentsObject = function() {
  var obj = {};
  var pred = elementsAre([obj, containsRegExp(/t.+o/)]).predicate;

  // Everything equal.
  expectTrue(pred(returnArgs(obj, 'taco')));

  // Some non-equal.
  expectEq('whose element 0 doesn\'t match', pred(returnArgs({}, 'taco')));
  expectEq('whose element 1 doesn\'t match', pred(returnArgs(obj, 'burrito')));
};

ElementsAreTest.prototype.EmptyArrays = function() {
  var pred = elementsAre([]).predicate;

  expectTrue(pred([]));
  expectEq('which has length 1', pred([0]));
};

ElementsAreTest.prototype.Description = function() {
  var matcher;

  // Empty
  matcher = elementsAre([]);
  expectEq('is an empty array or Arguments object', matcher.getDescription());
  expectEq('is not an empty array or Arguments object',
           matcher.getNegativeDescription());

  // Length 2
  matcher = elementsAre(['taco', containsRegExp(/t/)]);

  expectEq('is an array or Arguments object of length 2 with elements ' +
               'matching: ' +
               '[ \'taco\', partially matches regex: /t/ ]',
           matcher.getDescription());

  expectEq('is not an array or Arguments object of length 2 with elements ' +
               'matching: ' +
               '[ \'taco\', partially matches regex: /t/ ]',
           matcher.getNegativeDescription());
};

ElementsAreTest.prototype.ArrayLikeObjects = function() {
  // Create a matcher arg and a candidate that aren't arrays, but play them on
  // TV.
  var matcherArg = {};
  var candidate = {};

  matcherArg.length = 2;
  matcherArg[0] = 17;
  matcherArg[1] = containsRegExp(/taco/)

  candidate.length = 2;
  candidate[0] = 17;
  candidate[1] = 'burrito';

  // Create a matcher and kick its tires.
  var matcher = elementsAre(matcherArg);
  var pred = matcher.predicate;

  expectEq(
      'is an array or Arguments object of length 2 with elements ' +
          'matching: [ 17, partially matches regex: /taco/ ]',
      matcher.getDescription());

  expectEq('whose element 1 doesn\'t match', pred(candidate));
};

////////////////////////////////////////////////////////////////////////
// contains
////////////////////////////////////////////////////////////////////////

function ContainsTest() {
  this.wrappedPred_ = createMockFunction();
  this.wrapped_ = new gjstest.Matcher('', '', this.wrappedPred_);
  this.matcher_ = contains(this.wrapped_);
  this.predicate_ = this.matcher_.predicate;
}
registerTestSuite(ContainsTest);

ContainsTest.prototype.NonArrayCandidates = function() {
  var pred = this.predicate_;

  expectEq('which isn\'t an array or Arguments object', pred(undefined));
  expectEq('which isn\'t an array or Arguments object', pred(null));
  expectEq('which isn\'t an array or Arguments object', pred(''));
  expectEq('which isn\'t an array or Arguments object', pred({}));
  expectEq('which isn\'t an array or Arguments object', pred(2));
  expectEq('which isn\'t an array or Arguments object', pred(equals(2)));
};

ContainsTest.prototype.EmptyArray = function() {
  expectFalse(this.predicate_([]));
};

ContainsTest.prototype.EmptyArgs = function() {
  expectFalse(this.predicate_(returnArgs()));
};

ContainsTest.prototype.CallsPredicateForArray = function() {
  var candidate = [ 1, 'taco' ];

  expectCall(this.wrappedPred_)(1)
      .willOnce(returnWith(false));

  expectCall(this.wrappedPred_)('taco')
      .willOnce(returnWith(false));

  this.predicate_(candidate);
};

ContainsTest.prototype.CallsPredicateForArgs = function() {
  var candidate = returnArgs(1, 'taco');

  expectCall(this.wrappedPred_)(1)
      .willOnce(returnWith(false));

  expectCall(this.wrappedPred_)('taco')
      .willOnce(returnWith(false));

  this.predicate_(candidate);
};

ContainsTest.prototype.PredicateSaysNo = function() {
  expectCall(this.wrappedPred_)(_)
      .willOnce(returnWith(false));

  expectFalse(this.predicate_([17]));
};

ContainsTest.prototype.PredicateReturnsString = function() {
  expectCall(this.wrappedPred_)(_)
      .willOnce(returnWith('that is foo'));

  expectFalse(this.predicate_([17]));
};

ContainsTest.prototype.PredicateSaysYesForOneElement = function() {
  expectCall(this.wrappedPred_)(_)
      .willOnce(returnWith(false))
      .willOnce(returnWith(true));

  expectTrue(this.predicate_([17, 19, 23]));
};

ContainsTest.prototype.RawValuesInsteadOfMatcher = function() {
  var pred;

  // String
  pred = contains('taco').predicate;

  expectFalse(pred([1, 'taco_stuff', 2]));
  expectTrue(pred([1, 'taco', 2]));

  // null
  pred = contains(null).predicate;

  expectFalse(pred([1, undefined]));
  expectTrue(pred([1, null]));

  // undefined
  pred = contains(undefined).predicate;

  expectFalse(pred([1, null]));
  expectTrue(pred([1, undefined]));
};

ContainsTest.prototype.DescriptionWithMatcher = function() {
  var matcher = contains(containsRegExp(/t/));

  expectEq('is an array or Arguments object containing an element that ' +
               'partially matches regex: /t/',
           matcher.getDescription());

  expectEq('is not an array or Arguments object containing an element that ' +
               'partially matches regex: /t/',
           matcher.getNegativeDescription());
};

ContainsTest.prototype.DescriptionWithRawValue = function() {
  var matcher = contains('taco');

  expectEq('is an array or Arguments object containing \'taco\'',
           matcher.getDescription());

  expectEq('is not an array or Arguments object containing \'taco\'',
           matcher.getNegativeDescription());
};

ContainsTest.prototype.ArrayLikeObjects = function() {
  var pred = contains(17).predicate;

  var candidate = {};
  candidate.length = 2;
  candidate[0] = 13;
  candidate[1] = 17;

  expectTrue(pred(candidate));
};

////////////////////////////////////////////////////////////////////////
// whenSorted
////////////////////////////////////////////////////////////////////////

function WhenSortedTest() {}
registerTestSuite(WhenSortedTest);

WhenSortedTest.prototype.ArgIsNotMatcher = function() {
  expectThat(function() { whenSorted('taco'); },
             throwsError(/TypeError.*argument.*whenSorted.*matcher/));
};

WhenSortedTest.prototype.Description = function() {
  var wrapped =
      new gjstest.Matcher(
          'has elements [1, 2]',
          'does not have elements [1, 2]',
          function() { return true; });

  var matcher = whenSorted(wrapped);

  expectEq('when sorted, has elements [1, 2]', matcher.getDescription());
  expectEq('when sorted, does not have elements [1, 2]',
           matcher.getNegativeDescription());
};

WhenSortedTest.prototype.NonArrayCandidate = function() {
  var wrapped = new gjstest.Matcher('', '', createMockFunction('pred'));
  var matcher = whenSorted(wrapped);

  expectEq('which isn\'t an array', matcher.predicate(null));
  expectEq('which isn\'t an array', matcher.predicate(undefined));
  expectEq('which isn\'t an array', matcher.predicate(17));
  expectEq('which isn\'t an array', matcher.predicate({}));
};

WhenSortedTest.prototype.CallsWrappedPredicateWithNumbers = function() {
  var wrapped = new gjstest.Matcher('', '', createMockFunction('pred'));
  var matcher = whenSorted(wrapped);

  expectCall(wrapped.predicate)(elementsAre([17, 19, 23]))
      .willOnce(returnWith(false));

  matcher.predicate([23, 17, 19]);
};

WhenSortedTest.prototype.CallsWrappedPredicateWithStrings = function() {
  var wrapped = new gjstest.Matcher('', '', createMockFunction('pred'));
  var matcher = whenSorted(wrapped);

  expectCall(wrapped.predicate)(elementsAre(['burrito', 'enchilada', 'taco']))
      .willOnce(returnWith(false));

  matcher.predicate(['enchilada', 'taco', 'burrito']);
};

WhenSortedTest.prototype.DoesntModifyCandidate = function() {
  var wrapped = new gjstest.Matcher('', '', function() { return false; });
  var matcher = whenSorted(wrapped);

  var candidate = [17, 23, 19];
  matcher.predicate(candidate);

  expectThat(candidate, elementsAre([17, 23, 19]));
};

WhenSortedTest.prototype.WrappedPredicateReturnsString = function() {
  var wrapped = new gjstest.Matcher('', '', createMockFunction('pred'));
  var matcher = whenSorted(wrapped);

  expectCall(wrapped.predicate)(_)
      .willOnce(returnWith('which isn\'t a taco'));

  expectFalse(matcher.predicate([]));
};

WhenSortedTest.prototype.WrappedPredicateReturnsFalse = function() {
  var wrapped = new gjstest.Matcher('', '', createMockFunction('pred'));
  var matcher = whenSorted(wrapped);

  expectCall(wrapped.predicate)(_)
      .willOnce(returnWith(false));

  expectFalse(matcher.predicate([]));
};

WhenSortedTest.prototype.WrappedPredicateReturnsTrue = function() {
  var wrapped = new gjstest.Matcher('', '', createMockFunction('pred'));
  var matcher = whenSorted(wrapped);

  expectCall(wrapped.predicate)(_)
      .willOnce(returnWith(true));

  expectTrue(matcher.predicate([]));
};
