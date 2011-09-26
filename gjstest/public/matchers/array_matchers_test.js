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
// Helpers
//////////////////////////////////////////////////////

// Helper function for getting ahold of an Arguments object.
function returnArgs() { return arguments; }

//////////////////////////////////////////////////////
// ElementsAre
//////////////////////////////////////////////////////

function ElementsAreTest() {}
registerTestSuite(ElementsAreTest);

ElementsAreTest.prototype.nonArrayArgument = function() {
  var error;

  expectThat(function() { elementsAre(null) },
             throwsError(/TypeError.*elementsAre.*array or Arguments/));

  expectThat(function() { elementsAre(undefined) },
             throwsError(/TypeError.*elementsAre.*array or Arguments/));

  expectThat(function() { elementsAre(2) },
             throwsError(/TypeError.*elementsAre.*array or Arguments/));
};

ElementsAreTest.prototype.nonArrayCandidates = function() {
  var pred = elementsAre([]).predicate;

  expectEq('which isn\'t an array or Arguments object', pred(undefined));
  expectEq('which isn\'t an array or Arguments object', pred(null));
  expectEq('which isn\'t an array or Arguments object', pred(''));
  expectEq('which isn\'t an array or Arguments object', pred({}));
  expectEq('which isn\'t an array or Arguments object', pred(2));
  expectEq('which isn\'t an array or Arguments object', pred(equals(2)));
};

ElementsAreTest.prototype.wrongLength = function() {
  var pred = elementsAre([_, _]).predicate;

  expectEq('which has length 0', pred([]));
  expectEq('which has length 1', pred([0]));
  expectEq('which has length 3', pred([0, 1, 2]));
};

ElementsAreTest.prototype.nonMatchingMatchers = function() {
  var pred =
    elementsAre([equals(0), containsRegExp(/^t.*o$/)]).predicate;

  expectEq('whose element 0 doesn\'t match', pred([1, 'taco']));
  expectEq('whose element 1 doesn\'t match', pred([0, 'taco filling']));
};

ElementsAreTest.prototype.allMatch = function() {
  var pred =
    elementsAre([equals(17), containsRegExp(/^t.*o$/)]).predicate;

  expectTrue(pred([17, 'taco']));
  expectTrue(pred([17, 'taco and burrito']));
};

ElementsAreTest.prototype.matcherReturnsString = function() {
  var innerMatcher = new gjstest.Matcher('', '', function() { return 'taco'; });
  var pred = elementsAre([innerMatcher]).predicate;

  expectEq('whose element 0 doesn\'t match', pred([undefined]));
};

ElementsAreTest.prototype.rawValues = function() {
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

ElementsAreTest.prototype.argumentsObject = function() {
  var obj = {};
  var pred = elementsAre([obj, containsRegExp(/t.+o/)]).predicate;

  // Everything equal.
  expectTrue(pred(returnArgs(obj, 'taco')));

  // Some non-equal.
  expectEq('whose element 0 doesn\'t match', pred(returnArgs({}, 'taco')));
  expectEq('whose element 1 doesn\'t match', pred(returnArgs(obj, 'burrito')));
};

ElementsAreTest.prototype.emptyArrays = function() {
  var pred = elementsAre([]).predicate;

  expectTrue(pred([]));
  expectEq('which has length 1', pred([0]));
};

ElementsAreTest.prototype.description = function() {
  var matcher;

  // Empty
  matcher = elementsAre([]);
  expectEq('is an empty array or Arguments object', matcher.description);
  expectEq('is not an empty array or Arguments object',
           matcher.negativeDescription);

  // Length 2
  matcher = elementsAre(['taco', containsRegExp(/t/)]);

  expectEq('is an array or Arguments object of length 2 with elements ' +
               'matching: ' +
               '[ \'taco\', partially matches regex: /t/ ]',
           matcher.description);

  expectEq('is not an array or Arguments object of length 2 with elements ' +
               'matching: ' +
               '[ \'taco\', partially matches regex: /t/ ]',
           matcher.negativeDescription);
};

//////////////////////////////////////////////////////
// Contains
//////////////////////////////////////////////////////

function ContainsTest() {}
registerTestSuite(ContainsTest);

ContainsTest.prototype.NonArrayCandidates = function() {
  var pred = contains(17).predicate;

  expectEq('which isn\'t an array or Arguments object', pred(undefined));
  expectEq('which isn\'t an array or Arguments object', pred(null));
  expectEq('which isn\'t an array or Arguments object', pred(''));
  expectEq('which isn\'t an array or Arguments object', pred({}));
  expectEq('which isn\'t an array or Arguments object', pred(2));
  expectEq('which isn\'t an array or Arguments object', pred(equals(2)));
};

ContainsTest.prototype.EmptyArray = function() {
  var pred = contains(17).predicate;

  expectEq('which is empty', pred([]));
};

ContainsTest.prototype.EmptyArgs = function() {
  var pred = contains(17).predicate;

  expectEq('which is empty', pred(returnArgs()));
};

ContainsTest.prototype.CallsMatcherForArray = function() {
};

ContainsTest.prototype.CallsMatcherForArgs = function() {
};

ContainsTest.prototype.MatcherSaysNo = function() {
};

ContainsTest.prototype.MatcherReturnsString = function() {
};

ContainsTest.prototype.MatcherSaysYesForOneElement = function() {
};

ContainsTest.prototype.RawValueInsteadOfMatcher = function() {
};

ContainsTest.prototype.DescriptionWithMatcher = function() {
};

ContainsTest.prototype.DescriptionWithRawValue = function() {
};
