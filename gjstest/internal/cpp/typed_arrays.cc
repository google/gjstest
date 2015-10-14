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

#include <stdlib.h>
#include <string.h>
#include <v8.h>

#include "gjstest/internal/cpp/typed_arrays.h"

namespace gjstest {

namespace {
class MallocArrayBufferAllocator : public v8::ArrayBuffer::Allocator {
public:
  virtual void* Allocate(size_t length) {
    void* const result = malloc(length);
    if (result) {
      memset(result, 0, length);
    }

    return result;
  }

  virtual void* AllocateUninitialized(size_t length) {
    return malloc(length);
  }

  virtual void Free(void* data, size_t length) {
    free(data);
  }
};
}  // namespace

std::unique_ptr<v8::ArrayBuffer::Allocator> NewArrayBufferAllocator() {
  return std::unique_ptr<v8::ArrayBuffer::Allocator>(
      new MallocArrayBufferAllocator);
}

}  // namespace gjstest
