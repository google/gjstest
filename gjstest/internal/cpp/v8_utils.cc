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

using v8::Arguments;
using v8::Array;
using v8::External;
using v8::Function;
using v8::FunctionTemplate;
using v8::Handle;
using v8::Local;
using v8::Message;
using v8::ObjectTemplate;
using v8::Persistent;
using v8::Script;
using v8::StackFrame;
using v8::StackTrace;
using v8::String;
using v8::TryCatch;
using v8::Value;

namespace gjstest {

static Local<String> ConvertString(const std::string& s) {
  return String::New(s.data(), s.size());
}

std::string ConvertToString(const Handle<Value>& value) {
  const String::Utf8Value utf8_value(value);
  return std::string(*utf8_value, utf8_value.length());
}

void ConvertToStringVector(
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

Local<Value> ExecuteJs(
    const std::string& js,
    const std::string& filename) {
  // Attempt to parse the script.
  const Local<Script> script =
      filename.empty() ?
          Script::New(ConvertString(js)) :
          Script::New(ConvertString(js), ConvertString(filename));

  if (script.IsEmpty()) {
    return Local<Value>();
  }

  // Run the script.
  return script->Run();
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

static Handle<Value> RunAssociatedCallback(const Arguments& args) {
  // Unwrap the callback that was associated with this function.
  const Local<Value> data = args.Data();
  CHECK(data->IsExternal());

  const External* external = External::Cast(*data);
  V8FunctionCallback* callback =
      static_cast<V8FunctionCallback*>(external->Value());

  return callback->Run(args);
}

static void DeleteCallback(Persistent<Value> ref, void* callback) {
  ref.ClearWeak();
  delete static_cast<V8FunctionCallback*>(callback);
}

void RegisterFunction(
    const std::string& name,
    V8FunctionCallback* callback,
    Handle<ObjectTemplate>* tmpl) {
  CHECK(callback->IsRepeatable());

  // Wrap up the callback in an External that can be decoded later.
  const Local<Value> data = External::New(callback);

  // Create a function template with the wrapped callback as associated data,
  // and export it.
  (*tmpl)->Set(
      String::New(name.c_str(), name.size()),
      FunctionTemplate::New(RunAssociatedCallback, data));

  // Dispose of the callback when the object template goes away.
  Persistent<ObjectTemplate> weak_ref = Persistent<ObjectTemplate>::New(*tmpl);
  weak_ref.MakeWeak(callback, DeleteCallback);
}

Local<Function> MakeFunction(
    const std::string& name,
    V8FunctionCallback* callback) {
  CHECK(callback->IsRepeatable());

  // Wrap up the callback in an External that can be decoded later.
  const Local<Value> data = External::New(callback);

  // Create a function template with the wrapped callback as associated data,
  // and instantiate it.
  const Local<Function> result =
      FunctionTemplate::New(RunAssociatedCallback, data)->GetFunction();

  result->SetName(String::New(name.data(), name.size()));

  // Dispose of the callback when the function is garbage collected.
  Persistent<Function> weak_ref = Persistent<Function>::New(result);
  weak_ref.MakeWeak(callback, DeleteCallback);

  return result;
}

}  // namespace gjstest
