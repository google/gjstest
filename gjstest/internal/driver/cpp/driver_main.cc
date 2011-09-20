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

// A driver for Google JS Test. Executes each JS file it's given, in order,
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
// (The relative order of bar.js and baz.js does not matter in this example.

#include <string>
#include <vector>

#include <gflags/gflags.h>

#include "base/integral_types.h"
#include "base/logging.h"
#include "file/file_utils.h"
#include "gjstest/internal/compiler/compiler.pb.h"
#include "gjstest/internal/driver/cpp/driver.h"
#include "strings/strutil.h"

DEFINE_string(js_files, "",
              "The list of JS files to execute, comma separated.");

DEFINE_string(xml_output_file, "", "An XML file to write results to.");
DEFINE_string(filter, "", "Regular expression for test names to run.");

namespace gjstest {

static bool Run() {
  // Find the file containing the scripts to be run, and load its contents.
  const string scripts_path =
      FindSingleFileWithSuffix(
          google::StringFromEnv("TEST_SRCDIR", ""),
          "-gjstest-scripts.binarypb");

  NamedScripts scripts;
  CHECK(scripts.ParseFromString(ReadFileOrDie(scripts_path)))
      << "Couldn't parse NamedScripts proto.";

  // Run the tests.
  string output;
  string xml;
  const bool success = RunTests(scripts, FLAGS_filter, &output, &xml);

  // Log the output.
  LOG(ERROR) << output;

  // Write out the XML file to the appropriate place.
  const string xml_path = google::StringFromEnv("XML_OUTPUT_FILE", "");
  WriteStringToFileOrDie(xml, xml_path);

  return success;
}

}  // namespace gjstest

int main(int argc, char** argv) {
  google::InitGoogleLogging(argv[0]);
  google::ParseCommandLineFlags(&argc, &argv, true);

  // Turn off timestamp and file number junk in the output of LOG().
  FLAGS_log_prefix = false;

  return gjstest::Run() ? 0 : 1;
}
