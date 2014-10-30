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
// greaterThan
////////////////////////////////////////////////////////////////////////

function GreaterThanTest() {}
registerTestSuite(GreaterThanTest);

GreaterThanTest.prototype.BadArgs = function() {
  var expected = /TypeError.*greaterThan requires a number/;

  expectThat(function() { greaterThan(null); }, throwsError(expected));
  expectThat(function() { greaterThan(undefined); }, throwsError(expected));
  expectThat(function() { greaterThan('17'); }, throwsError(expected));
  expectThat(function() { greaterThan('taco'); }, throwsError(expected));
  expectThat(function() { greaterThan({}); }, throwsError(expected));
};

GreaterThanTest.prototype.NonNumbers = function() {
  var pred = greaterThan(7).predicate;

  expectEq('which is not a number', pred(null));
  expectEq('which is not a number', pred(undefined));
  expectEq('which is not a number', pred('17'));
  expectEq('which is not a number', pred({}));
};

GreaterThanTest.prototype.Numbers = function() {
  var pred;

  // 7
  pred = greaterThan(7).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectTrue(pred(7.01));
  expectTrue(pred(17));
  expectTrue(pred(Infinity));

  // Infinity
  pred = greaterThan(Infinity).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));

  // -Infinity
  pred = greaterThan(-Infinity).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectTrue(pred(-1));
  expectTrue(pred(0));
  expectTrue(pred(7));
  expectTrue(pred(7.01));
  expectTrue(pred(17));
  expectTrue(pred(Infinity));

  // NaN
  pred = greaterThan(NaN).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));
};

GreaterThanTest.prototype.Descriptions = function() {
  var matcher = greaterThan(7.01);
  expectEq('is greater than 7.01', matcher.getDescription());
  expectEq('is less than or equal to 7.01', matcher.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// greaterOrEqual
////////////////////////////////////////////////////////////////////////

function GreaterOrEqualTest() {}
registerTestSuite(GreaterOrEqualTest);

GreaterOrEqualTest.prototype.BadArgs = function() {
  var expected = /TypeError.*greaterOrEqual requires a number/;

  expectThat(function() { greaterOrEqual(null); }, throwsError(expected));
  expectThat(function() { greaterOrEqual(undefined); }, throwsError(expected));
  expectThat(function() { greaterOrEqual('17'); }, throwsError(expected));
  expectThat(function() { greaterOrEqual('taco'); }, throwsError(expected));
  expectThat(function() { greaterOrEqual({}); }, throwsError(expected));
};

GreaterOrEqualTest.prototype.NonNumbers = function() {
  var pred = greaterOrEqual(7).predicate;

  expectEq('which is not a number', pred(null));
  expectEq('which is not a number', pred(undefined));
  expectEq('which is not a number', pred('17'));
  expectEq('which is not a number', pred({}));
};

GreaterOrEqualTest.prototype.Numbers = function() {
  var pred;

  // 7
  pred = greaterOrEqual(7).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectTrue(pred(7));
  expectTrue(pred(7.01));
  expectTrue(pred(17));
  expectTrue(pred(Infinity));

  // Infinity
  pred = greaterOrEqual(Infinity).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectTrue(pred(Infinity));

  // -Infinity
  pred = greaterOrEqual(-Infinity).predicate;

  expectFalse(pred(NaN));
  expectTrue(pred(-Infinity));
  expectTrue(pred(-1));
  expectTrue(pred(0));
  expectTrue(pred(7));
  expectTrue(pred(7.01));
  expectTrue(pred(17));
  expectTrue(pred(Infinity));

  // NaN
  pred = greaterOrEqual(NaN).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));
};

GreaterOrEqualTest.prototype.Descriptions = function() {
  var matcher = greaterOrEqual(7.01);
  expectEq('is greater than or equal to 7.01', matcher.getDescription());
  expectEq('is less than 7.01', matcher.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// lessThan
////////////////////////////////////////////////////////////////////////

function LessThanTest() {}
registerTestSuite(LessThanTest);

LessThanTest.prototype.BadArgs = function() {
  var expected = /TypeError.*lessThan requires a number/;

  expectThat(function() { lessThan(null); }, throwsError(expected));
  expectThat(function() { lessThan(undefined); }, throwsError(expected));
  expectThat(function() { lessThan('17'); }, throwsError(expected));
  expectThat(function() { lessThan('taco'); }, throwsError(expected));
  expectThat(function() { lessThan({}); }, throwsError(expected));
};

LessThanTest.prototype.NonNumbers = function() {
  var pred = lessThan(7).predicate;

  expectEq('which is not a number', pred(null));
  expectEq('which is not a number', pred(undefined));
  expectEq('which is not a number', pred('17'));
  expectEq('which is not a number', pred({}));
};

LessThanTest.prototype.Numbers = function() {
  var pred;

  // 7
  pred = lessThan(7).predicate;

  expectFalse(pred(NaN));
  expectTrue(pred(-Infinity));
  expectTrue(pred(-1));
  expectTrue(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));

  // Infinity
  pred = lessThan(Infinity).predicate;

  expectFalse(pred(NaN));
  expectTrue(pred(-Infinity));
  expectTrue(pred(-1));
  expectTrue(pred(0));
  expectTrue(pred(7));
  expectTrue(pred(7.01));
  expectTrue(pred(17));
  expectFalse(pred(Infinity));

  // -Infinity
  pred = lessThan(-Infinity).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));

  // NaN
  pred = lessThan(NaN).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));
};

