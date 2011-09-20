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

var getCurrentStack = gjstest.internal.getCurrentStack;

//////////////////////
// getCurrentStack
//////////////////////

function GetCurrentStackTest() {}
registerTestSuite(GetCurrentStackTest);

GetCurrentStackTest.prototype.goldenTest = function() {
  // Get the stack for this test and the test runner itself.
  function fooBar() {
    return getCurrentStack();
  };

  var frame;
  var frames = fooBar();
  expectThat(frames, elementsAre([_, _, _, _]));

  frame = frames[0];
  expectEq('fooBar', frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
  expectEq(28, frame.lineNumber);

  frame = frames[1];
  expectEq('GetCurrentStackTest.goldenTest', frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
  expectEq(32, frame.lineNumber);

  frame = frames[2];
  expectEq(null, frame.functionName);
  expectEq('register.js', frame.fileName);
  expectNe(null, frame.lineNumber);

  frame = frames[3];
  expectEq('runTest', frame.functionName);
  expectEq('run_test.js', frame.fileName);
  expectNe(null, frame.lineNumber);
};

GetCurrentStackTest.prototype.constructorFrame = function() {
  var frames = null;
  function MyConstructor() { frames = getCurrentStack(); }
  var dummy = new MyConstructor();

  var frame = frames[0];
  expectEq('MyConstructor', frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
};

GetCurrentStackTest.prototype.anonymousFunctions = function() {
  var frames = (function() { return getCurrentStack(); })();

  var frame = frames[0];
  expectEq(null, frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
};

GetCurrentStackTest.prototype.renamedFunction = function() {
  // Assign a function named foo to a property named bar.
  var obj = { bar: function foo() { return getCurrentStack(); } };
  var frames = obj.bar();

  var frame = frames[0];
  expectEq('bar', frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
};

GetCurrentStackTest.prototype.anonymousClass = function() {
  // Create a constructor with an un-named function.
  var someConstructor = function() { }
  someConstructor.prototype.foo = function() { return getCurrentStack(); };
  var frames = (new someConstructor).foo();

  var frame = frames[0];
  expectEq('[object Object].foo', frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
};

//////////////////////
// getErrorStack
//////////////////////

function GetErrorStackTest() {}
registerTestSuite(GetErrorStackTest);

GetErrorStackTest.prototype.nativeCode = function() {
  var frames = null;
  try {
    ({})();
  } catch (e) {
    frames = gjstest.internal.getErrorStack(e);
  }

  var frame;

  frame = frames[0];
  expectEq('Object.CALL_NON_FUNCTION', frame.functionName);
  expectEq(null, frame.fileName);
  expectEq(null, frame.lineNumber);

  frame = frames[1];
  expectEq('GetErrorStackTest.nativeCode', frame.functionName);
  expectEq('stack_utils_test.js', frame.fileName);
};

GetErrorStackTest.prototype.stackOverflow = function() {
  var frames = null;
  try {
    function foo() { foo(); }
    foo.call(this);
  } catch (e) {
    frames = gjstest.internal.getErrorStack(e);
  }

  expectThat(frames, elementsAre([]));
};
