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
// _
////////////////////////////////////////////////////////////////////////

function AnythingTest() {}
registerTestSuite(AnythingTest);

AnythingTest.prototype.DoesntUnderstandMissingArgs = function() {
  expectFalse(_.understandsMissingArgs);
};

AnythingTest.prototype.MatchesEverything = function() {
  var pred = _.predicate;

  expectTrue(pred(undefined));
  expectTrue(pred(null));
  expectTrue(pred(false));
  expectTrue(pred(0));
  expectTrue(pred(17));
  expectTrue(pred(''));
  expectTrue(pred('taco'));
  expectTrue(pred({}));
  expectTrue(pred([]));
  expectTrue(pred(['taco']));
  expectTrue(pred(function() {}));
};

AnythingTest.prototype.Description = function() {
  expectEq('is anything', _.getDescription());
};

////////////////////////////////////////////////////////////////////////
// equals
////////////////////////////////////////////////////////////////////////

function EqualsTest() {}
registerTestSuite(EqualsTest);

EqualsTest.prototype.NotEqual = function() {
  var pred;

  pred = equals('').predicate;
  expectFalse(pred('a'));
  expectFalse(pred('0'));

  pred = equals('taco').predicate;
  expectFalse(pred('burrito'));
  expectFalse(pred('enchilada'));

  pred = equals(2).predicate;
  expectFalse(pred(1.9));
  expectFalse(pred(2.1));
  expectFalse(pred(3));

  pred = equals(true).predicate;
  expectFalse(pred(false));

  pred = equals({}).predicate;
  expectFalse(pred(17));
  expectEq('which is a reference to a different object', pred({}));

  pred = equals(NaN).predicate;
  expectFalse(pred(NaN));
};

EqualsTest.prototype.Equal = function() {
  var pred;

  pred = equals('').predicate;
  expectTrue(pred(''));

  pred = equals('taco').predicate;
  expectTrue(pred('taco'));

  pred = equals(2).predicate;
  expectTrue(pred(2));
  expectTrue(pred(2.0));
  expectTrue(pred(1 + 1));

  pred = equals(2.3).predicate;
  expectTrue(pred(2.3));

  pred = equals(true).predicate;
  expectTrue(pred(true));

  var obj = {};
  pred = equals(obj).predicate;
  expectTrue(pred(obj));

  pred = equals(null).predicate;
  expectTrue(pred(null));

  pred = equals(undefined).predicate;
  expectTrue(pred(undefined));
};

EqualsTest.prototype.WrongTypes = function() {
  var pred;

  pred = equals('').predicate;
  expectFalse(pred(0));
  expectFalse(pred([]));

  pred = equals('17').predicate;
  expectFalse(pred(0));

  pred = equals(17).predicate;
  expectFalse(pred('17'));

  pred = equals(true).predicate;
  expectFalse(pred(1));
  expectFalse(pred('1'));

  pred = equals(null).predicate;
  expectFalse(pred(undefined));

  pred = equals(undefined).predicate;
  expectFalse(pred(null));
};

EqualsTest.prototype.Description = function() {
  var matcher;

  matcher = equals(null)
  expectEq('null', matcher.getDescription());
  expectEq('does not equal: null', matcher.getNegativeDescription());

  matcher = equals(112);
  expectEq('112', matcher.getDescription());
  expectEq('does not equal: 112', matcher.getNegativeDescription());

  matcher = equals('taco\nburrito');
  expectEq('\'taco\\nburrito\'', matcher.getDescription());
  expectEq('does not equal: \'taco\\nburrito\'', matcher.getNegativeDescription());

  matcher = equals([1, 2]);
  expectEq('is a reference to: [ 1, 2 ]', matcher.getDescription());
  expectEq('is not a reference to: [ 1, 2 ]',
           matcher.getNegativeDescription());

  matcher = equals({foo: 2, bar: 3});
  expectEq('is a reference to: { foo: 2, bar: 3 }', matcher.getDescription());
  expectEq('is not a reference to: { foo: 2, bar: 3 }',
           matcher.getNegativeDescription());

  matcher = equals(function fooBar(baz) {});
  expectEq('is a reference to: function fooBar(baz)', matcher.getDescription());
  expectEq('is not a reference to: function fooBar(baz)',
           matcher.getNegativeDescription());

  matcher = equals({
    gjstestEquals: function() { return true; }
  });
  expectEq('{ gjstestEquals: function () }', matcher.getDescription());
  expectEq('does not equal: { gjstestEquals: function () }',
           matcher.getNegativeDescription());
};