LessThanTest.prototype.Descriptions = function() {
  var matcher = lessThan(7.01);
  expectEq('is less than 7.01', matcher.getDescription());
  expectEq('is greater than or equal to 7.01', matcher.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// lessOrEqual
////////////////////////////////////////////////////////////////////////

function LessOrEqualTest() {}
registerTestSuite(LessOrEqualTest);

LessOrEqualTest.prototype.BadArgs = function() {
  var expected = /TypeError.*lessOrEqual requires a number/;

  expectThat(function() { lessOrEqual(null); }, throwsError(expected));
  expectThat(function() { lessOrEqual(undefined); }, throwsError(expected));
  expectThat(function() { lessOrEqual('17'); }, throwsError(expected));
  expectThat(function() { lessOrEqual('taco'); }, throwsError(expected));
  expectThat(function() { lessOrEqual({}); }, throwsError(expected));
};

LessOrEqualTest.prototype.NonNumbers = function() {
  var pred = lessOrEqual(7).predicate;

  expectEq('which is not a number', pred(null));
  expectEq('which is not a number', pred(undefined));
  expectEq('which is not a number', pred('17'));
  expectEq('which is not a number', pred({}));
};

LessOrEqualTest.prototype.Numbers = function() {
  var pred;

  // 7
  pred = lessOrEqual(7).predicate;

  expectFalse(pred(NaN));
  expectTrue(pred(-Infinity));
  expectTrue(pred(-1));
  expectTrue(pred(0));
  expectTrue(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));

  // Infinity
  pred = lessOrEqual(Infinity).predicate;

  expectFalse(pred(NaN));
  expectTrue(pred(-Infinity));
  expectTrue(pred(-1));
  expectTrue(pred(0));
  expectTrue(pred(7));
  expectTrue(pred(7.01));
  expectTrue(pred(17));
  expectTrue(pred(Infinity));

  // -Infinity
  pred = lessOrEqual(-Infinity).predicate;

  expectFalse(pred(NaN));
  expectTrue(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));

  // NaN
  pred = lessOrEqual(NaN).predicate;

  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred(-1));
  expectFalse(pred(0));
  expectFalse(pred(7));
  expectFalse(pred(7.01));
  expectFalse(pred(17));
  expectFalse(pred(Infinity));
};

LessOrEqualTest.prototype.Descriptions = function() {
  var matcher = lessOrEqual(7.01);
  expectEq('is less than or equal to 7.01', matcher.getDescription());
  expectEq('is greater than 7.01', matcher.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// isNearNumber
////////////////////////////////////////////////////////////////////////

function IsNearNumberTest() {}
registerTestSuite(IsNearNumberTest);

IsNearNumberTest.prototype.BadArgs = function() {
  var expected = /TypeError.*isNearNumber requires two number arguments/;

  expectThat(function() { isNearNumber(null, 1); }, throwsError(expected));
  expectThat(function() { isNearNumber(undefined, 1); }, throwsError(expected));
  expectThat(function() { isNearNumber('17', 1); }, throwsError(expected));
  expectThat(function() { isNearNumber('taco', 1); }, throwsError(expected));
  expectThat(function() { isNearNumber({}, 1); }, throwsError(expected));

  expectThat(function() { isNearNumber(0, null); }, throwsError(expected));
  expectThat(function() { isNearNumber(0, undefined); }, throwsError(expected));
  expectThat(function() { isNearNumber(0, '17'); }, throwsError(expected));
  expectThat(function() { isNearNumber(0, 'taco'); }, throwsError(expected));
  expectThat(function() { isNearNumber(0, {}); }, throwsError(expected));
};

IsNearNumberTest.prototype.NonNumbers = function() {
  var pred = isNearNumber(7, 1).predicate;

  expectEq('which is not a number', pred(null));
  expectEq('which is not a number', pred(undefined));
  expectEq('which is not a number', pred('17'));
  expectEq('which is not a number', pred({}));
};

IsNearNumberTest.prototype.NormalNumbers = function() {
  var pred;

  // Zero
  pred = isNearNumber(0, 17).predicate;
  expectTrue(pred( 0));
  expectTrue(pred(-0));
  expectTrue(pred( 1));
  expectTrue(pred(-1));
  expectTrue(pred( 17));
  expectTrue(pred(-17));
  expectFalse(pred( 17.001));
  expectFalse(pred(-17.001));
  expectFalse(pred(-Infinity));
  expectFalse(pred( Infinity));
  expectFalse(pred(NaN));

  // -100
  pred = isNearNumber(-100, 0.1).predicate;
  expectTrue(pred(-100));
  expectTrue(pred(-100.1));
  expectTrue(pred(-99.9));
  expectFalse(pred(-100.101));
  expectFalse(pred(-99.899));
  expectFalse(pred(100));
  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred( Infinity));
};

IsNearNumberTest.prototype.DegenerateNumbers = function() {
  var pred;

  // NaN
  pred = isNearNumber(NaN, 0.1).predicate;
  expectFalse(pred(0));
  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred( Infinity));

  // Infinity
  pred = isNearNumber(Infinity, 0.1).predicate;
  expectFalse(pred(0));
  expectFalse(pred(NaN));
  expectFalse(pred(-Infinity));
  expectFalse(pred( Infinity));
};

IsNearNumberTest.prototype.Descriptions = function() {
  var matcher = isNearNumber(-17, 19);

  expectEq('is a number within 19 of -17', matcher.getDescription());
  expectEq(
      'is not a number within 19 of -17',
      matcher.getNegativeDescription());
};
