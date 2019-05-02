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

#include "base/integral_types.h"
#include "base/logging.h"
#include "base/macros.h"

using testing::ContainsRegex;
using testing::ElementsAre;
using testing::HasSubstr;

using v8::Context;
using v8::Function;
using v8::HandleScope;
using v8::Integer;
using v8::Isolate;
using v8::Local;
using v8::MaybeLocal;
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
  void ConvertToStringVector(
      const v8::Local<v8::Value>& value,
      std::vector<std::string>* const result) {
    return ::gjstest::ConvertToStringVector(
        isolate_.get(),
        value,
        result);
  }

  Local<Number> MakeNumber(double v) {
    return Number::New(isolate_.get(), v);
  }

  Local<Integer> MakeInteger(int32 v) {
    return Integer::New(isolate_.get(), v);
  }

  Local<String> MakeUtf8String(std::string s) {
    return String::NewFromUtf8(
        isolate_.get(),
        s.data(),
        String::kNormalString,
        s.size());
  }

  v8::MaybeLocal<v8::Value> ExecuteJs(const std::string& js,
                                      const std::string& filename) {
    return ::gjstest::ExecuteJs(isolate_.get(), context_, js, filename);
  }

  void RegisterFunction(
      const std::string& name,
      V8FunctionCallback* const callback,
      v8::Local<v8::ObjectTemplate>* const tmpl) {
    return ::gjstest::RegisterFunction(
        isolate_.get(),
        name,
        callback,
        tmpl);
  }

  v8::Local<v8::Function> MakeFunction(
      const std::string& name,
      V8FunctionCallback* const callback) {
    return ::gjstest::MakeFunction(
        isolate_.get(),
        name,
        callback);
  }

  const IsolateHandle isolate_ = CreateIsolate();
  const v8::Isolate::Scope isolate_scope_{ isolate_.get() };

  const HandleScope handle_scope_{ isolate_.get() };
  const Local<ObjectTemplate> global_template_{
    ObjectTemplate::New(isolate_.get()),
  };

  const Local<Context> context_{
    Context::New(
        isolate_.get(),
        nullptr,  // No extensions
        global_template_),
  };

  const Context::Scope context_scope_{ context_ };
};

////////////////////////////////////////////////////////////////////////
// ConvertToString
////////////////////////////////////////////////////////////////////////

typedef V8UtilsTest ConvertToStringTest;

TEST_F(ConvertToStringTest, Empty) {
  HandleScope handle_owner(isolate_.get());
  EXPECT_EQ("", ConvertToString(isolate_.get(), Local<Value>()));
}

TEST_F(ConvertToStringTest, Strings) {
  HandleScope handle_owner(isolate_.get());

  EXPECT_EQ("", ConvertToString(isolate_.get(), MakeUtf8String("")));
  EXPECT_EQ("taco", ConvertToString(isolate_.get(), MakeUtf8String("taco")));

  const uint16 kUtf16Chars[] = { 0xd0c0, 0xcf54 };
  EXPECT_EQ("타코",
            ConvertToString(isolate_.get(),
                            String::NewFromTwoByte(isolate_.get(), kUtf16Chars,
                                                   String::kNormalString, 2)));
}

TEST_F(ConvertToStringTest, Numbers) {
  HandleScope handle_owner(isolate_.get());

  EXPECT_EQ("-3", ConvertToString(isolate_.get(), MakeNumber(-3)));
  EXPECT_EQ("4", ConvertToString(isolate_.get(), MakeNumber(4)));
  EXPECT_EQ("3.14", ConvertToString(isolate_.get(), MakeNumber(3.14)));
}

////////////////////////////////////////////////////////////////////////
// ExecuteJs
////////////////////////////////////////////////////////////////////////

class ExecuteJsTest : public V8UtilsTest {
 public:
  std::string GetResultAsString(
      const std::string& js,
      std::string filename = "") {
    return ConvertToString(isolate_.get(),
                           ExecuteJs(js, filename).ToLocalChecked());
  }
};

TEST_F(ExecuteJsTest, EmptyString) {
  HandleScope handle_owner(isolate_.get());
  EXPECT_EQ("undefined", GetResultAsString(""));
}

TEST_F(ExecuteJsTest, BadSyntax) {
  HandleScope handle_owner(isolate_.get());

  const MaybeLocal<Value> result = ExecuteJs("(2", "");
  EXPECT_TRUE(result.IsEmpty());
}

TEST_F(ExecuteJsTest, SingleValue) {
  HandleScope handle_owner(isolate_.get());
  EXPECT_EQ("2", GetResultAsString("2"));
  EXPECT_EQ("foo", GetResultAsString("'foo'"));
}

TEST_F(ExecuteJsTest, FunctionReturnValue) {
  HandleScope handle_owner(isolate_.get());

  const std::string js =
      "var addTwo = function(a, b) { return a + b; };\n"
      "addTwo(2, 3)";

  EXPECT_EQ("5", GetResultAsString(js));
}

TEST_F(ExecuteJsTest, StackWithFilename) {
  HandleScope handle_owner(isolate_.get());

  const std::string js =
      "2+2\n"
      "new Error().stack";

  EXPECT_THAT(GetResultAsString(js, "taco.js"), HasSubstr("at taco.js:2"));
}

TEST_F(ExecuteJsTest, StackWithoutFilename) {
  HandleScope handle_owner(isolate_.get());

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
  HandleScope handle_owner(isolate_.get());

  TryCatch try_catch(isolate_.get());
  EXPECT_EQ("", DescribeError(isolate_.get(), try_catch));
}

