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

function captureError(func) {
  var error = null;
  try {
    func();
  } catch (e) {
    return e;
  }

  return error;
}

////////////////////////////////////////////////////////////////////////
// Tests
////////////////////////////////////////////////////////////////////////

function MockInstanceTest() {
  // Make a mock version of createMockFunction.
  this.createMockFunction_ = gjstest.createMockFunction();

  // Make a pre-bound version of createMockInstance that uses it.
  this.createMockInstance_ = function(ctor) {
    return gjstest.internal.createMockInstance(ctor, this.createMockFunction_);
  };
}
registerTestSuite(MockInstanceTest);

MockInstanceTest.prototype.NotAFunction = function() {
  var me = this;
  var error = captureError(function() {
    me.createMockInstance_({});
  });

  expectThat(error.toString(), containsRegExp(/TypeError.*function/));
};

MockInstanceTest.prototype.CreatesInstanceOf = function() {
  function MyClass() {}
  var result = this.createMockInstance_(MyClass);

  expectTrue(result instanceof MyClass);
};

MockInstanceTest.prototype.ES6CreatesInstanceOf = function() {
  const MyClass = class {
    constructor() {}
  };
  var result = this.createMockInstance_(MyClass);

  expectTrue(result instanceof MyClass);
};

MockInstanceTest.prototype.AddsMockMethods = function() {
  // Class
  function MyClass() {}
  MyClass.prototype.taco = function() {};
  MyClass.prototype.burrito = function() {};

  // Existence and enumerability assertions
  expectTrue(MyClass.prototype.hasOwnProperty('taco'));
  expectTrue(MyClass.prototype.hasOwnProperty('burrito'));
  expectTrue(MyClass.prototype.propertyIsEnumerable('taco'));
  expectTrue(MyClass.prototype.propertyIsEnumerable('burrito'));

  // Mock functions
  var mockFn_0 = function() {};
  var mockFn_1 = function() {};

  expectCall(this.createMockFunction_)('MyClass.taco')
    .willOnce(returnWith(mockFn_0));

  expectCall(this.createMockFunction_)('MyClass.burrito')
    .willOnce(returnWith(mockFn_1));

  // Properties
  var result = this.createMockInstance_(MyClass);

  expectEq(mockFn_0, result.taco);
  expectEq(mockFn_1, result.burrito);
};

MockInstanceTest.prototype.AddsMockMethodsToAnonymousClass = function() {
  // Class
  function MyClass() {}
  MyClass.prototype = {
    taco: function() {},
    burrito: function() {},
  };

  // Existence and enumerability assertions
  expectTrue(MyClass.prototype.hasOwnProperty('taco'));
  expectTrue(MyClass.prototype.hasOwnProperty('burrito'));
  expectTrue(MyClass.prototype.propertyIsEnumerable('taco'));
  expectTrue(MyClass.prototype.propertyIsEnumerable('burrito'));

  // Mock functions
  var mockFn_0 = function() {};
  var mockFn_1 = function() {};

  expectCall(this.createMockFunction_)('MyClass.taco')
    .willOnce(returnWith(mockFn_0));

  expectCall(this.createMockFunction_)('MyClass.burrito')
    .willOnce(returnWith(mockFn_1));

  // Properties
  var result = this.createMockInstance_(MyClass);

  expectEq(mockFn_0, result.taco);
  expectEq(mockFn_1, result.burrito);
};

