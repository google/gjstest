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

function StringifyTest() { }
registerTestSuite(StringifyTest);

StringifyTest.prototype.PrimitiveTypes = function() {
  expectEq('null', stringify(null));
  expectEq('undefined', stringify(undefined));

  expectEq('false', stringify(false));
  expectEq('true', stringify(true));

  expectEq('0', stringify(0));
  expectEq('1.5', stringify(1.5));
  expectEq('-1', stringify(-1));
  expectEq('NaN', stringify(NaN));
};

StringifyTest.prototype.Strings = function() {
  expectEq("''", stringify(''));
  expectEq("'taco burrito'", stringify('taco burrito'));
  expectEq("'taco\\nburrito\\nenchilada'",
           stringify('taco\nburrito\nenchilada'));
};

StringifyTest.prototype.RegExps = function() {
  expectEq('/taco.*burrito/', stringify(/taco.*burrito/));
};

StringifyTest.prototype.Errors = function() {
  var error = new TypeError('taco burrito');
  expectEq('TypeError: taco burrito', stringify(error));
};

StringifyTest.prototype.Dates = function() {
  var date = new Date(1985, 2, 18);
  expectEq(date.toString(), stringify(date));
};

StringifyTest.prototype.Functions = function() {
  function fooBar(baz) {
    doSomething(baz);
    return baz + 1;
  };

  expectEq('function fooBar(baz)', stringify(fooBar));
  expectEq('function ()', stringify(function() {}));
  expectEq('function (foo, bar)', stringify(function(  foo  ,  bar  ) {}));
};

StringifyTest.prototype.Objects = function() {
  expectEq('{}', stringify({}));
  expectEq('{ foo: 1, bar: 2 }', stringify({ foo: 1, bar: 2 }));

  var multiLevelObj = {
      foo: 1,
      bar: { baz: 2 }
  };
  expectEq('{ foo: 1, bar: { baz: 2 } }', stringify(multiLevelObj));
};

StringifyTest.prototype.RecursiveReferences = function() {
  // Object
  var obj = { foo: 1 };
  obj.bar = obj;
  expectEq('{ foo: 1, bar: {...} }', stringify(obj));

  // Array
  var arr = [1];
  arr.push(arr);
  expectEq('[ 1, [...] ]', stringify(arr));
};

StringifyTest.prototype.RepeatedReferences = function() {
  // Object
  var childObject = { foo: 1 };
  var parentObject = { x: childObject, y: childObject };
  expectEq('{ x: { foo: 1 }, y: {...} }', stringify(parentObject));

  // Array
  var childArray = [1];
  var parentArray = [childArray, childArray];

  expectEq('[ [ 1 ], [...] ]', stringify(parentArray));

  // In a DOM, each node may refer to the document. We don't want to expand the
  // document on each reference.
  var document = {};
  var head = { document: document, tag: 'HEAD', children: [] };
  var body = { document: document, tag: 'BODY', children: [] };
  var html = { document: document, tag: 'HTML', children: [head, body] };
  document.root = html;
  expectEq(
      "{ root: { document: {...}, tag: 'HTML', children: [ " +
           "{ document: {...}, tag: 'HEAD', children: [] }, " +
           "{ document: {...}, tag: 'BODY', children: [] } ] } }",
      stringify(document));
};

StringifyTest.prototype.MaximumDepth = function() {
  // Object
  var obj = { a: { b: { c: { d: { e: null, f: 1, g: {}, h: { i: 1 } } } } } };
  expectEq('{ a: { b: { c: { d: { e: null, f: 1, g: {}, h: {...} } } } } }',
      stringify(obj));

  // Array
  var arr = [ [ [ [ [ null, 1, [], [ 1 ] ] ] ] ] ];
  expectEq('[ [ [ [ [ null, 1, [], [...] ] ] ] ] ]', stringify(arr));
};

StringifyTest.prototype.PropertiesNotChanged = function() {
  // Object
  var obj = {foo: 1, bar: {baz: 19}};
  var objectPropertiesBeforeStringify = Object.keys(obj).toString();
  stringify(obj);
  expectEq(objectPropertiesBeforeStringify, Object.keys(obj).toString());

  // Array
  var arr = [0, [1, 2]];
  var arrayPropertiesBeforeStringify = Object.keys(arr).toString();
  stringify(arr);
  expectEq(arrayPropertiesBeforeStringify, Object.keys(arr).toString());
};

StringifyTest.prototype.Arrays = function() {
  expectEq('[]', stringify([]));
  expectEq('[ 1, \'foo\\nbar\' ]', stringify([ 1, 'foo\nbar' ]));
  expectEq('[ [ 1 ], { foo: 2 } ]', stringify([ [1], { foo: 2 } ]));
};

StringifyTest.prototype.ArrayWithMissingElements = function() {
  // Cause indexes 1, 3, and 4 to be missing.
  var a = [];
  a[0] = 'foo';
  a[2] = 'bar';
  a.length = 5;

  expectEq('[ \'foo\', , \'bar\', ,  ]', stringify(a));
};

StringifyTest.prototype.ArgumentObjects = function() {
  function grabArgs() { return arguments; }

  expectEq('[]', stringify(grabArgs()));
  expectEq('[ 1, \'foo\\nbar\' ]', stringify(grabArgs(1, 'foo\nbar')));
  expectEq('[ [ 1 ], { foo: 2 } ]', stringify(grabArgs([1], { foo: 2 })));
};

StringifyTest.prototype.UserDefinedClass = function() {
  function MyClass() {}
  MyClass.prototype.toString = function() { return 'MyClass: taco'; };
  var instance = new MyClass;

  // User defined classes can override the toString method.
  expectEq('MyClass: taco', stringify(instance));

  function OtherClass() {}
  OtherClass.prototype.method = function() {};
  var instance = new OtherClass;

  // Methods are not printed.
  expectEq('{}', stringify(instance));
};

StringifyTest.prototype.Inheritance = function() {
  function Parent() {}
  var parent = new Parent();
  function Child() {}
  Child.prototype = parent;
  var child = new Child;
  child.a = 1;
  Child.prototype.b = 2;
  parent.c = 3;
  Parent.prototype.d = 4;

  // Inherited properties are not included.
  expectEq(child.a, 1);
  expectEq(child.b, 2);
  expectEq(child.c, 3);
  expectEq(child.d, 4);
  expectEq('{ a: 1 }', stringify(child));
};
