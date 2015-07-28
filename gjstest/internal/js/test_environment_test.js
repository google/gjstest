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
  this.getCurrentStack_ = createMockFunction();

  this.testEnv_ =
      new gjstest.internal.TestEnvironment(
          this.log_,
          this.reportFailure_,
          this.getCurrentStack_);
}
registerTestSuite(TestEnvironmentTest);

TestEnvironmentTest.prototype.MissingFunctions = function() {
  var TE = gjstest.internal.TestEnvironment;
  var me = this;

  expectThat(
      function() { new TE(null, me.reportFailure_, me.getCurrentStack_) },
      throwsError(/TypeError.*log.*function/));

  expectThat(
      function() { new TE(me.log_, null, me.getCurrentStack_) },
      throwsError(/TypeError.*reportFailure.*function/));

  expectThat(
      function() { new TE(me.log_, me.reportFailure_, null) },
      throwsError(/TypeError.*getCurrentStack.*function/));
};

TestEnvironmentTest.prototype.Log = function() {
  expectCall(this.log_)('taco');
  this.testEnv_.log('taco');
};

TestEnvironmentTest.prototype.ReportFailureWithoutUserStack = function() {
  expectCall(this.reportFailure_)('taco');
  this.testEnv_.reportFailure('taco');
};

TestEnvironmentTest.prototype.ReportFailureWithUserStack = function() {
  this.testEnv_.userStack.push({fileName: 'taco.js', lineNumber: 17});
  this.testEnv_.userStack.push({fileName: 'taco.js', lineNumber: 27});
  // Shouldn't print out the last 2 frames, as they're always the same
  // and internal to gjstest.
  this.testEnv_.userStack.push({fileName: 'register.js', lineNumber: 173});
  this.testEnv_.userStack.push({fileName: 'run_test.js', lineNumber: 37});

  expectCall(this.reportFailure_)('burrito\n' +
      '        at taco.js:17\n' +
      '        at taco.js:27');
  this.testEnv_.reportFailure('burrito');
};

TestEnvironmentTest.prototype.RecordAndClearUserStack = function() {
  // Return four stack frames.
  var frame0 = new gjstest.internal.StackFrame;
  var frame1 = new gjstest.internal.StackFrame;
  var frame2 = new gjstest.internal.StackFrame;
  var frame3 = new gjstest.internal.StackFrame;

  expectCall(this.getCurrentStack_)()
      .willOnce(returnWith([frame0, frame1, frame2, frame3]));

  // Ask the test environment to record the stack, skipping the first frame. It
  // should skip the top two frames (skipping recordUserStack itself).
  this.testEnv_.recordUserStack(1);
  expectThat(this.testEnv_.userStack, elementsAre([frame2, frame3]));

  // Now clear the recorded stack.
  this.testEnv_.clearUserStack();
  expectThat(this.testEnv_.userStack, elementsAre([]));
};

TestEnvironmentTest.prototype.UserStacksAreNotShared = function() {
  var otherEnv =
      new gjstest.internal.TestEnvironment(
          this.log_,
          this.reportFailure_,
          this.getCurrentStack_);

  expectNe(this.testEnv_.userStack, otherEnv.userStack);
};
