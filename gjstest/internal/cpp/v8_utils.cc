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

#include <v8-platform.h>
#include <libplatform/libplatform.h>

#include "base/integral_types.h"
#include "base/logging.h"
#include "base/stringprintf.h"
#include "gjstest/internal/cpp/typed_arrays.h"

using v8::Array;
using v8::Context;
using v8::External;
using v8::Function;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::MaybeLocal;
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

namespace gjstest {

// The global platform that we initialized v8 with.
static v8::Platform* platform_;

// Ensure that v8 and platform_ have been initialized.
static void InitOnce() {
  static const int dummy = []{
    platform_ = v8::platform::CreateDefaultPlatform();
    v8::V8::InitializePlatform(platform_);
    v8::V8::Initialize();
    return 0;
  }();

  (void)dummy;  // Silence "unused variable" errors.
}

IsolateHandle CreateIsolate() {
  InitOnce();

  // Create an array buffer allocator.
  const std::shared_ptr<v8::ArrayBuffer::Allocator> allocator =
      NewArrayBufferAllocator();

  // Set up an appropriate isolate, ensuring that it is disposed of when the
  // handle goes away. Also make sure the allocator sticks around as long as
  // needed.
  v8::Isolate::CreateParams params;
  params.array_buffer_allocator = allocator.get();

  return {
    v8::Isolate::New(params),
    [allocator] (v8::Isolate* const isolate) {
      isolate->Dispose();
    },
  };
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

std::string ConvertToString(v8::Isolate* isolate, const Local<Value>& value) {
  const String::Utf8Value utf8_value(isolate, value);
  return std::string(*utf8_value, utf8_value.length());
}

void ConvertToStringVector(
    v8::Isolate* const isolate,
    const v8::Local<v8::Value>& value,
    std::vector<std::string>* result) {
  CHECK(!value.IsEmpty()) << "value must be non-empty";
  CHECK(value->IsArray()) << "value must be an array";

  Array* array = Array::Cast(*value);
  const uint32 length = array->Length();

  for (uint32 i = 0; i < length; ++i) {
    result->push_back(ConvertToString(isolate, array->Get(i)));
  }
}

static MaybeLocal<UnboundScript> Compile(Isolate* const isolate,
                                         const std::string& js,
                                         const std::string& filename) {
  if (filename.empty()) {
    ScriptCompiler::Source source(ConvertString(isolate, js));
    return ScriptCompiler::CompileUnboundScript(isolate, &source);
  }

  ScriptCompiler::Source source(
      ConvertString(isolate, js),
      ScriptOrigin(ConvertString(isolate, filename)));

  return ScriptCompiler::CompileUnboundScript(isolate, &source);
}

MaybeLocal<Value> ExecuteJs(Isolate* const isolate, Local<Context> context,
                            const std::string& js,
                            const std::string& filename) {
  InitOnce();

  // Attempt to compile the script.
  Local<UnboundScript> script;

  if (!Compile(isolate, js, filename).ToLocal(&script)) {
    return Local<Value>();
  }

  // Run the script.
  auto result = script->BindToCurrentContext()->Run(context);

  // Give v8 a chance to process any foreground tasks that are pending.
  while (v8::platform::PumpMessageLoop(platform_, isolate)) {}

  return result;
}

std::string DescribeError(Isolate* isolate, const TryCatch& try_catch) {
  const std::string exception = ConvertToString(isolate, try_catch.Exception());
  const Local<Message> message = try_catch.Message();

  // If there's no message, just return the exception.
  if (message.IsEmpty()) return exception;

  // We want to return a message of the form:
  //
  //     foo.js:7: ReferenceError: blah is not defined.
  //
  const std::string filename =
      ConvertToString(isolate, message->GetScriptResourceName());

  int line;
  // Sometimes for multi-line errors there is no line number.
  if (!message->GetLineNumber(isolate->GetCurrentContext()).To(&line)) {
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
    Local<ObjectTemplate>* tmpl) {
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
