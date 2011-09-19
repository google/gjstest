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

// A tool that writes the JS files given to it into an appropriate binary
// NamedScript proto, for use by the C++ test driver.
//
// TODO(jacobsa): This tool should also handle generating HTML appropriate for
// the browser driver.

#include <string.h>
#include <string>
#include <vector>

#include <gflags/gflags.h>

#include "base/integral_types.h"
#include "base/logging.h"
#include "base/stringprintf.h"
#include "file/file_utils.h"
#include "gjstest/internal/compiler/compiler.pb.h"
#include "strings/strutil.h"

DEFINE_string(js, "", "Give this flag once per JS file, topologically sorted.");
DEFINE_string(binarypb_file, "", "Path to the .binarypb output file.");

using gjstest::NamedScript;
using gjstest::NamedScripts;

int main(int argc, char** argv) {
  // Build a list of files to include, in the correct order. This tool should be
  // invoked with a command like this:
  //
  //     path/to/compiler
  //         '--js=testing/gjstest/internal/namespace.js'
  //         '--js=testing/gjstest/public/matcher_context.js'
  //         ...
  //
  // The C++ flags package doesn't support repeated flags, so we iterate through
  // the arguments here before calling the flags package.
  std::vector<std::string> script_paths;
  for (uint32 i = 1; i < static_cast<uint32>(argc); ++i) {
    const std::string arg = argv[i];
    if (HasPrefixString(arg, "--js=")) {
      script_paths.push_back(StripPrefixString(arg, "--js="));
    }
  }

  // Now initialize flag stuff.
  google::ParseCommandLineFlags(&argc, &argv, true);

  // Grab each script.
  NamedScripts result;
  for (uint32 i = 0; i < script_paths.size(); ++i) {
    const std::string& path = script_paths[i];

    NamedScript* script = result.add_script();
    script->set_name(Basename(path));
    script->set_source(ReadFileOrDie(path));
  }

  // Write the .binarypb output file.
  WriteStringToFileOrDie(result.SerializeAsString(), FLAGS_binarypb_file);

  return 0;
}
