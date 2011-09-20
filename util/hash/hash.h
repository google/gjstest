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

// Helper code that makes hash_map and hash_set usable.

#ifndef UTIL_HASH_HASH_H_
#define UTIL_HASH_HASH_H_

#include "base/stl_decl.h"
#include "third_party/cityhash/city.h"

namespace HASH_NAMESPACE {

// Make sure hash<string> is available.
template<>
struct hash<string> {
  size_t operator()(const string& s) const {
    return CityHash64(s.data(), s.size());
  }
};

#endif  // UTIL_HASH_HASH_H_
