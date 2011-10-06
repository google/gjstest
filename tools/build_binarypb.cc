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

// A tool that builds a binary NamedScripts proto buffer file containing a set
// of JS files, for use in building data files for installation.

#include <gflags/gflags.h>
#include <glog/logging.h>

#include "base/stl_decl.h"
#include "file/file_utils.h"
#include "gjstest/internal/proto/named_scripts.pb.h"
#include "strings/strutil.h"

DEFINE_string(deps_file, "",
              "Path to a file containing a list of JS file paths, "
              "one per line.");

DEFINE_string(output_file, "", "Where to write the binary proto buffer.");

int main(int argc, char** argv) {
  google::InitGoogleLogging(argv[0]);
  google::ParseCommandLineFlags(&argc, &argv, true);

  // Read in the deps file.
  const string deps_file_contents = ReadFileOrDie(FLAGS_deps_file);

  // Split its contents on new-lines to get a list of scripts.
  vector<string> script_paths;
  SplitStringUsing(deps_file_contents, "\n", &script_paths);

  // Create a NamedScripts proto.
  gjstest::NamedScripts scripts;

  for (uint32 i = 0; i < script_paths.size(); ++i) {
    const string& path = script_paths[i];

    gjstest::NamedScript* script = scripts.add_script();
    script->set_name(path);
    script->set_source(ReadFileOrDie(path));
  }

  // Write out the proto.
  WriteStringToFileOrDie(scripts.SerializeAsString(), FLAGS_output_file);

  return 0;
}
