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

#include <gflags/gflags.h>

#include "base/logging.h"
#include "base/macros.h"
#include "file/file_utils.h"
#include "gjstest/internal/cpp/builtin_data.h"
#include "gjstest/internal/cpp/builtin_paths.generated.h"
#include "gjstest/internal/proto/named_scripts.pb.h"
#include "strings/strutil.h"

// The default data directory, which must be set at compilation time.
#ifndef DEFAULT_DATA_DIR
#error "You must specify DEFAULT_DATA_DIR when compiling."
#endif

#define DOUBLE_STRINGIFY(x) STRINGIFY(x)
#define STRINGIFY(x) #x

DEFINE_string(data_dir, DOUBLE_STRINGIFY(DEFAULT_DATA_DIR),
              "A path containing built-in test dependencies.");

namespace gjstest {

static string GetPath(
    const string& relative_path) {
  return FLAGS_data_dir + "/" + relative_path;
}

bool GetBuiltinScripts(
    NamedScripts* scripts,
    string* error) {
  // Attempt to get absolute paths for each built-in script.
  std::vector<string> paths;
  if (!GetBuiltinScriptPaths(&paths, error)) {
    return false;
  }

  // Load each script.
  for (uint32 i = 0; i < paths.size(); ++i) {
    const string& path = paths[i];

    NamedScript* script = scripts->add_script();
    script->set_name(Basename(path));
    script->set_source(ReadFileOrDie(path));
  }

  return true;
}

bool GetBuiltinScriptPaths(
    std::vector<string>* paths,
    string* error) {
  for (uint32 i = 0; i < arraysize(kBuiltinPaths); ++i) {
    paths->push_back(GetPath(kBuiltinPaths[i]));
  }

  return true;
}

string GetBuiltinCssPath() {
  return GetPath("internal/js/browser/browser.css");
}

}  // namespace gjstest
