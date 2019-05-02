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

// Utility functions to make dealing with v8 a bit nicer. Each of these
// functions assumes that they are called with an existing isolate, context, and
// handle scope configured.

#ifndef GJSTEST_INTERNAL_CPP_V8_UTILS_H_
#define GJSTEST_INTERNAL_CPP_V8_UTILS_H_

#include <functional>
#include <memory>
#include <string>
#include <vector>

#include <v8.h>

namespace gjstest {

// An RAII handle for an isolate.
typedef std::shared_ptr<v8::Isolate> IsolateHandle;

// Create an initialized v8 isolate, with support for array buffers.
IsolateHandle CreateIsolate();

// Convert the supplied value to a UTF-8 string.
std::string ConvertToString(v8::Isolate* isolate,
                            const v8::Local<v8::Value>& value);

// Convert the supplied value, which must be an array, into a vector of strings.
void ConvertToStringVector(
    v8::Isolate* isolate,
    const v8::Local<v8::Value>& value,
    std::vector<std::string>* result);

// Execute the supplied string as JS in the current context, returning the
// result, or an empty handle in the event of an error. (The error can be
// recovered by creating a TryCatch object on the stack before calling this
// function.)
//
// If filename is non-empty, it will be given to v8 to improve stack traces for
// errors.
v8::MaybeLocal<v8::Value> ExecuteJs(v8::Isolate* isolate,
                                    v8::Local<v8::Context> context,
                                    const std::string& js,
                                    const std::string& filename);

// Return a human-readable string describing the error caught by the supplied
// try-catch block.
std::string DescribeError(v8::Isolate*, const v8::TryCatch& try_catch);

// C++ functions exported by v8 must accept a FunctionCallbackInfo<Value> object
// and return a handle to a Value.
typedef std::function<
    v8::Local<v8::Value>(const v8::FunctionCallbackInfo<v8::Value>&)>
        V8FunctionCallback;

// Export a JS function with the given name in the supplied template, invoking
// the supplied callback whenever it is called. The callback must continue to
// exist for as long as the function may be called in JS, and must not be
// modified.
void RegisterFunction(
    v8::Isolate* isolate,
    const std::string& name,
    V8FunctionCallback* callback,
    v8::Local<v8::ObjectTemplate>* tmpl);

// Create a JS function with the supplied name that calls the given callback
// when invoked. The callback must continue to exist for as long as the function
// may be called in JS, and must not be modified.
v8::Local<v8::Function> MakeFunction(
    v8::Isolate* isolate,
    const std::string& name,
    V8FunctionCallback* callback);

}  // namespace gjstest

#endif  // GJSTEST_INTERNAL_CPP_V8_UTILS_H_
