#!/bin/bash
#
# Echo generated code that should be included in builtin_data.cc to get the
# topological sort of the built-in scripts correct.
#
# The input deps file should look like this:
#
#     gjstest/foo/bar.js
#     gjstest/baz.js
#

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <deps file>"
  exit 1
fi

DEPS_FILE=$1

# Iterate over each entry in the deps file.
for js_file in `cat $DEPS_FILE`; do
  # Make sure the file starts with gjstest/.
  if [[ ${js_file:0:8} != "gjstest/" ]]; then
    echo "Unsupported entry: " $js_file
    exit 1
  fi

  # Strip off the gjstest/ prefix.
  STRIPPED_FILE=${js_file:8}

  # Echo the line of code.
  echo "paths->push_back(GetPath(\"$STRIPPED_FILE\"));"
done
