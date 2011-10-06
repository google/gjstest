#!/bin/bash
#
# Based on a deps file, generate C++ code exporting an array of entries in the
# file.
#
# The input deps file should look like this:
#
#     gjstest/foo/bar.js
#     gjstest/baz.js
#

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <deps file> <output .h file>"
  exit 1
fi

DEPS_FILE=$1
H_FILE=$2

rm -f $H_FILE $CC_FILE || exit 1
touch $H_FILE $CC_FILE || exit 1

# Write out top matter.
echo "#ifndef BUILTIN_PATHS_H_" >> $H_FILE
echo "#define BUILTIN_PATHS_H_" >> $H_FILE
echo "" >> $H_FILE
echo "namespace gjstest {" >> $H_FILE
echo "const char* kBuiltinPaths[] = {" >> $H_FILE

# Iterate over each entry in the deps file.
for js_file in `cat $DEPS_FILE`; do
  # Make sure the file starts with gjstest/.
  if [[ ${js_file:0:8} != "gjstest/" ]]; then
    echo "Unsupported entry: " $js_file
    exit 1
  fi

  # Strip off the gjstest/ prefix.
  STRIPPED_FILE=${js_file:8}

  # Write the line of code.
  echo "    \"$STRIPPED_FILE\"," >> $H_FILE
done

# Write out botton matter for the .cc file.
echo "};" >> $H_FILE
echo "" >> $H_FILE
echo "}  // namespace gjstest" >> $H_FILE
echo "" >> $H_FILE
echo "#endif  // BUILTIN_PATHS_H_" >> $H_FILE
