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

////////////////////////////////////////////////////////////////////////
// getCurrentStack
////////////////////////////////////////////////////////////////////////

function GetCurrentStackTest() {}
registerTestSuite(GetCurrentStackTest);

GetCurrentStackTest.prototype.GoldenTest = function() {
  // Get the stack for this test and the test runner itself.
  function fooBar() {
    return getCurrentStack();
  };

  var frame;
  var frames = fooBar();
  expectThat(frames, elementsAre([_, _, _, _]));

  frame = frames[0];
  expectEq('stack_utils_test.js', frame.fileName);
  expectEq(28, frame.lineNumber);

  frame = frames[1];
  expectEq('stack_utils_test.js', frame.fileName);
  expectEq(32, frame.lineNumber);

  frame = frames[2];
  expectThat(frame.fileName, containsRegExp(/register\.js/));
  expectNe(null, frame.lineNumber);

  frame = frames[3];
  expectThat(frame.fileName, containsRegExp(/run_test\.js/));
  expectNe(null, frame.lineNumber);
};

GetCurrentStackTest.prototype.constructorFrame = function() {
  var frames = null;
  function MyConstructor() { frames = getCurrentStack(); }
  var dummy = new MyConstructor();

  var frame = frames[0];
  expectEq('stack_utils_test.js', frame.fileName);
};

GetCurrentStackTest.prototype.AnonymousFunctions = function() {
  var frames = (function() { return getCurrentStack(); })();

  var frame = frames[0];
  expectEq('stack_utils_test.js', frame.fileName);
};

GetCurrentStackTest.prototype.AnonymousClass = function() {
  // Create a constructor with an un-named function.
  var someConstructor = function() { }
  someConstructor.prototype.foo = function() { return getCurrentStack(); };
  var frames = (new someConstructor).foo();

  var frame = frames[0];
  expectEq('stack_utils_test.js', frame.fileName);
};

////////////////////////////////////////////////////////////////////////
// getErrorStack
////////////////////////////////////////////////////////////////////////

function GetErrorStackTest() {}
registerTestSuite(GetErrorStackTest);

// TODO(jacobsa): It seems something has changed in V8 that makes the code below
// not generate a call site that returns true for isNative(). If another such
// situation comes up, re-enable this test.
//
// GetErrorStackTest.prototype.NativeCode = function() {
//   var frames = null;
//   try {
//     ({})();
//   } catch (e) {
//     frames = gjstest.internal.getErrorStack(e);
//   }
//
//   var frame;
//
//   frame = frames[0];
//   expectEq(null, frame.fileName);
//   expectEq(null, frame.lineNumber);
//
//   frame = frames[1];
//   expectEq('stack_utils_test.js', frame.fileName);
// };

GetErrorStackTest.prototype.StackOverflow = function() {
  var frames = null;
  try {
    function foo() { foo(); }
    foo.call(this);
  } catch (e) {
    frames = gjstest.internal.getErrorStack(e);
  }

  // Older versions of v8 give an empty list of stack frames. Newer versions
  // seem to repeat the stack frame up to a certain count.
  expectThat(frames.length, anyOf([0, greaterOrEqual(8)]));
  for (var i = 0; i < frames.length; ++i) {
    var frame = frames[i];
    expectEq('stack_utils_test.js', frame.fileName);
  }
};

GetErrorStackTest.prototype.UnknownPropertyOnSingleLineFunction = function() {
  function foo() {}
  try {
    foo.load(17);
  } catch (e) {
    frames = gjstest.internal.getErrorStack(e);
  }

  var frame;

  frame = frames[0];
  expectEq('stack_utils_test.js', frame.fileName);
};

GetErrorStackTest.prototype.UnknownPropertyOnMultiLineFunction = function() {
  function foo() {
    // ASDF
    return 'bar';
  }

  try {
    foo.bar();
  } catch (e) {
    frames = gjstest.internal.getErrorStack(e);
  }

  var frame;

  frame = frames[0];
  expectEq('stack_utils_test.js', frame.fileName);
};

////////////////////////////////////////////////////////////////////////
// describeStack
////////////////////////////////////////////////////////////////////////

function DescribeStackTest() {
  this.stack_ = [];
};
registerTestSuite(DescribeStackTest);

DescribeStackTest.prototype.emptyArray = function() {
  var result = gjstest.internal.describeStack(this.stack_);
  expectEq('    (Empty)', result);
};

DescribeStackTest.prototype.oneFrame = function() {
  this.stack_.push({fileName: 'taco.js', lineNumber: 17});

  var result = gjstest.internal.describeStack(this.stack_);
  expectEq('    taco.js:17', result);
};

DescribeStackTest.prototype.twoFrames = function() {
  this.stack_.push({fileName: 'taco.js', lineNumber: 17});
  this.stack_.push({fileName: 'burrito.js', lineNumber: 19});

  var result = gjstest.internal.describeStack(this.stack_);
  expectEq('    taco.js:17\n    burrito.js:19', result);
};

DescribeStackTest.prototype.missingFileName = function() {
  this.stack_.push({lineNumber: 17});

  var result = gjstest.internal.describeStack(this.stack_);
  expectEq('    (unknown):17', result);
};

DescribeStackTest.prototype.missingLineNumber = function() {
  this.stack_.push({fileName: 'taco.js'});

  var result = gjstest.internal.describeStack(this.stack_);
  expectEq('    taco.js:(unknown)', result);
};