EqualsTest.prototype.GjstestEqualsWithSameType = function() {
  function MyClass() {}

  var obj1 = new MyClass;
  var obj2 = new MyClass;

  obj1.gjstestEquals = createMockFunction('obj1.gjstestEquals');
  obj2.gjstestEquals = createMockFunction('obj2.gjstestEquals');

  var pred = equals(obj1).predicate;

  expectCall(obj1.gjstestEquals)(obj2)
      .willOnce(returnWith(true));
  expectTrue(pred(obj2));

  expectCall(obj1.gjstestEquals)(obj2)
      .willOnce(returnWith(false));
  expectFalse(pred(obj2));
};

EqualsTest.prototype.GjstestEqualsWithDifferentTypes = function() {
  function MyClass1() {}
  MyClass1.prototype.gjstestEquals = gjstest.createMockFunction();

  function MyClass2() {}
  MyClass2.prototype.gjstestEquals = gjstest.createMockFunction();

  var pred = equals(new MyClass1).predicate;
  expectEq('which is a reference to a different object', pred(new MyClass2));
};

////////////////////////////////////////////////////////////////////////
// isNull
////////////////////////////////////////////////////////////////////////

function IsNullTest() {}
registerTestSuite(IsNullTest);

IsNullTest.prototype.Matches = function() {
  var pred = isNull.predicate;

  expectTrue(pred(null));
};

IsNullTest.prototype.NonMatches = function() {
  var pred = isNull.predicate;

  expectFalse(pred(undefined));
  expectFalse(pred(false));
  expectFalse(pred(0));
};

