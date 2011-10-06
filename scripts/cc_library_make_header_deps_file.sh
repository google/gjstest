#!/bin/bash
#
# Create a .header_deps file for a C++ target, for use with dependency analysis
# magic in the makefile.
#
# Usage:
#
#     ./cc_library_make_header_deps_file.sh \
#         foo/target \
#         bar.header_deps \
#         baz/qux.header_deps \
#         <Ignored junk>
#
# <Ignored junk> is there to allow the makefile to declare dependencies on other
# files. Anything that doesn't end in .header_deps will be ignored by this
# script.

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 TARGET DEPS ..."
  exit 1
fi

TARGET=$1
shift

OUTPUT_FILE="$TARGET.header_deps"

# Delete the existing file.
rm -f $OUTPUT_FILE

# Append the contents of each dependency's .deps file.
while [[ $1 ]]
do
  FILE=$1
  shift

  # Skip other files.
  if [[ $FILE =~ '.header_deps' ]]; then
    cat $FILE >> $OUTPUT_FILE || exit 1
  fi
done

# Add the library's .h file to the end of the list.
echo "$TARGET.h" >> $OUTPUT_FILE || exit 1

# Remove duplicate lines, preserving order.
mv $OUTPUT_FILE $OUTPUT_FILE.tmp || exit 1
awk '!x[$0]++' $OUTPUT_FILE.tmp > $OUTPUT_FILE || exit 1
rm $OUTPUT_FILE.tmp || exit 1
