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
//     --js_files=bar.js,baz.js,foo.js,foo_test.js
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
#include "base/stringprintf.h"
#include "file/file_utils.h"
#include "gjstest/internal/cpp/builtin_data.h"
#include "gjstest/internal/cpp/run_tests.h"
#include "gjstest/internal/cpp/typed_arrays.h"
#include "gjstest/internal/proto/named_scripts.pb.h"
#include "strings/strutil.h"

DEFINE_string(js_files, "",
              "The list of JS files to execute, comma separated.");

DEFINE_string(xml_output_file, "", "An XML file to write results to.");

DEFINE_string(coverage_output_file, "",
              "A file to which coverage info should be written. If this is "
              "specified, it is assumed that the input JS files are "
              "instrumented using jscoverage.");

DEFINE_string(filter, "", "Regular expression for test names to run.");

// Browser support
DEFINE_string(html_output_file, "",
              "An HTML file to generate for running the test in a browser. "
              "If this is non-empty, the HTML will be produced and the tool "
              "will exit without running any tests.");

DEFINE_string(html_title, "", "The title to use on the output HTML page.");

DEFINE_string(html_script_path_prefix, "",
              "A string to prepend to scripts referenced by the generated HTML "
              "file, useful if you're doing funny things with paths.");

namespace gjstest {

// Attempt to read in all of the built-in and user-specified scripts.
static bool GetScripts(
    NamedScripts* scripts,
    string* error) {
  // First attempt to get the built-in ones.
  if (!GetBuiltinScripts(scripts, error)) {
    return false;
  }

  // Load the paths specified by the user.
  std::vector<string> paths;
  SplitStringUsing(FLAGS_js_files, ",", &paths);

  for (uint32 i = 0; i < paths.size(); ++i) {
    const string& path = paths[i];

    NamedScript* script = scripts->add_script();
    script->set_name(Basename(path));
    script->set_source(ReadFileOrDie(path));
  }

  return true;
}

static bool GenerateHtml() {
  string html = "<!doctype html>\n"
                "<html lang=\"en\">\n"
                "<head>\n"
                "  <meta charset=\"utf-8\">\n";

  // Pull in built-in scripts.
  std::vector<string> builtin_paths;
  string error;
  if (!GetBuiltinScriptPaths(&builtin_paths, &error)) {
    LOG(ERROR) << error;
    return false;
  }

  for (uint32 i = 0; i < builtin_paths.size(); ++i) {
    const string& path = builtin_paths[i];
    html +=
        StringPrintf(
            "  <script src=\"%s\"></script>\n",
            path.c_str());
  }

  // Add a script tag for each user script.
  std::vector<string> user_paths;
  SplitStringUsing(FLAGS_js_files, ",", &user_paths);

  for (uint32 i = 0; i < user_paths.size(); ++i) {
    const string& path = user_paths[i];
    html +=
        StringPrintf(
            "  <script src=\"%s%s\"></script>\n",
            FLAGS_html_script_path_prefix.c_str(),
            path.c_str());
  }

  // Pull in the CSS file.
  html +=
      StringPrintf(
          "  <link rel=\"stylesheet\" href=\"%s\">\n",
          GetBuiltinCssPath().c_str());

  // Add an onload handler and a footer.
  html +=
      StringPrintf(
          "</head>\n<body onLoad=\""
              "gjstest.internal.runTestsInBrowser('%s');\">\n"
              "</body>\n</html>",
          FLAGS_html_title.c_str());

  // Write out the file.
  WriteStringToFileOrDie(html, FLAGS_html_output_file);

  return true;
}

static bool Run() {
  // If HTML output was requested, generate it and quit.
  if (!FLAGS_html_output_file.empty()) {
    return GenerateHtml();
  }

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
  string coverage_info;

  const bool success =
      RunTests(
          scripts,
          FLAGS_filter,
          &output,
          &xml,
          FLAGS_coverage_output_file.empty() ? NULL : &coverage_info);

  // Log the output.
  std::cout << output;

  // Write out the XML file to the appropriate place.
  if (!FLAGS_xml_output_file.empty()) {
    WriteStringToFileOrDie(xml, FLAGS_xml_output_file);
  }

  // Write out coverage info to the appropriate place.
  if (!FLAGS_coverage_output_file.empty()) {
    WriteStringToFileOrDie(coverage_info, FLAGS_coverage_output_file);
  }

  return success;
}

}  // namespace gjstest

int main(int argc, char** argv) {
  google::InitGoogleLogging(argv[0]);
  google::ParseCommandLineFlags(&argc, &argv, true);

  // Run tests.
  return gjstest::Run() ? 0 : 1;
}
