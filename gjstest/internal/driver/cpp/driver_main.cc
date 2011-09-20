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

// A driver for Google JS Test test. Looks for a file named
// "*-gjstest-scripts.binarypb" in the directory identified by TEST_SRCDIR, and
// runs its scripts and then any tests that its scripts registered.
//
// TODO(jacobsa): These should probably be changed into flags that the user
// gives explicitly. Maybe this should be combined with the compiler tool too.

#include <string>
#include <vector>

#include "base/commandlineflags.h"
#include "base/integral_types.h"
#include "base/logging.h"
#include "file/file_utils.h"
#include "gjstest/internal/compiler/compiler.pb.h"
#include "gjstest/internal/driver/cpp/driver.h"
#include "strings/util.h"

DEFINE_string(filter, "", "Regular expression for test names to run.");

using maps_api::FindFiles;
using maps_api::ReadFileOrDie;
using maps_api::WriteStringToFileOrDie;

namespace gjstest {

// Look for a file with the given suffix in the supplied directory, crashing if
// there is not exactly one such file. Return the path to the single file.
static string FindSingleFileWithSuffix(
    const string& directory,
    const string& suffix) {
  vector<string> files;
  FindFiles(directory, &files);

  string result;
  for (uint32 i = 0; i < files.size(); ++i) {
    const string& path = files[i];
    if (HasSuffixString(path, suffix)) {
      QCHECK(result.empty())
          << "Duplicate match for suffix: " << suffix << "\n"
          << "1st match: " << result << "\n"
          << "2nd match: " << path << "\n";

      result = path;
    }
  }

  QCHECK(!result.empty()) << "Couldn't find file with suffix: " << suffix;

  return result;
}

static bool Run() {
  // Find the file containing the scripts to be run, and load its contents.
  const string scripts_path =
      FindSingleFileWithSuffix(
          StringFromEnv("TEST_SRCDIR", ""),
          "-gjstest-scripts.binarypb");

  NamedScripts scripts;
  QCHECK(scripts.ParseFromString(ReadFileOrDie(scripts_path)))
      << "Couldn't parse NamedScripts proto.";

  // Run the tests.
  string output;
  string xml;
  const bool success = RunTests(scripts, FLAGS_filter, &output, &xml);

  // Log the output.
  LOG(ERROR) << output;

  // Write out the XML file to the appropriate place.
  const string xml_path = StringFromEnv("XML_OUTPUT_FILE", "");
  WriteStringToFileOrDie(xml, xml_path);

  return success;
}

}  // namespace gjstest

int main(int argc, char** argv) {
  // TODO(jacobsa): Initialize flags and logging.

  // Turn off timestamp and file number junk in the output of LOG().
  FLAGS_log_prefix = false;

  return gjstest::Run() ? 0 : 1;
}
