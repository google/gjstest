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

#include "gjstest/internal/cpp/v8_utils.h"

#include "base/integral_types.h"
#include "base/logging.h"
#include "base/stringprintf.h"
#include "gjstest/internal/cpp/typed_arrays.h"

using v8::Array;
using v8::External;
using v8::Function;
using v8::FunctionTemplate;
using v8::Handle;
using v8::Isolate;
using v8::Local;
using v8::Message;
using v8::ObjectTemplate;
using v8::ScriptCompiler;
using v8::ScriptOrigin;
using v8::StackFrame;
using v8::StackTrace;
using v8::String;
using v8::TryCatch;
using v8::UnboundScript;
using v8::Value;

// HACK(jacobsa): Manually-declare CreateDefaultPlatform instead of including
// libplatform.h because the intended use of the latter is crazy confusing.
// Cf. https://groups.google.com/d/msg/v8-users/ru0NaeXUxMo/w_WixFs6JxYJ
#include <v8-platform.h>
namespace v8 {
namespace platform {
v8::Platform* CreateDefaultPlatform(int thread_pool_size = 0);
}  // namespace platform
}  // namespace v8

namespace gjstest {

void InitializeV8() {
  v8::V8::InitializePlatform(v8::platform::CreateDefaultPlatform());
  v8::V8::Initialize();
  EnableTypedArrays();
}

static Local<String> ConvertString(
    Isolate* const isolate,
    const std::string& s) {
  return String::NewFromUtf8(
      isolate,
      s.data(),
      String::kNormalString,
      s.size());
}

std::string ConvertToString(const Handle<Value>& value) {
  const String::Utf8Value utf8_value(value);
  return std::string(*utf8_value, utf8_value.length());
}

void ConvertToStringVector(
    v8::Isolate* const isolate,
    const v8::Handle<v8::Value>& value,
    std::vector<std::string>* result) {
  CHECK(!value.IsEmpty()) << "value must be non-empty";
  CHECK(value->IsArray()) << "value must be an array";

  Array* array = Array::Cast(*value);
  const uint32 length = array->Length();

  for (uint32 i = 0; i < length; ++i) {
    result->push_back(ConvertToString(array->Get(i)));
  }
}

static Local<UnboundScript> Compile(
    Isolate* const isolate,
    const std::string& js,
    const std::string& filename) {
  if (filename.empty()) {
    ScriptCompiler::Source source(ConvertString(isolate, js));
    return ScriptCompiler::CompileUnbound(
        isolate,
        &source);
  }

  ScriptCompiler::Source source(
      ConvertString(isolate, js),
      ScriptOrigin(ConvertString(isolate, filename)));

  return ScriptCompiler::CompileUnbound(
      isolate,
      &source);
}

Local<Value> ExecuteJs(
    Isolate* const isolate,
    const std::string& js,
    const std::string& filename) {
  // Attempt to compile the script.
  const Local<UnboundScript> script = Compile(isolate, js, filename);

  if (script.IsEmpty()) {
    return Local<Value>();
  }

  // Run the script.
  return script->BindToCurrentContext()->Run();
}

std::string DescribeError(const TryCatch& try_catch) {
  const std::string exception = ConvertToString(try_catch.Exception());
  const Local<Message> message = try_catch.Message();

  // If there's no message, just return the exception.
  if (message.IsEmpty()) return exception;

  // We want to return a message of the form:
  //
  //     foo.js:7: ReferenceError: blah is not defined.
  //
  const std::string filename =
      ConvertToString(message->GetScriptResourceName());
  const int line = message->GetLineNumber();

  // Sometimes for multi-line errors there is no line number.
  if (!line) {
    return StringPrintf("%s: %s", filename.c_str(), exception.c_str());
  }

  return StringPrintf("%s:%i: %s", filename.c_str(), line, exception.c_str());
}

static void RunAssociatedCallback(
    const v8::FunctionCallbackInfo<Value>& cb_info) {
  // Unwrap the callback that was associated with this function.
  const Local<Value> data = cb_info.Data();
  CHECK(data->IsExternal());

  const External* external = External::Cast(*data);
  V8FunctionCallback* const callback =
      static_cast<V8FunctionCallback*>(
          CHECK_NOTNULL(external->Value()));

  cb_info.GetReturnValue().Set((*callback)(cb_info));
}

void RegisterFunction(
    Isolate* const isolate,
    const std::string& name,
    V8FunctionCallback* callback,
    Handle<ObjectTemplate>* tmpl) {
  // Wrap up the callback in an External that can be decoded later.
  const Local<Value> data = External::New(isolate, CHECK_NOTNULL(callback));

  // Create a function template with the wrapped callback as associated data,
  // and export it.
  (*CHECK_NOTNULL(tmpl))->Set(
      ConvertString(isolate, name),
      FunctionTemplate::New(
          isolate,
          RunAssociatedCallback,
          data));
}

Local<Function> MakeFunction(
    Isolate* const isolate,
    const std::string& name,
    V8FunctionCallback* callback) {
  // Wrap up the callback in an External that can be decoded later.
  const Local<Value> data =
      External::New(
          isolate,
          CHECK_NOTNULL(callback));

  // Create a function template with the wrapped callback as associated data,
  // and instantiate it.
  const Local<Function> result =
      FunctionTemplate::New(
          isolate,
          RunAssociatedCallback,
          data)
      ->GetFunction();

  result->SetName(ConvertString(isolate, name));

  return result;
}

}  // namespace gjstest
