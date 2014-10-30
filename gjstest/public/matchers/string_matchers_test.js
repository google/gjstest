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

////////////////////////////////////////////////////////////////////////
// containsRegExp
////////////////////////////////////////////////////////////////////////

function ContainsRegExpTest() {}
registerTestSuite(ContainsRegExpTest);

ContainsRegExpTest.prototype.WrongTypeArgs = function() {
  function callFunc(arg) { return function() { containsRegExp(arg) } }

  expectThat(callFunc(null), throwsError(/TypeError.*containsRegExp.*RegExp/));
  expectThat(callFunc(17), throwsError(/TypeError.*containsRegExp.*RegExp/));
  expectThat(callFunc('a'), throwsError(/TypeError.*containsRegExp.*RegExp/));
};

ContainsRegExpTest.prototype.NonStringCandidates = function() {
  var pred = containsRegExp(/.+taco.*/).predicate;

  expectEq('which is not a string', pred(null));
  expectEq('which is not a string', pred(undefined));
  expectEq('which is not a string', pred(false));
  expectEq('which is not a string', pred(0));
  expectEq('which is not a string', pred(17));
  expectEq('which is not a string', pred([]));
  expectEq('which is not a string', pred(function() {}));
};

ContainsRegExpTest.prototype.NonMatchingStrings = function() {
  var pred = containsRegExp(/.+taco.*/).predicate;

  expectFalse(pred(''));
  expectFalse(pred('taco'));
  expectFalse(pred('asd tac'));
};

ContainsRegExpTest.prototype.MatchingStrings = function() {
  var pred = containsRegExp(/.+taco.*/).predicate;

  expectTrue(pred('1taco'));
  expectTrue(pred('blah taco blah'));
};

ContainsRegExpTest.prototype.PartialMatch = function() {
  var pred = containsRegExp(/t.*o/).predicate;

  expectTrue(pred('to'));
  expectTrue(pred('taco'));
  expectTrue(pred('burrito and taco filling'));
};

ContainsRegExpTest.prototype.AnchoredToEdges = function() {
  var pred = containsRegExp(/^t.*o$/).predicate;

  expectTrue(pred('to'));
  expectTrue(pred('taco'));
  expectFalse(pred('burrito and taco filling'));
};

ContainsRegExpTest.prototype.Description = function() {
  var matcher = containsRegExp(/.+taco.*/);
  expectEq('partially matches regex: /.+taco.*/', matcher.getDescription());
  expectEq('doesn\'t partially match regex: /.+taco.*/',
           matcher.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// hasSubstr
////////////////////////////////////////////////////////////////////////

function HasSubstrTest() {}
registerTestSuite(HasSubstrTest);

HasSubstrTest.prototype.WrongTypeArgs = function() {
  function callFunc(arg) { return function() { hasSubstr(arg) } }

  expectThat(callFunc(null), throwsError(/TypeError.*hasSubstr.*string/));
  expectThat(callFunc(17), throwsError(/TypeError.*hasSubstr.*string/));
  expectThat(callFunc(/a/), throwsError(/TypeError.*hasSubstr.*string/));
};

HasSubstrTest.prototype.NonStringCandidates = function() {
  var pred = hasSubstr('taco').predicate;

  expectEq('which is not a string', pred(null));
  expectEq('which is not a string', pred(undefined));
  expectEq('which is not a string', pred(false));
  expectEq('which is not a string', pred(0));
  expectEq('which is not a string', pred(17));
  expectEq('which is not a string', pred([]));
  expectEq('which is not a string', pred(function() {}));
};

HasSubstrTest.prototype.NonMatchingStrings = function() {
  var pred = hasSubstr('taco').predicate;

  expectFalse(pred(''));
  expectFalse(pred('tac'));
  expectFalse(pred('aco'));
  expectFalse(pred('burrito'));
  expectFalse(pred('Taco'));
};

HasSubstrTest.prototype.MatchingStrings = function() {
  var pred = hasSubstr('taco').predicate;

  expectTrue(pred('taco'));
  expectTrue(pred('ataco'));
  expectTrue(pred('tacob'));
  expectTrue(pred('atacob'));
};

HasSubstrTest.prototype.NonAscii = function() {
  var pred = hasSubstr('김치').predicate;

  expectTrue(pred('김치'));
  expectTrue(pred('맛있는 김치'));
};

HasSubstrTest.prototype.Description = function() {
  var matcher = hasSubstr('taco');

  expectEq('is a string containing the substring \'taco\'',
           matcher.getDescription());

  expectEq('is not a string containing the substring \'taco\'',
           matcher.getNegativeDescription());
};
