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

// A class that encapsulates the behavior needed to run a single test case.

#ifndef GJSTEST_INTERNAL_CPP_TEST_CASE_H_
#define GJSTEST_INTERNAL_CPP_TEST_CASE_H_

#include <string>

#include <v8.h>

#include "base/integral_types.h"
#include "base/macros.h"
#include "base/stl_decl.h"

namespace gjstest {

class TestCase {
 public:
  // Create a test case that wraps the supplied test function, as created by
  // gjstest.registerTestCase.
  TestCase(
      v8::Isolate* isolate,
      const v8::Local<v8::Function>& test_function);

  // Run the test case and fill in the properties below. It is assumed that a
  // context is currently active in which all of the test's dependencies have
  // been evaluated.
  //
  // Behavior is undefined if this method is called twice on the same object.
  void Run();

  // Did the test succeed or fail?
  bool succeeded = false;

  // All output from the test.
  string output;

  // Failure-only output from the test.
  string failure_output;

  // The duration of the test run, in milliseconds.
  uint32 duration_ms = kuint32max;

 private:
  v8::Isolate* const isolate_;
  const v8::Local<v8::Function> test_function_;

  ///////////////////////////////////
  // Helpers
  ///////////////////////////////////

  v8::Local<v8::Function> GetFunctionNamed(
      const string& name) const;

  v8::Local<v8::Value> LogString(
      const v8::FunctionCallbackInfo<v8::Value>& cb_info);

  v8::Local<v8::Value> RecordFailure(
      const v8::FunctionCallbackInfo<v8::Value>& cb_info);

  DISALLOW_COPY_AND_ASSIGN(TestCase);
};

}  // namespace gjstest

#endif  // GJSTEST_INTERNAL_CPP_TEST_CASE_H_
