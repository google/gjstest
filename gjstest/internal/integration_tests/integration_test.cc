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

#include <stdio.h>
#include <unistd.h>

#include <string>

#include <gflags/gflags.h>
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <re2/re2.h>

#include "base/logging.h"
#include "base/macros.h"
#include "base/stringprintf.h"
#include "file/file_utils.h"
#include "strings/strutil.h"

DEFINE_string(gjstest_binary, "", "Path to the gjstest binary.");
DEFINE_string(test_srcdir, "", "Path to directory containing test files.");

DEFINE_string(data_dir, "",
              "Directory to give to the gjstest binary as its data dir.");

DEFINE_bool(dump_new, false,
            "If true, new golden files will be written out whenever an existing"
            "one doesn't match.");

using testing::HasSubstr;
using testing::Not;

namespace gjstest {

static bool RunShellCommand(
    const string& command,
    int* exit_code,
    string* output) {
  FILE* child_output = popen(command.c_str(), "r");
  if (!child_output) {
    LOG(ERROR) << "Error from popen.";
    return false;
  }

  // Consume output from the child process until its done writing.
  while (1) {
    char buf[1024];
    const ssize_t bytes_read = fread(buf, 1, arraysize(buf), child_output);

    if (ferror(child_output)) {
      LOG(ERROR) << "Error from fread.";
      return false;
    }

    // Append the bytes to the output string.
    *output += string(buf, bytes_read);

    // Are we done reading?
    if (feof(child_output)) {
      break;
    }
  }

  // Wait for the process to exit.
  const int child_status = pclose(child_output);
  PCHECK(child_status >= 0) << "Child status: " << child_status;

  // Make sure it exited normally.
  if (!WIFEXITED(child_status)) {
    CHECK(WIFSIGNALED(child_status));
    LOG(ERROR) << "Child killed with signal " << WTERMSIG(child_status);
    return false;
  }

  *exit_code = WEXITSTATUS(child_status);
  return true;
}

static bool RunTool(
    const string& gjstest_binary,
    const string& data_dir,
    const std::vector<string>& js_files,
    const string& filter,
    bool* success,
    string* output,
    string* xml) {
  // Create a file to write XML into.
  const string xml_file = tmpnam(NULL);
  PCHECK(!xml_file.empty());

  // Create a command to give to the shell.
  const string command =
      StringPrintf(
          "%s"
              " --js_files=\"%s\""
              " --xml_output_file=\"%s\""
              " --data_dir=\"%s\""
              " --filter=\"%s\"",
          gjstest_binary.c_str(),
          JoinStrings(js_files, ",").c_str(),
          xml_file.c_str(),
          data_dir.c_str(),
          filter.c_str());

  // Call the command.
  int exit_code;
  if (!RunShellCommand(command, &exit_code, output)) {
    return false;
  }

  // The test passed iff the exit code was zero.
  *success = (exit_code == 0);

  // Slurp in the XML output.
  *xml = ReadFileOrDie(xml_file);

  return true;
}

static string PathToDataFile(const string& file_name) {
  return FLAGS_test_srcdir + "/" + file_name;
}

class IntegrationTest : public ::testing::Test {
 protected:
  bool RunBundleNamed(const string& name, string test_filter = "") {
    // Get a list of user scripts to load. Special case: the test
    // 'syntax_error' is meant to simulate a syntax error in a dependency.
    std::vector<string> js_files;

    if (name == "syntax_error") {
      js_files.push_back(PathToDataFile("syntax_error.js"));
      js_files.push_back(PathToDataFile("passing_test.js"));
    } else {
      js_files.push_back(PathToDataFile(name + "_test.js"));
    }

    // Run the tool.
    bool success = false;
    CHECK(
        RunTool(
            FLAGS_gjstest_binary,
            FLAGS_data_dir,
            js_files,
            test_filter,
            &success,
            &txt_,
            &xml_))
        << "Could not run the gjstest binary.";

    return success;
  }

  bool CheckGoldenFile(const string& file_name, const string& actual) {
    const string path = PathToDataFile(file_name);
    const string expected = ReadFileOrDie(path);

    // Special case: remove time measurements from actual output so that the
    // golden files don't differ for timing reasons.
    string actual_modified = actual;
    RE2::GlobalReplace(&actual_modified, "time=\"[\\d.]+\"", "time=\"0.01\"");
    RE2::GlobalReplace(&actual_modified, "\\(\\d+ ms\\)", "(1 ms)");

    // Does the golden file match?
    if (expected == actual_modified) return true;

    // Have we been asked to dump new golden files?
    if (FLAGS_dump_new) {
      WriteStringToFileOrDie(actual_modified, path);
    }

    return false;
  }

  string txt_;
  string xml_;
};

TEST_F(IntegrationTest, Passing) {
  EXPECT_TRUE(RunBundleNamed("passing")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("passing.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("passing.golden.xml", xml_));
}

TEST_F(IntegrationTest, Failing) {
  EXPECT_FALSE(RunBundleNamed("failing")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("failing.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("failing.golden.xml", xml_));
}

TEST_F(IntegrationTest, Mocks) {
  EXPECT_FALSE(RunBundleNamed("mocks")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("mocks.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("mocks.golden.xml", xml_));
}

TEST_F(IntegrationTest, SyntaxError) {
  EXPECT_FALSE(RunBundleNamed("syntax_error")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("syntax_error.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("syntax_error.golden.xml", xml_));
}

TEST_F(IntegrationTest, ExceptionDuringTest) {
  EXPECT_FALSE(RunBundleNamed("exception")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("exception.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("exception.golden.xml", xml_));
}

TEST_F(IntegrationTest, TypedArrays) {
  EXPECT_TRUE(RunBundleNamed("typed_arrays")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("typed_arrays.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("typed_arrays.golden.xml", xml_));
}

TEST_F(IntegrationTest, TestRegistration) {
  EXPECT_FALSE(RunBundleNamed("registration")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("registration.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("registration.golden.xml", xml_));
}

TEST_F(IntegrationTest, FilteredFailingTest) {
  // Run only the passing tests.
  ASSERT_TRUE(RunBundleNamed("failing", ".*PassingTest.*")) << txt_;

  EXPECT_THAT(txt_, HasSubstr("[       OK ] FailingTest.PassingTest1"));
  EXPECT_THAT(txt_, Not(HasSubstr("failingTest")));
  EXPECT_THAT(txt_, Not(HasSubstr("FAIL")));
}

TEST_F(IntegrationTest, NoMatchingTests) {
  ASSERT_FALSE(RunBundleNamed("passing", "sfkjgdhgkj")) << txt_;
  EXPECT_THAT(txt_, HasSubstr("No tests found."));
}

}  // namespace gjstest

int main(int argc, char **argv) {
  ::google::ParseCommandLineFlags(&argc, &argv, true);
  ::testing::InitGoogleTest(&argc, argv);

  return RUN_ALL_TESTS();
}