MockInstanceTest.prototype.ES6AddsMockMethods = function() {
  // Class
  const MyClass = class {
    constructor() {}
    taco() {}
    burrito() {}
  };

  // Existence and enumerability assertions
  expectTrue(MyClass.prototype.hasOwnProperty('taco'));
  expectTrue(MyClass.prototype.hasOwnProperty('burrito'));

  // ES6 prototype properties are not enumerable (will not be iterated over in
  // a for-in loop)
  expectFalse(MyClass.prototype.propertyIsEnumerable('taco'));
  expectFalse(MyClass.prototype.propertyIsEnumerable('burrito'));

  // Mock functions
  var mockFn_0 = function() {};
  var mockFn_1 = function() {};

  expectCall(this.createMockFunction_)('MyClass.taco')
    .willOnce(returnWith(mockFn_0));

  expectCall(this.createMockFunction_)('MyClass.burrito')
    .willOnce(returnWith(mockFn_1));

  // Properties
  var result = this.createMockInstance_(MyClass);

  expectEq(mockFn_0, result.taco);
  expectEq(mockFn_1, result.burrito);
};

MockInstanceTest.prototype.PreservesOtherPrototypeProperties = function() {
  // Class
  function MyClass() {}
  MyClass.prototype.taco = 17;

  // Properties
  var result = this.createMockInstance_(MyClass);
  expectEq(17, result.taco);
};

MockInstanceTest.prototype.ES6PreservesOtherPrototypeProperties = function() {
  // Class
  const MyClass = class {
    constructor() {}
  };
  MyClass.prototype.taco = 17;

  // Properties
  var result = this.createMockInstance_(MyClass);
  expectEq(17, result.taco);
};

MockInstanceTest.prototype.DoesNotCallConstructor = function() {
  var called = false;
  function MyClass() { called = true; }
  this.createMockInstance_(MyClass);

  expectFalse(called);
};

MockInstanceTest.prototype.ES6DoesNotCallConstructor = function() {
  var called = false;
  const MyClass = class {
    constructor() {
      called = true;
    }
  };
  this.createMockInstance_(MyClass);

  expectFalse(called);
};

MockInstanceTest.prototype.Inheritance = function() {
  // Parent class
  function ParentClass() {}
  ParentClass.prototype.taco = 17;
  ParentClass.prototype.burrito = function() {};

  // Child class
  function ChildClass() {}

  function TempClass() {}
  TempClass.prototype = ParentClass.prototype;
  ChildClass.prototype = new TempClass;

  ChildClass.prototype.enchilada = 19;
  ChildClass.prototype.queso = function() {};

  // Mock functions
  var mockFn_0 = function() {};
  var mockFn_1 = function() {};

  expectCall(this.createMockFunction_)('ChildClass.queso')
    .willOnce(returnWith(mockFn_0));

  expectCall(this.createMockFunction_)('ChildClass.burrito')
    .willOnce(returnWith(mockFn_1));

  // Properties
  var result = this.createMockInstance_(ChildClass);

  expectEq(mockFn_0, result.queso);
  expectEq(mockFn_1, result.burrito);

  expectEq(17, result.taco);
  expectEq(19, result.enchilada);

  // Types
  expectTrue(result instanceof ParentClass);
  expectTrue(result instanceof ChildClass);
};

MockInstanceTest.prototype.ES6Inheritance = function() {
  // Parent class
  const ParentClass = class {
    constructor() {}
    burrito() {}
  };
  ParentClass.prototype.taco = 17;

  // Child class
  const ChildClass = class extends ParentClass {
    constructor() {
      super();
    }
    queso() {}
  };
  ChildClass.prototype.enchilada = 19;

  // Mock functions
  var mockFn_0 = function() {};
  var mockFn_1 = function() {};

  expectCall(this.createMockFunction_)('ChildClass.queso')
    .willOnce(returnWith(mockFn_0));

  expectCall(this.createMockFunction_)('ChildClass.burrito')
    .willOnce(returnWith(mockFn_1));

  // Properties
  var result = this.createMockInstance_(ChildClass);

  expectEq(mockFn_0, result.queso);
  expectEq(mockFn_1, result.burrito);

  expectEq(17, result.taco);
  expectEq(19, result.enchilada);

  // Types
  expectTrue(result instanceof ParentClass);
  expectTrue(result instanceof ChildClass);
};
