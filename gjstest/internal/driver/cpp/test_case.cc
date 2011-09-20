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

#include "gjstest/internal/driver/cpp/test_case.h"

#include "base/callback.h"
#include "base/logging.h"
#include "base/stringprintf.h"
#include "base/timer.h"
#include "gjstest/internal/driver/cpp/v8_utils.h"

using v8::Arguments;
using v8::Context;
using v8::Function;
using v8::Handle;
using v8::Local;
using v8::Object;
using v8::TryCatch;
using v8::Value;

namespace gjstest {

// Get a reference to the function of the supplied name.
static Local<Function> GetFunctionNamed(const string& name) {
  const Local<Value> result = ExecuteJs(name, "");
  CHECK(result->IsFunction()) << "Error getting reference to " << name;
  return Local<Function>::Cast(result);
}

// Log the supplied string to the test's output.
static Handle<Value> LogString(TestCase* test_case, const Arguments& args) {
  CHECK_EQ(1, args.Length());
  const string& message = ConvertToString(args[0]);
  StringAppendF(&test_case->output, "%s\n", message.c_str());

  return v8::Undefined();
}

// Record the test as having failed, and extract a failure message from the JS
// arguments and append it to the existing messages, if any.
static Handle<Value> RecordFailure(TestCase* test_case, const Arguments& args) {
  CHECK_EQ(1, args.Length());
  const string& message = ConvertToString(args[0]);

  test_case->succeeded = false;
  StringAppendF(&test_case->output, "%s\n\n", message.c_str());
  StringAppendF(&test_case->failure_output, "%s\n\n", message.c_str());

  return v8::Undefined();
}

TestCase::TestCase(
    const Handle<Function>& test_function)
    : succeeded(false),
      duration_ms(kuint32max),
      test_function_(test_function) {
  CHECK(test_function_->IsFunction());
}

void TestCase::Run() {
  CycleTimer timer;

  // Assume we succeeded by default.
  succeeded = true;

  // Grab references to runTest and the TestEnvironment constructor.
  const Local<Function> run_test = GetFunctionNamed("gjstest.internal.runTest");
  const Local<Function> test_env_constructor =
      GetFunctionNamed("gjstest.internal.TestEnvironment");

  // Create log and reportFailure functions.
  const Local<Function> log =
      MakeFunction("log", NewPermanentCallback(&LogString, this));

  const Local<Function> report_failure =
      MakeFunction(
          "reportFailure",
          NewPermanentCallback(&RecordFailure, this));

  // Create a test environment.
  Handle<Value> test_env_args[] = { log, report_failure };
  const Local<Object> test_env =
      test_env_constructor->NewInstance(
          arraysize(test_env_args),
          test_env_args);
  CHECK(!test_env.IsEmpty());

  // Run the test.
  TryCatch try_catch;
  Handle<Value> args[] = { test_function_, test_env };
  const Local<Value> result =
      run_test->Call(Context::GetCurrent()->Global(), arraysize(args), args);

  // Was there an exception while running the test?
  if (result.IsEmpty()) {
    succeeded = false;

    const string description = DescribeError(try_catch);
    StringAppendF(&output, "%s\n", description.c_str());
    StringAppendF(&failure_output, "%s\n", description.c_str());
  }

  // Record the test time.
  duration_ms = timer.GetInMs();
}

}  // namespace gjstest
