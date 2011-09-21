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

#include <string>

#include <gflags/gflags.h>
#include <re2/re2.h>

#include "base/logging.h"
#include "file/file_utils.h"
#include "gjstest/internal/cpp/run_tests.h"
#include "gjstest/internal/proto/named_scripts.pb.h"
#include "third_party/gmock/include/gmock/gmock.h"
#include "third_party/gtest/include/gtest/gtest.h"

DEFINE_string(test_srcdir, "", "Path to directory containing test files.");

DEFINE_bool(dump_new, false,
            "If true, new golden files will be written out whenever an existing"
            "one doesn't match. In order for this to work, you must run the"
            "test locally. If you use g4, you must g4 edit the files first.");

using testing::HasSubstr;
using testing::Not;

namespace gjstest {

static string PathToDataFile(const string& file_name) {
  return FLAGS_test_srcdir + "/" + file_name;
}

class IntegrationTest : public ::testing::Test {
 protected:
  bool RunBundleNamed(const string& name, string test_filter = "") {
    const string path = PathToDataFile(name + "_test.js");
    const string js = ReadFileOrDie(path);

    NamedScripts scripts;
    NamedScript* script = scripts.add_script();
    script->set_name(path);
    script->set_source(js);

    return RunTests(scripts, test_filter, &txt_, &xml_);
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

TEST_F(IntegrationTest, TestCaseCalledConstructor) {
  EXPECT_FALSE(RunBundleNamed("constructor")) << txt_;
  EXPECT_TRUE(CheckGoldenFile("constructor.golden.txt", txt_));
  EXPECT_TRUE(CheckGoldenFile("constructor.golden.xml", xml_));
}

TEST_F(IntegrationTest, FilteredFailingTest) {
  // Run only the passing tests.
  ASSERT_TRUE(RunBundleNamed("failing", ".*passingTest.*")) << txt_;

  EXPECT_THAT(txt_, HasSubstr("[       OK ] FailingTest.passingTest1"));
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
