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

////////////////////////////
// Helpers
////////////////////////////

function getKeys(obj) {
  var result = [];
  for (var name in obj) {
    result.push(name);
  }
  return result;
}

////////////////////////////
// registerTestSuite
////////////////////////////

function RegisterTestSuiteTest() {
  // Make a copy of the real object; we will replace it later. Then clear it for
  // the duration of this test.
  this.originalTestConstructors_ = gjstest.internal.testSuites;
  gjstest.internal.testSuites = [];
}
registerTestSuite(RegisterTestSuiteTest);

RegisterTestSuiteTest.prototype.tearDown = function() {
  gjstest.internal.testSuites = this.originalTestConstructors_;
};

RegisterTestSuiteTest.prototype.notAFunction = function() {
  expectThat(function() {
    registerTestSuite({});
  }, throwsError(/TypeError.*registerTestSuite.*function/));
};

RegisterTestSuiteTest.prototype.storesConstructors = function() {
  function TestSuite1() {}
  function TestSuite2() {}

  registerTestSuite(TestSuite1);
  registerTestSuite(TestSuite2);

  expectThat(gjstest.internal.testSuites,
             elementsAre([TestSuite1, TestSuite2]));
};

RegisterTestSuiteTest.prototype.alreadyRegistered = function() {
  function TestSuite() {}

  expectThat(function() {
    registerTestSuite(TestSuite);
    registerTestSuite(TestSuite);
  }, throwsError(/already registered.*TestSuite/));
};

////////////////////////////
// getTestFunctions
////////////////////////////

function GetTestFunctionsTest() {}
registerTestSuite(GetTestFunctionsTest);

GetTestFunctionsTest.prototype.testNames = function() {
  function TestSuite() {}
  TestSuite.prototype.someName = function() {};
  TestSuite.prototype.someOtherName = function() {};

  var result = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(getKeys(result),
             elementsAre([
               'TestSuite.someName',
               'TestSuite.someOtherName'
             ]));
};

GetTestFunctionsTest.prototype.ignoresTrailingUnderscores = function() {
  function TestSuite() {}
  TestSuite.prototype.harmless_underscores = function() {};
  TestSuite.prototype.ignoredName_ = function() {};

  var result = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(getKeys(result), elementsAre(['TestSuite.harmless_underscores']));
};

GetTestFunctionsTest.prototype.ignoresTearDown = function() {
  function TestSuite() {}
  TestSuite.prototype.someName = function() {};
  TestSuite.prototype.tearDown = function() {};

  var result = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(getKeys(result), elementsAre(['TestSuite.someName']));
};

GetTestFunctionsTest.prototype.ignoresInheritedFunctions = function() {
  function ParentSuite() {}
  ParentSuite.prototype.overridden = function() {};
  ParentSuite.prototype.nonOverridden = function() {};

  function TestSuite() {}
  TestSuite.prototype = new ParentSuite;
  TestSuite.prototype.overridden = function() {};

  var result = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(getKeys(result), elementsAre(['TestSuite.overridden']));
};

GetTestFunctionsTest.prototype.ignoresNonFunctions = function() {
  function TestSuite() {}
  TestSuite.prototype.someName = function() {};
  TestSuite.prototype.ignoredName = {};
  TestSuite.prototype.constructor = {};

  var result = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(getKeys(result), elementsAre(['TestSuite.someName']));
};

GetTestFunctionsTest.prototype.testConstructorName = function() {
  function TestSuite() {}
  TestSuite.prototype.constructor = function() {};

  var result = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(getKeys(result), elementsAre(['TestSuite.constructor']));
};

GetTestFunctionsTest.prototype.execution = function() {
  // Create two test functions that record 'this'.
  var testAThis = null;
  var testBThis = null;

  function TestSuite() {}
  TestSuite.prototype.someName = function() { testAThis = this; };
  TestSuite.prototype.someOtherName = function() { testBThis = this; };

  // Get test functions and run them in order.
  var testFunctions = gjstest.internal.getTestFunctions(TestSuite);

  testFunctions['TestSuite.someName']();
  testFunctions['TestSuite.someOtherName']();

  // Each 'this' value should have been a different instance of TestSuite.
  expectNe(testAThis, testBThis);
  expectTrue(testAThis instanceof TestSuite);
  expectTrue(testBThis instanceof TestSuite);
};

GetTestFunctionsTest.prototype.executionWithTearDown = function() {
  // A test suite whose tearDown method records the 'this' values it sees.
  var tearDownThisValues = [];

  function TestSuite() {}
  TestSuite.prototype.tearDown = function() { tearDownThisValues.push(this); };

  // Two test functions.
  TestSuite.prototype.someName = function() {};
  TestSuite.prototype.someOtherName = function() {};

  // Run the tests.
  var testFunctions = gjstest.internal.getTestFunctions(TestSuite);
  var foo = testFunctions['TestSuite.someName'];
  testFunctions['TestSuite.someName']();
  testFunctions['TestSuite.someOtherName']();

  // Each 'this' value should have been a different instance of TestSuite.
  expectEq(2, tearDownThisValues.length);
  expectNe(tearDownThisValues[0], tearDownThisValues[1]);
  expectTrue(tearDownThisValues[0] instanceof TestSuite);
  expectTrue(tearDownThisValues[1] instanceof TestSuite);
};

GetTestFunctionsTest.prototype.errorWithoutTearDown = function() {
  // Register a test that throws an error.
  function TestSuite() {}
  TestSuite.prototype.someName = function() { throw new Error('taco'); };

  var testFunctions = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(testFunctions['TestSuite.someName'],
             throwsError(/Error: taco/));
};

GetTestFunctionsTest.prototype.errorWithTearDown = function() {
  // A suite with a tearDown method.
  var tearDownThis = null;
  function TestSuite() {}
  TestSuite.prototype.tearDown = function() { tearDownThis = this; };

  // Register a test that throws an error.
  TestSuite.prototype.someName = function() { throw new Error('taco'); };

  // Run the test. The error should make its way through, but tearDown should
  // still be run.
  var testFunctions = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(testFunctions['TestSuite.someName'],
             throwsError(/Error: taco/));
  expectTrue(tearDownThis instanceof TestSuite);
};

GetTestFunctionsTest.prototype.errorInConstructor = function() {
  // Register a test whose constructor throws an error.
  function TestSuite() { throw new Error('taco'); }
  TestSuite.prototype.someName = function() {};

  // Run the test. The error should make its way through.
  var testFunctions = gjstest.internal.getTestFunctions(TestSuite);
  expectThat(testFunctions['TestSuite.someName'],
             throwsError(/Error: taco/));
};
