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

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <v8.h>

#include "gjstest/internal/cpp/v8_utils.h"

#include "base/callback.h"
#include "base/integral_types.h"
#include "base/logging.h"
#include "base/macros.h"

using testing::ContainsRegex;
using testing::ElementsAre;
using testing::HasSubstr;

using v8::Arguments;
using v8::Context;
using v8::Function;
using v8::Handle;
using v8::HandleScope;
using v8::Integer;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::ObjectTemplate;
using v8::Persistent;
using v8::String;
using v8::TryCatch;
using v8::Value;

namespace gjstest {

// A test case that automatically creates and enters a context before the test
// body. Subclasses should set any properties they want globally exposed through
// the context on the the object template before calling V8UtilsTest::SetUp.
class V8UtilsTest : public ::testing::Test {
 protected:
  V8UtilsTest()
      : handle_scope_(CHECK_NOTNULL(Isolate::GetCurrent())),
        global_template_(ObjectTemplate::New()),
        context_(
            Context::New(
                CHECK_NOTNULL(Isolate::GetCurrent()),
                NULL,  // No extensions
                global_template_)),
        context_scope_(context_) {
  }

  const HandleScope handle_scope_;
  const Handle<ObjectTemplate> global_template_;
  const Handle<Context> context_;
  const Context::Scope context_scope_;
};

////////////////////////////////////////////////////////////////////////
// ConvertToString
////////////////////////////////////////////////////////////////////////

typedef V8UtilsTest ConvertToStringTest;

TEST_F(ConvertToStringTest, Empty) {
  HandleScope handle_owner;
  EXPECT_EQ("", ConvertToString(Local<Value>()));
}

TEST_F(ConvertToStringTest, Strings) {
  HandleScope handle_owner;

  EXPECT_EQ("", ConvertToString(String::New("")));
  EXPECT_EQ("taco", ConvertToString(String::New("taco")));

  const uint16 kUtf16Chars[] = { 0xd0c0, 0xcf54 };
  EXPECT_EQ("타코",
            ConvertToString(String::New(kUtf16Chars, 2)));
}

TEST_F(ConvertToStringTest, Numbers) {
  HandleScope handle_owner;

  EXPECT_EQ("-3", ConvertToString(Number::New(-3)));
  EXPECT_EQ("4", ConvertToString(Number::New(4)));
  EXPECT_EQ("3.14", ConvertToString(Number::New(3.14)));
}

////////////////////////////////////////////////////////////////////////
// ExecuteJs
////////////////////////////////////////////////////////////////////////

typedef V8UtilsTest ExecuteJsTest;

static std::string GetResultAsString(
    const std::string& js,
    std::string filename = "") {
  return ConvertToString(ExecuteJs(js, filename));
}

TEST_F(ConvertToStringTest, EmptyString) {
  HandleScope handle_owner;
  EXPECT_EQ("undefined", GetResultAsString(""));
}

TEST_F(ConvertToStringTest, BadSyntax) {
  HandleScope handle_owner;

  const Local<Value> result = ExecuteJs("(2", "");
  EXPECT_TRUE(result.IsEmpty());
}

TEST_F(ConvertToStringTest, SingleValue) {
  HandleScope handle_owner;
  EXPECT_EQ("2", GetResultAsString("2"));
  EXPECT_EQ("foo", GetResultAsString("'foo'"));
}

TEST_F(ConvertToStringTest, FunctionReturnValue) {
  HandleScope handle_owner;

  const std::string js =
      "var addTwo = function(a, b) { return a + b; };\n"
      "addTwo(2, 3)";

  EXPECT_EQ("5", GetResultAsString(js));
}

TEST_F(ConvertToStringTest, StackWithFilename) {
  HandleScope handle_owner;

  const std::string js =
      "2+2\n"
      "new Error().stack";

  EXPECT_THAT(GetResultAsString(js, "taco.js"), HasSubstr("at taco.js:2"));
}

TEST_F(ConvertToStringTest, StackWithoutFilename) {
  HandleScope handle_owner;

  const std::string js =
      "2+2\n"
      "new Error().stack";

  EXPECT_THAT(GetResultAsString(js), ContainsRegex("at (unknown|<anonymous>)"));
}

////////////////////////////////////////////////////////////////////////
// DescribeError
////////////////////////////////////////////////////////////////////////

typedef V8UtilsTest DescribeErrorTest;

TEST_F(DescribeErrorTest, NoError) {
  HandleScope handle_owner;

  TryCatch try_catch;
  EXPECT_EQ("", DescribeError(try_catch));
}

TEST_F(DescribeErrorTest, NoMessage) {
  HandleScope handle_owner;

  const std::string js = "throw new Error();";

  TryCatch try_catch;
  ASSERT_TRUE(ExecuteJs(js, "taco.js").IsEmpty());

  EXPECT_EQ("taco.js:1: Error", DescribeError(try_catch));
}

TEST_F(DescribeErrorTest, WithMessage) {
  HandleScope handle_owner;

  const std::string js = "throw new Error('foo');";

  TryCatch try_catch;
  ASSERT_TRUE(ExecuteJs(js, "taco.js").IsEmpty());

  EXPECT_EQ("taco.js:1: Error: foo", DescribeError(try_catch));
}

TEST_F(DescribeErrorTest, NoLineNumber) {
  HandleScope handle_owner;

  // Missing end curly brace.
  const std::string js = "var foo = {\n  'taco': 1\n";

  TryCatch try_catch;
  ASSERT_TRUE(ExecuteJs(js, "taco.js").IsEmpty());

  EXPECT_EQ("taco.js: SyntaxError: Unexpected end of input",
            DescribeError(try_catch));
}

////////////////////////////////////////////////////////////////////////
// ConvertToStringVector
////////////////////////////////////////////////////////////////////////

typedef V8UtilsTest ConvertToStringVectorTest;

static std::vector<std::string> ConvertToStringVector(
    const std::string& js) {
  std::vector<std::string> result;
  ConvertToStringVector(ExecuteJs(js, ""), &result);
  return result;
}

TEST_F(ConvertToStringVectorTest, EmptyValue) {
  HandleScope handle_owner;
  std::vector<std::string> result;

  EXPECT_DEATH(ConvertToStringVector(Local<Value>(), &result), "non-empty");
}

TEST_F(ConvertToStringVectorTest, NonArray) {
  HandleScope handle_owner;
  EXPECT_DEATH(ConvertToStringVector("'foo'"), "must be an array");
}

TEST_F(ConvertToStringVectorTest, EmptyArray) {
  HandleScope handle_owner;
  EXPECT_THAT(ConvertToStringVector("[]"), ElementsAre());
}

TEST_F(ConvertToStringVectorTest, NonEmptyArray) {
  HandleScope handle_owner;
  EXPECT_THAT(ConvertToStringVector("['', 'foo', 2]"),
              ElementsAre("", "foo", "2"));
}

////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////

static Handle<Value> AddToCounter(
    uint32* counter,
    const Arguments& args) {
  CHECK_EQ(1, args.Length());
  *counter += args[0]->ToUint32()->Value();
  return v8::Undefined();
}

// An implementation of V8FunctionCallback that sets a bool when it is
// destructed.
class WatchForDeletionCallback : public V8FunctionCallback {
 public:
  explicit WatchForDeletionCallback(bool* deleted) : deleted_(deleted) {}
  ~WatchForDeletionCallback() { *deleted_ = true; }
  virtual bool IsRepeatable() const { return true; }
  virtual Handle<Value> Run(const Arguments& args) { return v8::Undefined(); }

