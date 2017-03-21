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

#ifndef GJSTEST_INTERNAL_CPP_BUILTIN_DATA_H_
#define GJSTEST_INTERNAL_CPP_BUILTIN_DATA_H_

#include "base/stl_decl.h"

namespace gjstest {

class NamedScripts;

// Attempt to load the built-in scripts that every test should have accessible
// (e.g. matchers and the mocking framework) into the supplied proto.
//
// The scripts are found using the data_dir flag.
bool GetBuiltinScripts(
    NamedScripts* scripts,
    string* error);

// Get absolute paths for the built-in scripts.
bool GetBuiltinScriptPaths(
    std::vector<string>* paths,
    string* error);

// Get the path for the built-in CSS file.
string GetBuiltinCssPath();

}  // namespace gjstest

#endif  // GJSTEST_INTERNAL_CPP_BUILTIN_DATA_H_
