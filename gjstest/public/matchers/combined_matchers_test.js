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

//////////////////////////////////////////////////////
// anyOf
//////////////////////////////////////////////////////

function AnyOfTest() {}
registerTestSuite(AnyOfTest);

AnyOfTest.prototype.EmptyArray = function() {
};

AnyOfTest.prototype.SingleMatcherArray = function() {
};

AnyOfTest.prototype.SingleValueArray = function() {
};

AnyOfTest.prototype.MultipleElementArray = function() {
};
