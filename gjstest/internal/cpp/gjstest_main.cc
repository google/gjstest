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

// The main Google JS Test tool. Executes each JS file it's given, in order,
// then runs any tests that were registered in the process.
//
// Input files should be topologically sorted. That is, if you have
// foo_test.js, which tests foo.js, which depends on bar.js and baz.js, the
// input should look like this:
//
//     --js_files=\
//         bar.js,\
//         baz.js,\
//         foo.js,\
//         foo_test.js
//
// (The relative order of bar.js and baz.js does not matter in this example.)
//
// Dependencies common to all gjstest tests (e.g. built-in matchers and the
// mocking framework) are added automatically, and should not be specified.

#include <iostream>
#include <string>
#include <vector>

#include <gflags/gflags.h>

#include "base/integral_types.h"
#include "base/logging.h"
#include "file/file_utils.h"
#include "gjstest/internal/cpp/run_tests.h"
#include "gjstest/internal/proto/named_scripts.pb.h"
#include "strings/strutil.h"

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

DEFINE_string(xml_output_file, "", "An XML file to write results to.");
DEFINE_string(filter, "", "Regular expression for test names to run.");

namespace gjstest {

static string GetBuiltIn(
    const string& relative_path) {
  return FLAGS_gjstest_data_dir + "/" + relative_path;
}

// Attempt to read in all of the specified user scripts.
static bool GetScripts(
    NamedScripts* scripts,
    string* error) {
  vector<string> paths;

  // Add built-in dependencies, in topologically sorted order.
  paths.push_back(GetBuiltIn("internal/js/namespace.js"));
  paths.push_back(GetBuiltIn("internal/js/error_utils.js"));
  paths.push_back(GetBuiltIn("internal/js/stack_utils.js"));
  paths.push_back(GetBuiltIn("internal/js/test_environment.js"));
  paths.push_back(GetBuiltIn("public/matcher_types.js"));
  paths.push_back(GetBuiltIn("public/matchers/number_matchers.js"));
  paths.push_back(GetBuiltIn("internal/js/browser/html_builder.js"));
  paths.push_back(GetBuiltIn("internal/js/expect_that.js"));
  paths.push_back(GetBuiltIn("public/matchers/boolean_matchers.js"));
  paths.push_back(GetBuiltIn("public/matchers/equality_matchers.js"));
  paths.push_back(GetBuiltIn("internal/js/call_expectation.js"));
  paths.push_back(GetBuiltIn("internal/js/mock_function.js"));
  paths.push_back(GetBuiltIn("internal/js/mock_instance.js"));
  paths.push_back(GetBuiltIn("public/stringify.js"));
  paths.push_back(GetBuiltIn("public/assertions.js"));
  paths.push_back(GetBuiltIn("public/mocking.js"));
  paths.push_back(GetBuiltIn("public/register.js"));
  paths.push_back(GetBuiltIn("internal/js/run_test.js"));
  paths.push_back(GetBuiltIn("internal/js/browser/run_tests.js"));
  paths.push_back(GetBuiltIn("public/logging.js"));
  paths.push_back(GetBuiltIn("public/matchers/array_matchers.js"));
  paths.push_back(GetBuiltIn("public/matchers/function_matchers.js"));
  paths.push_back(GetBuiltIn("public/matchers/string_matchers.js"));
  paths.push_back(GetBuiltIn("internal/js/use_global_namespace.js"));

  // Add paths specified by the user.
  vector<string> user_paths;
  SplitStringUsing(FLAGS_js_files, ",", &user_paths);
  paths.insert(paths.end(), user_paths.begin(), user_paths.end());

  for (uint32 i = 0; i < paths.size(); ++i) {
    const string& path = paths[i];

    NamedScript* script = scripts->add_script();
    script->set_name(Basename(path));
    script->set_source(ReadFileOrDie(path));
  }

  return true;
}

static bool Run() {
  // Attempt to load the appropriate scripts.
  NamedScripts scripts;
  string error;
  if (!GetScripts(&scripts, &error)) {
    LOG(ERROR) << "Failed to load scripts: " << error;
    return false;
  }

  // Run any tests registered.
  string output;
  string xml;
  const bool success = RunTests(scripts, FLAGS_filter, &output, &xml);

  // Log the output.
  //
  // TODO(jacobsa): Use a different severity?
  std::cout << output;

  // Write out the XML file to the appropriate place.
  if (!FLAGS_xml_output_file.empty()) {
    WriteStringToFileOrDie(xml, FLAGS_xml_output_file);
  }

  return success;
}

}  // namespace gjstest

int main(int argc, char** argv) {
  google::InitGoogleLogging(argv[0]);
  google::ParseCommandLineFlags(&argc, &argv, true);

  return gjstest::Run() ? 0 : 1;
}
