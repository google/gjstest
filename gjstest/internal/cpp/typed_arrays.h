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

// Utility functions useful in implementing typed array support, as defined in
// this specification:
//
//     http://www.khronos.org/registry/typedarray/specs/latest/
//

#ifndef GJSTEST_INTERNAL_CPP_TYPED_ARRAYS_H_
#define GJSTEST_INTERNAL_CPP_TYPED_ARRAYS_H_

#include <memory>

#include <v8.h>

namespace gjstest {

// Create a straightforward array buffer allocator for v8.
std::unique_ptr<v8::ArrayBuffer::Allocator> NewArrayBufferAllocator();

}  // namespace gjstest

#endif  // GJSTEST_INTERNAL_CPP_TYPED_ARRAYS_H_