  bool* deleted_;
};

////////////////////////////////////////////////////////////////////////
// RegisterFunction
////////////////////////////////////////////////////////////////////////

TEST(RegisterFunctionTest, CallsAppropriateCallback) {
  HandleScope handle_owner;

  uint32 counter_1 = 0;
  uint32 counter_2 = 0;

  // Create a template that exports two functions to add to the two counters.
  Handle<ObjectTemplate> global_template = ObjectTemplate::New();

  RegisterFunction(
      "addToCounter1",
      NewPermanentCallback(&AddToCounter, &counter_1),
      &global_template);

  RegisterFunction(
      "addToCounter2",
      NewPermanentCallback(&AddToCounter, &counter_2),
      &global_template);

  // Create a context in which to run scripts and ensure that it's used whenever
  // a context is needed below. Export the global functions configured above.
  const Handle<Context> context(
      Context::New(
          CHECK_NOTNULL(Isolate::GetCurrent()),
          NULL,  // No extensions
          global_template));

  const Context::Scope context_scope(context);

  // Add different amounts to the two counters.
  const std::string js = "addToCounter1(3); addToCounter2(7)";
  ExecuteJs(js, "");

  EXPECT_EQ(3, counter_1);
  EXPECT_EQ(7, counter_2);
}

TEST(RegisterFunctionTest, GarbageCollectsCallbacks) {
  // Create a handle scope and a template within that scope, and register a
  // couple of callbacks allocated on the heap. Have the callbacks keep track of
  // whether they were deleted.
  bool callback_1_deleted = false;
  bool callback_2_deleted = false;

  {
    HandleScope handle_owner;
    Handle<ObjectTemplate> tmpl = ObjectTemplate::New();

    RegisterFunction(
        "taco",
        new WatchForDeletionCallback(&callback_1_deleted),
        &tmpl);

    RegisterFunction(
        "burrito",
        new WatchForDeletionCallback(&callback_2_deleted),
        &tmpl);
  }  // No more references to tmpl

  // Force a garbage collection run. See the comments in v8.h and this thread
  // (which has a bug in its advice):
  //
  //     http://www.mail-archive.com/v8-users@googlegroups.com/msg01789.html
  //
  while (!v8::V8::IdleNotification());

  // The two callbacks should have been deleted when the template was garbage
  // collected.
  EXPECT_TRUE(callback_1_deleted);
  EXPECT_TRUE(callback_2_deleted);
}

////////////////////////////////////////////////////////////////////////
// MakeFunction
////////////////////////////////////////////////////////////////////////

class MakeFunctionTest : public V8UtilsTest {
 protected:
  MakeFunctionTest()
      : counter_(0) {
  }

