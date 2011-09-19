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

function TestEnvironmentTest() {
  this.log_ = createMockFunction();
  this.reportFailure_ = createMockFunction();

  this.testEnv_ =
      new gjstest.internal.TestEnvironment(this.log_, this.reportFailure_);
}
registerTestSuite(TestEnvironmentTest);

TestEnvironmentTest.prototype.log = function() {
  expectCall(this.log_)('taco');
  this.testEnv_.log('taco');
};

TestEnvironmentTest.prototype.reportFailureWithoutUserStack = function() {
  expectCall(this.reportFailure_)('taco');
  this.testEnv_.reportFailure('taco');
};

TestEnvironmentTest.prototype.reportFailureWithUserStack = function() {
  var frame = {fileName: 'taco.js', lineNumber: 17};
  this.testEnv_.userStack.push(frame);

  expectCall(this.reportFailure_)('taco.js:17\nburrito');
  this.testEnv_.reportFailure('burrito');
};

TestEnvironmentTest.prototype.recordAndClearUserStack = function() {
  // Get the current stack and make sure it has at least three frames.
  var goldenStack = gjstest.internal.getCurrentStack();
  expectGe(goldenStack.length, 3);

  // Record the current user stack, skipping the top frame. The result should be
  // equal to the remaining frames of the stack recorded above.
  this.testEnv_.recordUserStack(1);
  var recordedStack = this.testEnv_.userStack;

  expectEq(goldenStack.length - 1, recordedStack.length);
  for (var i = 0; i < recordedStack.length; ++i) {
    expectThat(recordedStack[i], recursivelyEquals(goldenStack[i + 1]));
  }

  // Now clear the recorded stack.
  this.testEnv_.clearUserStack();
  expectThat(this.testEnv_.userStack, elementsAre([]));
};

TestEnvironmentTest.prototype.userStacksAreNotShared = function() {
  var otherEnv =
      new gjstest.internal.TestEnvironment(this.log_, this.reportFailure_);

  expectNe(this.testEnv_.userStack, otherEnv.userStack);
};