IsNullTest.prototype.Description = function() {
  expectEq('is null', isNull.getDescription());
  expectEq('is not null', isNull.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// isUndefined
////////////////////////////////////////////////////////////////////////

function IsUndefinedTest() {}
registerTestSuite(IsUndefinedTest);

IsUndefinedTest.prototype.Matches = function() {
  var pred = isUndefined.predicate;

  expectTrue(pred(undefined));
};

IsUndefinedTest.prototype.NonMatches = function() {
  var pred = isUndefined.predicate;

  expectFalse(pred(null));
  expectFalse(pred(false));
  expectFalse(pred(0));
};

IsUndefinedTest.prototype.Description = function() {
  expectEq('is undefined', isUndefined.getDescription());
  expectEq('is not undefined', isUndefined.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// recursivelyEquals
////////////////////////////////////////////////////////////////////////

function RecursivelyEqualsTest() {}
registerTestSuite(RecursivelyEqualsTest);

RecursivelyEqualsTest.prototype.NonObjectArgs = function() {
  var expected = /TypeError.*recursivelyEquals.*plain object or array/;

  expectThat(function() { recursivelyEquals(null) }, throwsError(expected));
  expectThat(function() { recursivelyEquals(17) }, throwsError(expected));
  expectThat(function() { recursivelyEquals('asd') }, throwsError(expected));

  expectThat(function() { recursivelyEquals(function() {}) },
             throwsError(expected));

  expectThat(function() { recursivelyEquals(undefined) },
             throwsError(expected));

  function MyClass() {}
  expectThat(function() { recursivelyEquals(new MyClass) },
             throwsError(expected));
};

RecursivelyEqualsTest.prototype.SelfReferenceInExpected = function() {
  var pred;
  var nonTree = {foo: 2, bar: [17]};
  nonTree.bar.push(nonTree);

  var expected = /TypeError.*recursivelyEquals.*non-tree.*foo:/;
  expectThat(function() { recursivelyEquals(nonTree); }, throwsError(expected));
  expectFalse('__gjstest_containsCycle_already_seen' in nonTree);
};

RecursivelyEqualsTest.prototype.SelfReferenceInActual = function() {
  var pred;
  var someObj = {foo: 2, bar: [17]};
  var nonTree = {foo: 2, bar: [17]};
  nonTree.bar.push(nonTree);

  expectEq('which differs in key bar.1',
           recursivelyEquals(someObj).predicate(nonTree));
  expectFalse('__gjstest_containsCycle_already_seen' in nonTree);
};

RecursivelyEqualsTest.prototype.WrongTypeCandidates = function() {
  var pred;
  function MyClass() {}

  // Object input
  pred = recursivelyEquals({}).predicate;
  expectEq('which is not an Object', pred(null));
  expectEq('which is not an Object', pred(17));
  expectEq('which is not an Object', pred('taco'));
  expectEq('which is not an Object', pred(function() {}));
  expectEq('which is not an Object', pred(new MyClass));
  expectEq('which is not an Object', pred([]));

  // Array input
  pred = recursivelyEquals([]).predicate;
  expectEq('which is not an Array', pred(null));
  expectEq('which is not an Array', pred(17));
  expectEq('which is not an Array', pred('taco'));
  expectEq('which is not an Array', pred(function() {}));
  expectEq('which is not an Array', pred(new MyClass));
  expectEq('which is not an Array', pred({}));
};

RecursivelyEqualsTest.prototype.DifferingKeys = function() {
  var pred;
  var obj;

  // Empty
  obj = {};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key foo', pred({foo: undefined}));

  // One key
  obj = {foo: 17};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key foo', pred({}));
  expectEq('which differs in key foo', pred({bar: 17}));
  expectEq('which differs in key bar', pred({foo: 17, bar: 17}));

  // Two keys
  obj = {foo: 17, bar: 19};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key foo', pred({bar: 17}));
  expectEq('which differs in key baz', pred({foo: 17, bar: 19, baz: 23}));

  // Second level
  obj = {foo: 17, bar: {baz: 19}};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key bar.baz', pred({foo: 17, bar: {}}));
  expectEq('which differs in key bar.blah',
           pred({foo: 17, bar: {baz: 19, blah: 0}}));
};

RecursivelyEqualsTest.prototype.DifferingSimpleValues = function() {
  var pred;
  var obj;

  // First level
  obj = {foo: 17, bar: 'taco'};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in value for key foo',
           pred({foo: 19, bar: 'taco'}));
  expectEq('which differs in value for key bar',
           pred({foo: 17, bar: 'burrito'}));

  // Edge-cases
  obj = {foo: undefined, bar: null};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in value for key foo',
           pred({foo: null, bar: null}));
  expectEq('which differs in value for key bar',
           pred({foo: undefined, bar: undefined}));

  // Second level
  obj = {foo: 17, bar: {baz: 19}};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in value for key bar.baz',
           pred({foo: 17, bar: {baz: 0}}));
  expectEq('which differs in value for key bar.baz',
           pred({foo: 17, bar: {baz: undefined}}));
  expectEq('which differs in value for key bar.baz',
           pred({foo: 17, bar: {baz: 'taco'}}));

  // Object expected, simple value found
  obj = {foo: 17, bar: {baz: 19}};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which has wrong type for key bar',
           pred({foo: 17, bar: 'taco'}));

  // Simple value expected, object found
  obj = {foo: 17, bar: 'taco'};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in value for key bar',
           pred({foo: 17, bar: {baz: 19}}));
};

RecursivelyEqualsTest.prototype.DifferingReferences = function() {
  var pred;
  var obj;

  // Custom class
  function MyClass() {}
  var instance_0 = new MyClass;
  var instance_1 = new MyClass;

  obj = {foo: instance_0};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in reference for key foo', pred({foo: instance_1}));

  // Functions
  var func_0 = function() {};
  var func_1 = function() {};

  obj = {foo: func_0};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in reference for key foo', pred({foo: func_1}));
};

RecursivelyEqualsTest.prototype.MixedArraysAndObjects = function() {
  var pred;
  var obj;

  // Object expected, array actual.
  obj = {foo: {0: 'taco'}};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which has wrong type for key foo', pred({foo: ['taco']}));

  // Array expected, object actual.
  obj = {foo: ['taco']};
  pred = recursivelyEquals(obj).predicate;
  expectEq('which has wrong type for key foo', pred({foo: {0: 'taco'}}));
};

RecursivelyEqualsTest.prototype.EverythingMatches = function() {
  var pred;
  var obj;

  obj = {foo: {0: 'taco'}, bar: 19};
  pred = recursivelyEquals(obj).predicate;
  expectTrue(pred({bar: 19, foo: {0: 'taco'}}));
};

