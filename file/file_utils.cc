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

#include "file/file_utils.h"

#include <dirent.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <string>
#include <vector>

#include "base/integral_types.h"
#include "base/logging.h"
#include "base/macros.h"

string ReadFileOrDie(const string& path) {
  FILE* file = fopen(path.c_str(), "r");
  PCHECK(file) << ": opening " << path;

  string result;
  size_t bytes_read;
  char buf[1 << 10];
  while ((bytes_read = fread(buf, 1, arraysize(buf), file))) {
    result += string(buf, bytes_read);
  }

  // Make sure we stopped because of EOF, not an error.
  CHECK_EQ(ferror(file), 0) << "Error reading file: " << path;
  CHECK_NE(feof(file), 0) << "Expected eof.";

  CHECK_ERR(fclose(file));
  return result;
}

void WriteStringToFileOrDie(const string& s, const string& path) {
  FILE* file = fopen(path.c_str(), "w");
  PCHECK(file) << ": opening " << path;

  const uint32 size = s.size();
  uint32 total_bytes_written = 0;

  while (total_bytes_written < size) {
    const char* base = s.data() + total_bytes_written;
    const uint32 bytes_written =
        fwrite(base, 1, size - total_bytes_written, file);

    if (!bytes_written) {
      CHECK_EQ(ferror(file), 0) << "Error writing file: " << path;
      CHECK_NE(feof(file), 0) << "Expected eof.";
      break;
    }

    total_bytes_written += bytes_written;
  }

  CHECK_ERR(fclose(file));
}

string Basename(const string& path) {
  const char* c_str = path.c_str();
  const char* sep = strrchr(c_str, '/');
  return sep ? sep + 1 : c_str;
}

void FindFiles(const string& directory, vector<string>* files) {
  DIR* dir = opendir(directory.c_str());
  CHECK(dir) << "Couldn't open directory: " << directory;

  while (1) {
    struct dirent dir_struct;
    struct dirent* result;
    CHECK_EQ(readdir_r(dir, &dir_struct, &result), 0)
        << "Error reading directory: " << directory;

    // Are we done?
    if (!result) break;

    const string name = dir_struct.d_name;
    const string path = directory + "/" + name;

    struct stat stat_buf;
    CHECK_EQ(stat(path.c_str(), &stat_buf), 0) << "Couldn't stat: " << path;

    // Avoid recursing forever.
    if (name == "." || name == "..") continue;

    // If this is a directory, recurse.
    const mode_t mode = stat_buf.st_mode;
    if (S_ISDIR(mode)) {
      FindFiles(path, files);
      continue;
    }

    // If this is a regular file, add it.
    if (S_ISREG(mode)) {
      files->push_back(path);
      continue;
    }
  }

  PCHECK(closedir(dir) == 0);
}
