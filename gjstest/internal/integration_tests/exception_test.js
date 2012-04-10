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

// A test file that intentionally raises an exception during a test function,
// for use by integration_test.cc.

function ExceptionTest() {}
gjstest.registerTestSuite(ExceptionTest);

ExceptionTest.prototype.ReferenceError = function() {
  fooBar(2);
};

ExceptionTest.prototype.NotAFunctionError = function() {
  var foo = {};
  foo();
};

ExceptionTest.prototype.ErrorInMatcherFactory = function() {
  gjstest.isNearNumber('asd', 17);
};

ExceptionTest.prototype.StackOverflow = function() {
  function foo() { foo(); }
  foo();
};

ExceptionTest.prototype.UnknownPropertyOnLongFunction = function() {
  function foo() {
    return 'asd';
  }

  foo.bar();
};

ExceptionTest.prototype.ObjectLiteralException = function() {
  var e = { name: 'SomeException' };
  throw e;
};

ExceptionTest.prototype.CustomExceptionClassWithoutStack = function() {
  function SomeException() {}
  throw new SomeException;
};

ExceptionTest.prototype.CustomExceptionClassWithStack = function() {
  function SomeException() {
    Error.captureStackTrace(this, SomeException);
  }

  throw new SomeException;
};

ExceptionTest.prototype.CustomExceptionClassWithToString = function() {
  function SomeException() {}
  SomeException.prototype.toString = function() { return 'SomeException'; }
  throw new SomeException;
};

ExceptionTest.prototype.PassingTest = function() {
};

ExceptionTest.prototype.ExceptionWithUnsatisfiedMockExpectations = function() {
  var foo = createMockFunction();
  expectCall(foo)(17);
  expectCall(foo)(19);

  // Call a non-function.
  var bar = {};
  bar();
};

// A test constructor that throws an error.
function ThrowingConstructorTest() {
  throw new Error('taco');
}
gjstest.registerTestSuite(ThrowingConstructorTest);

ThrowingConstructorTest.prototype.SomeTest = function() {
};
