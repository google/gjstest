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
#include "file/file_utils.h"
#include "gjstest/internal/proto/named_scripts.pb.h"

DEFINE_string(js_files, "",
              "The list of JS files to execute, comma separated.");

// The default data directory, which must be set at compilation time.
#ifndef DEFAULT_DATA_DIR
#error "You must specify DEFAULT_DATA_DIR when compiling."
#endif

#define DOUBLE_STRINGIFY(x) STRINGIFY(x)
#define STRINGIFY(x) #x

DEFINE_string(gjstest_data_dir, DOUBLE_STRINGIFY(DEFAULT_DATA_DIR),
              "A path containing built-in test dependencies.");

namespace gjstest {

static string GetPath(
    const string& relative_path) {
  return FLAGS_gjstest_data_dir + "/" + relative_path;
}

// Attempt to read in all of the specified user scripts.
bool GetBuiltinScripts(
    NamedScripts* scripts,
    string* error) {
  vector<string> paths;

  // Build a list of paths.
  paths.push_back(GetPath("internal/js/namespace.js"));
  paths.push_back(GetPath("internal/js/error_utils.js"));
  paths.push_back(GetPath("internal/js/stack_utils.js"));
  paths.push_back(GetPath("internal/js/test_environment.js"));
  paths.push_back(GetPath("public/matcher_types.js"));
  paths.push_back(GetPath("public/matchers/number_matchers.js"));
  paths.push_back(GetPath("internal/js/browser/html_builder.js"));
  paths.push_back(GetPath("internal/js/expect_that.js"));
  paths.push_back(GetPath("public/matchers/boolean_matchers.js"));
  paths.push_back(GetPath("public/matchers/equality_matchers.js"));
  paths.push_back(GetPath("internal/js/call_expectation.js"));
  paths.push_back(GetPath("internal/js/mock_function.js"));
  paths.push_back(GetPath("internal/js/mock_instance.js"));
  paths.push_back(GetPath("public/stringify.js"));
  paths.push_back(GetPath("public/assertions.js"));
  paths.push_back(GetPath("public/mocking.js"));
  paths.push_back(GetPath("public/register.js"));
  paths.push_back(GetPath("internal/js/run_test.js"));
  paths.push_back(GetPath("internal/js/browser/run_tests.js"));
  paths.push_back(GetPath("public/logging.js"));
  paths.push_back(GetPath("public/matchers/array_matchers.js"));
  paths.push_back(GetPath("public/matchers/function_matchers.js"));
  paths.push_back(GetPath("public/matchers/string_matchers.js"));
  paths.push_back(GetPath("internal/js/use_global_namespace.js"));

  // Read in each path.
  for (uint32 i = 0; i < paths.size(); ++i) {
    const string& path = paths[i];

    NamedScript* script = scripts->add_script();
    script->set_name(Basename(path));
    script->set_source(ReadFileOrDie(path));
  }

  return true;
}

}  // namespace gjstest