  void SetUpFunction() {
    func_ =
        MakeFunction("taco", NewPermanentCallback(&AddToCounter, &counter_));
  }

  uint32 counter_;
  Local<Function> func_;
};

TEST_F(MakeFunctionTest, Name) {
  HandleScope handle_owner;
  SetUpFunction();
  ASSERT_FALSE(func_.IsEmpty());

  EXPECT_EQ("taco", ConvertToString(func_->GetName()));
}

TEST_F(MakeFunctionTest, CallsCallback) {
  HandleScope handle_owner;
  SetUpFunction();
  ASSERT_FALSE(func_.IsEmpty());

  Handle<Value> one_args[] = { Integer::New(1) };
  Handle<Value> seventeen_args[] = { Integer::New(17) };

  func_->Call(Context::GetCurrent()->Global(), 1, one_args);
  func_->Call(Context::GetCurrent()->Global(), 1, seventeen_args);

  EXPECT_EQ(18, counter_);
}

TEST_F(MakeFunctionTest, GarbageCollectsCallback) {
  // Create a handle scope and make a function using a callback allocated on the
  // heap. Have the callback keep track of when it's deleted.
  bool callback_deleted = false;

  {
    const HandleScope handle_owner;
    const Handle<Context> context(
        Context::New(
            CHECK_NOTNULL(Isolate::GetCurrent())));

    const Context::Scope context_scope(context);

    const Local<Function> function =
        MakeFunction("taco", new WatchForDeletionCallback(&callback_deleted));
  }  // No more references to function

  // Force a garbage collection run. See the comments in v8.h and this thread
  // (which has a bug in its advice):
  //
  //     http://www.mail-archive.com/v8-users@googlegroups.com/msg01789.html
  //
  while (!v8::V8::IdleNotification());

  // On Linux, it seems we also need to send a low-memory notification to make
  // sure the garbage collection run happens.
  v8::V8::LowMemoryNotification();

  // The callback should have been deleted when the function was garbage
  // collected.
  EXPECT_TRUE(callback_deleted);
}

}  // namespace gjstest
