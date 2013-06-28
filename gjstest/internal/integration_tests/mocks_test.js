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

// A test file that exercises various bits of mocking functionality.

function MocksTest() {}
registerTestSuite(MocksTest);

MocksTest.prototype.SatisfiedMocks = function() {
  var foo = createMockFunction();
  var bar = createMockFunction();

  expectCall(foo)(17, containsRegExp(/^taco/));
  expectCall(foo)(19, containsRegExp(/^burrito/));
  expectCall(bar)(evalsToTrue);

  foo(17, 'taco filling');
  foo(19, 'burrito filling');
  bar(23);
};

MocksTest.prototype.MockActions = function() {
  var foo = createMockFunction();

  expectCall(foo)(17)
    .willOnce(returnWith(11))
    .willOnce(doAll([returnWith(12)]));

  expectCall(foo)(19)
    .willOnce(returnWith(21))
    .willOnce(returnWith(22));

  expectEq(11, foo(17));
  expectEq(21, foo(19));
  expectEq(22, foo(19));
  expectEq(12, foo(17));
};

MocksTest.prototype.MockInstance = function() {
  function MyClass() {}
  MyClass.prototype.doSomething = function() {};

  var mockInstance = createMockInstance(MyClass);

  expectCall(mockInstance.doSomething)()
    .willOnce(returnWith(17));

  expectEq(17, mockInstance.doSomething());
};

MocksTest.prototype.UnexpectedFunctionCall_Simple = function() {
  var foo = createMockFunction();       // Not named
  var bar = createMockFunction('bar');  // Named

  expectCall(foo)(17);
  expectCall(foo)(23);

  foo(17);
  foo(19);
  foo(23);

  bar(29);
};

MocksTest.prototype.UnexpectedFunctionCall_RecursivelyEquals = function() {
  var foo = createMockFunction();       // Not named
  var bar = createMockFunction('bar');  // Named

  expectCall(foo)(recursivelyEquals([17, 23]));
  expectCall(bar)(recursivelyEquals([17, 23]));

  foo([17, 23]);
  foo(0);

  bar([17, 23]);
  bar(0);
};

MocksTest.prototype.UnexpectedMethodCall = function() {
  function MyClass() {}
  MyClass.prototype.doSomething = function() {};

  var mockInstance = createMockInstance(MyClass);
  mockInstance.doSomething(17);
};

MocksTest.prototype.UnsatisfiedExpectations = function() {
  var foo = createMockFunction();

  expectCall(foo)(17);

  // Implicit count of 1.
  expectCall(foo)(19);

  // Implicit count of 2.
  expectCall(foo)(23)
    .willOnce(returnWith(1))
    .willOnce(returnWith(2));

  // Explicit count of 3.
  expectCall(foo)(29)
    .times(3);

  foo(17);
  foo(23);
  foo(29);
  foo(29);
  foo(29);
  foo(29);
};

MocksTest.prototype.AnotherTest = function() {
  // Make sure that the unsatisfied expectations from above don't interfere with
  // this test, which should pass.
  expectEq(7, 7);
};

MocksTest.prototype.UnsatisfiedExpectationsWithReferences = function() {
  // Like the case above, except use references instead of numbers. This is to
  // test for something like bug 3396763, where we didn't pay proper attention
  // to a predicate that returned a string.
  var foo = createMockFunction();

  var obj_0 = {name: 'obj_0'};
  var obj_1 = {name: 'obj_1'};
  var obj_2 = {name: 'obj_2'};
  var obj_3 = {name: 'obj_3'};

  expectCall(foo)(obj_0);

  // Implicit count of 1.
  expectCall(foo)(obj_1);

  // Implicit count of 2.
  expectCall(foo)(obj_2)
    .willOnce(returnWith(1))
    .willOnce(returnWith(2));

  // Explicit count of 3.
  expectCall(foo)(obj_3)
    .times(3);

  foo(obj_0);
  foo(obj_2);
  foo(obj_3);
  foo(obj_3);
  foo(obj_3);
  foo(obj_3);
};

MocksTest.prototype.PrecedingExpectThat = function() {
  // Add a call to expectThat before an unexpected mock call and an unsatisfied
  // expectation. It should properly clean up after its recorded stack so we
  // don't get stray line numbers in the output.
  gjstest.expectThat(17, gjstest.equals(15 + 2));

  var foo = createMockFunction();
  expectCall(foo)(19);

  foo(23);
};

MocksTest.prototype.ExpectCallWithNonMockFunction = function() {
  expectCall(undefined)();
};

MocksTest.prototype.MissingArguments = function() {
  var foo = createMockFunction();

  // Exactly one argument, undefined is okay.
  expectCall(foo)(_)
    .willRepeatedly(returnWith(17));

  expectEq(17, foo('taco'));
  expectEq(17, foo(undefined));

  // Should fail:
  foo();
};

MocksTest.prototype.TooManyArguments = function() {
  var foo = createMockFunction();

  // Exactly one argument, undefined is okay.
  expectCall(foo)(_)
    .willRepeatedly(returnWith(17));

  expectEq(17, foo('taco'));
  expectEq(17, foo(undefined));

  // Should fail:
  foo(undefined, 17);
  foo(undefined, undefined);
};

MocksTest.prototype.OptionalArgument = function() {
  var foo = createMockFunction();

  // One or two args, any value for each (including undefined).
  expectCall(foo)(_, maybePresent)
    .willRepeatedly(returnWith(17));

  expectEq(17, foo('taco'));
  expectEq(17, foo(undefined));
  expectEq(17, foo(undefined, 'taco'));
  expectEq(17, foo(undefined, undefined));
};

MocksTest.prototype.OptionalOrExactValueArgument = function() {
  var foo = createMockFunction();

  // First arg must be present, second can be 23 or not present.
  expectCall(foo)(_, anyOf([notPresent, equals(23)]))
    .willRepeatedly(returnWith(17));

  expectEq(17, foo('taco'));
  expectEq(17, foo(undefined));
  expectEq(17, foo(undefined, 23));

  // Should fail:
  foo(undefined, undefined);
  foo(undefined, 24);
  foo(undefined, 'taco');
};

MocksTest.prototype.SentinelMatcher = function() {
  var foo = createMockFunction();

  // Expect a call to the function with the sentinel value (*not* a call with a
  // missing argument).
  expectCall(foo)(gjstest.isMissingArgSentinel)
    .willRepeatedly(returnWith(17));

  // Should succeed:
  expectEq(17, foo(gjstest.missingArgSentinel));

  // Should fail:
  foo();
};
