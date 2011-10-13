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

ExceptionTest.prototype.referenceError = function() {
  fooBar(2);
};

ExceptionTest.prototype.notAFunctionError = function() {
  var foo = {};
  foo();
};

ExceptionTest.prototype.errorInMatcherFactory = function() {
  gjstest.isNearNumber('asd', 17);
};

ExceptionTest.prototype.stackOverflow = function() {
  function foo() { foo(); }
  foo();
};

ExceptionTest.prototype.unknownPropertyOnLongFunction = function() {
  function foo() {
    return 'asd';
  }

  foo.bar();
};

ExceptionTest.prototype.objectLiteralException = function() {
  var e = { name: 'SomeException' };
  throw e;
};

ExceptionTest.prototype.customExceptionClassWithoutStack = function() {
  function SomeException() {}
  throw new SomeException;
};

ExceptionTest.prototype.customExceptionClassWithStack = function() {
  function SomeException() {
    Error.captureStackTrace(this, SomeException);
  }

  throw new SomeException;
};

ExceptionTest.prototype.customExceptionClassWithToString = function() {
  function SomeException() {}
  SomeException.prototype.toString = function() { return 'SomeException'; }
  throw new SomeException;
};

ExceptionTest.prototype.passingTest = function() {
};

// A test constructor that throws an error.
function ThrowingConstructorTest() {
  throw new Error('taco');
}
gjstest.registerTestSuite(ThrowingConstructorTest);

ThrowingConstructorTest.prototype.someTest = function() {
};