TEST_F(DescribeErrorTest, NoMessage) {
  HandleScope handle_owner(isolate_.get());

  const std::string js = "throw new Error();";

  TryCatch try_catch(isolate_.get());
  ASSERT_TRUE(ExecuteJs(js, "taco.js").IsEmpty());

  EXPECT_EQ("taco.js:1: Error", DescribeError(isolate_.get(), try_catch));
}

TEST_F(DescribeErrorTest, WithMessage) {
  HandleScope handle_owner(isolate_.get());

  const std::string js = "throw new Error('foo');";

  TryCatch try_catch(isolate_.get());
  ASSERT_TRUE(ExecuteJs(js, "taco.js").IsEmpty());

  EXPECT_EQ("taco.js:1: Error: foo", DescribeError(isolate_.get(), try_catch));
}

////////////////////////////////////////////////////////////////////////
// ConvertToStringVector
////////////////////////////////////////////////////////////////////////

class ConvertToStringVectorTest : public V8UtilsTest {
 public:
  std::vector<std::string> EvaluateAndConvertToStringVector(
      const std::string& js) {
    std::vector<std::string> result;
    ConvertToStringVector(ExecuteJs(js, "").ToLocalChecked(), &result);
    return result;
  }
};

TEST_F(ConvertToStringVectorTest, EmptyValue) {
  HandleScope handle_owner(isolate_.get());
  std::vector<std::string> result;

  EXPECT_DEATH(ConvertToStringVector(Local<Value>(), &result), "non-empty");
}

TEST_F(ConvertToStringVectorTest, NonArray) {
  HandleScope handle_owner(isolate_.get());
  EXPECT_DEATH(EvaluateAndConvertToStringVector("'foo'"), "must be an array");
}

TEST_F(ConvertToStringVectorTest, EmptyArray) {
  HandleScope handle_owner(isolate_.get());
  EXPECT_THAT(EvaluateAndConvertToStringVector("[]"), ElementsAre());
}

TEST_F(ConvertToStringVectorTest, NonEmptyArray) {
  HandleScope handle_owner(isolate_.get());
  EXPECT_THAT(EvaluateAndConvertToStringVector("['', 'foo', 2]"),
              ElementsAre("", "foo", "2"));
}

////////////////////////////////////////////////////////////////////////
// RegisterFunction
////////////////////////////////////////////////////////////////////////

static Local<Value> AddToCounter(
    Isolate* const isolate,
    uint32* counter,
    const v8::FunctionCallbackInfo<Value>& cb_info) {
  CHECK_EQ(1, cb_info.Length());
  *counter += cb_info[0]->Uint32Value(isolate->GetCurrentContext()).ToChecked();
  return v8::Undefined(isolate);
}

typedef V8UtilsTest RegisterFunctionTest;

TEST_F(RegisterFunctionTest, CallsAppropriateCallback) {
  uint32 counter_1 = 0;
  uint32 counter_2 = 0;

  V8FunctionCallback add_to_counter_1 =
      std::bind(
          &AddToCounter,
          isolate_.get(),
          &counter_1,
          std::placeholders::_1);

  V8FunctionCallback add_to_counter_2 =
      std::bind(
          &AddToCounter,
          isolate_.get(),
          &counter_2,
          std::placeholders::_1);

  // Create a template that exports two functions to add to the two counters.
  Local<ObjectTemplate> global_template = ObjectTemplate::New(isolate_.get());

  RegisterFunction(
      "addToCounter1",
      &add_to_counter_1,
      &global_template);

  RegisterFunction(
      "addToCounter2",
      &add_to_counter_2,
      &global_template);

  // Create a context in which to run scripts and ensure that it's used whenever
  // a context is needed below. Export the global functions configured above.
  const Local<Context> context(
      Context::New(
          CHECK_NOTNULL(isolate_.get()),
          NULL,  // No extensions
          global_template));

  const Context::Scope context_scope(context);

  // Add different amounts to the two counters.
  const std::string js = "addToCounter1(3); addToCounter2(7)";
  ExecuteJs(js, "");

  EXPECT_EQ(3, counter_1);
  EXPECT_EQ(7, counter_2);
}

////////////////////////////////////////////////////////////////////////
// MakeFunction
////////////////////////////////////////////////////////////////////////

class MakeFunctionTest : public V8UtilsTest {
 protected:
  uint32 counter_ = 0;
  V8FunctionCallback callback_ =
      std::bind(
          &AddToCounter,
          isolate_.get(),
          &counter_,
          std::placeholders::_1);

  Local<Function> func_ = MakeFunction("taco", &callback_);
};

TEST_F(MakeFunctionTest, Name) {
  ASSERT_FALSE(func_.IsEmpty());

  EXPECT_EQ("taco", ConvertToString(isolate_.get(), func_->GetName()));
}

TEST_F(MakeFunctionTest, CallsCallback) {
  ASSERT_FALSE(func_.IsEmpty());

  Local<Value> one_args[] = { MakeInteger(1) };
  Local<Value> seventeen_args[] = { MakeInteger(17) };

  func_->Call(
      isolate_.get()->GetCurrentContext()->Global(),
      1,
      one_args);

  func_->Call(
      isolate_.get()->GetCurrentContext()->Global(),
      1,
      seventeen_args);

  EXPECT_EQ(18, counter_);
}

}  // namespace gjstest
