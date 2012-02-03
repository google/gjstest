// Copyright 2012 Google Inc. All Rights Reserved.
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


// This file contains mostly code imported from the v8 project, at
// trunk/src/d8.cc. The original copyright notice is as follows.

// Copyright 2012 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#include "gjstest/internal/cpp/typed_arrays.h"

#include "base/logging.h"

using v8::Arguments;
using v8::ExternalArrayType;
using v8::FunctionTemplate;
using v8::Handle;
using v8::HandleScope;
using v8::Int32;
using v8::Local;
using v8::Object;
using v8::ObjectTemplate;
using v8::Persistent;
using v8::ReadOnly;
using v8::String;
using v8::True;
using v8::TryCatch;
using v8::Value;
using v8::kExternalByteArray;
using v8::kExternalShortArray;
using v8::kExternalUnsignedByteArray;

namespace gjstest {

static const char kArrayBufferReferencePropName[] = "_is_array_buffer_";
static const char kArrayBufferMarkerPropName[] = "_array_buffer_ref_";

static size_t convertToUint(Local<Value> value_in, TryCatch* try_catch) {
  if (value_in->IsUint32()) {
    return value_in->Uint32Value();
  }

  Local<Value> number = value_in->ToNumber();
  if (try_catch->HasCaught()) return 0;

  CHECK(number->IsNumber());
  Local<Int32> int32 = number->ToInt32();
  if (try_catch->HasCaught() || int32.IsEmpty()) return 0;

  int32_t raw_value = int32->Int32Value();
  if (try_catch->HasCaught()) return 0;

  if (raw_value < 0) {
    ThrowException(String::New("Array length must not be negative."));
    return 0;
  }

  static const int kMaxLength = 0x3fffffff;
  if (raw_value > static_cast<int32_t>(kMaxLength)) {
    ThrowException(
        String::New("Array length exceeds maximum length."));
  }
  return static_cast<size_t>(raw_value);
}

static void ExternalArrayWeakCallback(Persistent<Value> object, void* data) {
  HandleScope scope;
  Handle<String> prop_name = String::New(kArrayBufferReferencePropName);
  Handle<Object> converted_object = object->ToObject();
  Local<Value> prop_value = converted_object->Get(prop_name);
  if (data != NULL && !prop_value->IsObject()) {
    free(data);
  }
  object.Dispose();
}

static Handle<Value> CreateExternalArray(
    const Arguments& args,
    ExternalArrayType type,
    size_t element_size) {
  TryCatch try_catch;
  bool is_array_buffer_construct = element_size == 0;
  if (is_array_buffer_construct) {
    type = v8::kExternalByteArray;
    element_size = 1;
  }
  CHECK(element_size == 1 || element_size == 2 || element_size == 4 ||
        element_size == 8);
  if (args.Length() == 0) {
    return ThrowException(
        String::New("Array constructor must have at least one "
                    "parameter."));
  }
  bool first_arg_is_array_buffer =
      args[0]->IsObject() &&
      args[0]->ToObject()->Get(
          String::New(kArrayBufferMarkerPropName))->IsTrue();
  // Currently, only the following constructors are supported:
  //   TypedArray(unsigned long length)
  //   TypedArray(ArrayBuffer buffer,
  //              optional unsigned long byteOffset,
  //              optional unsigned long length)
  if (args.Length() > 3) {
    return ThrowException(
        String::New("Array constructor from ArrayBuffer must "
                    "have 1-3 parameters."));
  }

  Local<Value> length_value = (args.Length() < 3)
      ? (first_arg_is_array_buffer
         ? args[0]->ToObject()->Get(String::New("length"))
         : args[0])
      : args[2];
  size_t length = convertToUint(length_value, &try_catch);
  if (try_catch.HasCaught()) return try_catch.Exception();

  void* data = NULL;
  size_t offset = 0;

  Handle<Object> array = Object::New();
  if (first_arg_is_array_buffer) {
    Handle<Object> derived_from = args[0]->ToObject();
    data = derived_from->GetIndexedPropertiesExternalArrayData();

    size_t array_buffer_length = convertToUint(
        derived_from->Get(String::New("length")),
        &try_catch);
    if (try_catch.HasCaught()) return try_catch.Exception();

    if (data == NULL && array_buffer_length != 0) {
      return ThrowException(
          String::New("ArrayBuffer doesn't have data"));
    }

    if (args.Length() > 1) {
      offset = convertToUint(args[1], &try_catch);
      if (try_catch.HasCaught()) return try_catch.Exception();

      // The given byteOffset must be a multiple of the element size of the
      // specific type, otherwise an exception is raised.
      if (offset % element_size != 0) {
        return ThrowException(
            String::New("offset must be multiple of element_size"));
      }
    }

    if (offset > array_buffer_length) {
      return ThrowException(
          String::New("byteOffset must be less than ArrayBuffer length."));
    }

    if (args.Length() == 2) {
      // If length is not explicitly specified, the length of the ArrayBuffer
      // minus the byteOffset must be a multiple of the element size of the
      // specific type, or an exception is raised.
      length = array_buffer_length - offset;
    }

    if (args.Length() != 3) {
      if (length % element_size != 0) {
        return ThrowException(
            String::New("ArrayBuffer length minus the byteOffset must be a "
                        "multiple of the element size"));
      }
      length /= element_size;
    }

    // If a given byteOffset and length references an area beyond the end of
    // the ArrayBuffer an exception is raised.
    if (offset + (length * element_size) > array_buffer_length) {
      return ThrowException(
          String::New("length references an area beyond the end of the "
                      "ArrayBuffer"));
    }

    // Hold a reference to the ArrayBuffer so its buffer doesn't get collected.
    array->Set(String::New(kArrayBufferReferencePropName), args[0], ReadOnly);
  }

  if (is_array_buffer_construct) {
    array->Set(String::New(kArrayBufferMarkerPropName), True(), ReadOnly);
  }

  Persistent<Object> persistent_array = Persistent<Object>::New(array);
  persistent_array.MakeWeak(data, ExternalArrayWeakCallback);
  persistent_array.MarkIndependent();
  if (data == NULL && length != 0) {
    data = calloc(length, element_size);
    if (data == NULL) {
      return ThrowException(String::New("Memory allocation failed."));
    }
  }

  array->SetIndexedPropertiesToExternalArrayData(
      reinterpret_cast<uint8_t*>(data) + offset, type,
      static_cast<int>(length));
  array->Set(String::New("length"),
             Int32::New(static_cast<int32_t>(length)), ReadOnly);
  array->Set(String::New("BYTES_PER_ELEMENT"),
             Int32::New(static_cast<int32_t>(element_size)));
  return array;
}

Handle<Value> ArrayBuffer(const Arguments& args) {
  return CreateExternalArray(args, kExternalByteArray, 0);
}

Handle<Value> Int8Array(const Arguments& args) {
  return CreateExternalArray(args, kExternalByteArray, sizeof(int8_t));
}

Handle<Value> Int16Array(const Arguments& args) {
  return CreateExternalArray(args, kExternalShortArray, sizeof(int16_t));
}

void ExportTypedArrays(
    const Handle<ObjectTemplate>& global_template) {
  global_template->Set(
      String::New("ArrayBuffer"),
      FunctionTemplate::New(ArrayBuffer));

  global_template->Set(
      String::New("Int8Array"),
      FunctionTemplate::New(Int8Array));

  global_template->Set(
      String::New("Int16Array"),
      FunctionTemplate::New(Int16Array));
}

}  // namespace gjstest