RecursivelyEqualsTest.prototype.Arrays = function() {
  var pred;
  var obj;

  // Empty
  obj = [];
  pred = recursivelyEquals(obj).predicate;
  expectTrue(pred([]));
  expectEq('which differs in key 0', pred(['taco']));

  // Simple values
  obj = ['taco', 'burrito'];
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key 0', pred([]));
  expectEq('which differs in key 1', pred(['taco']));
  expectTrue(pred(['taco', 'burrito']));
  expectEq('which differs in value for key 1', pred(['taco', 'enchilada']));
  expectEq('which differs in key 2', pred(['taco', 'burrito', 'enchilada']));

  // Embedded array
  obj = ['taco', ['burrito', 'enchilada']];
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key 0', pred([]));
  expectEq('which differs in key 1', pred(['taco']));
  expectEq('which differs in key 1.0', pred(['taco', []]));
  expectEq('which differs in key 1.1', pred(['taco', ['burrito']]));
  expectEq('which differs in value for key 1.1',
           pred(['taco', ['burrito', 'queso']]));

  expectTrue(pred(['taco', ['burrito', 'enchilada']]));

  // Missing element vs. present element
  obj = [];
  obj[0] = 0;
  obj[2] = 2;
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key 1', pred([0, 1, 2]));

  // Missing elements vs. undefined
  obj = [];
  obj[0] = 0;
  obj[2] = 2;
  pred = recursivelyEquals(obj).predicate;
  expectEq('which differs in key 1', pred([0, undefined, 2]));

  // Missing elements vs. missing elements
  obj = [];
  obj[0] = 0;
  obj[2] = 2;
  obj.length = 4;

  var otherArray = [];
  otherArray = [];
  otherArray[0] = 0;
  otherArray[2] = 2;
  otherArray.length = 4;


  pred = recursivelyEquals(obj).predicate;
  expectTrue(pred(otherArray));
};

RecursivelyEqualsTest.prototype.NestedMatchers = function() {
  var isOdd = new gjstest.Matcher(
      'is odd',
      'is even',
      function(obj) {
        if (obj == 42) {
          return 'is the meaning of life';  // To test string returns.
        }
        return obj % 2 == 1;
      });

  obj = [isOdd, {a: isOdd, b: 2 }];
  pred = recursivelyEquals(obj).predicate;
  expectEq('which does not satisfy matcher for key 0 (is even)',
           pred([4]));
  expectEq('which does not satisfy matcher for key 0 (is the meaning of life)',
           pred([42]));
  expectEq('which does not satisfy matcher for key 1.a (is even)',
           pred([3, {a: 6, b: 2}]));

  expectTrue(pred([3, {a: 7, b: 2}]));
};

RecursivelyEqualsTest.prototype.Descriptions = function() {
  var matcher = recursivelyEquals({foo: ['taco'], bar: 17});

  expectEq("recursively equals { foo: [ 'taco' ], bar: 17 }",
           matcher.getDescription());

  expectEq("does not recursively equal { foo: [ 'taco' ], bar: 17 }",
           matcher.getNegativeDescription());
};

RecursivelyEqualsTest.prototype.GjstestEqualsWithSameType = function() {
  function MyClass() {}

  var obj1 = new MyClass;
  var obj2 = new MyClass;

  obj1.gjstestEquals = gjstest.createMockFunction('obj1.gjstestEquals');
  obj2.gjstestEquals = gjstest.createMockFunction('obj2.gjstestEquals');

  var pred = recursivelyEquals([obj1]).predicate;

  expectCall(obj1.gjstestEquals)(obj2)
      .willOnce(returnWith(true));
  expectTrue(pred([obj2]));

  expectCall(obj1.gjstestEquals)(obj2)
      .willOnce(returnWith(false));
  expectEq('which differs in value for key 0', pred([obj2]));
};

RecursivelyEqualsTest.prototype.GjstestEqualsWithDifferentTypes = function() {
  function MyClass1() {}
  MyClass1.prototype.gjstestEquals = gjstest.createMockFunction();

  function MyClass2() {}
  MyClass2.prototype.gjstestEquals = gjstest.createMockFunction();

  var pred = recursivelyEquals([new MyClass1]).predicate;
  expectEq('which differs in reference for key 0', pred([new MyClass2]));
};
