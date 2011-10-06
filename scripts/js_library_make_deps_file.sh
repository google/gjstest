#!/bin/bash
#
# Create a .deps file for a JS target, for use with dependency analysis magic in
# the makefile.
#
# Usage:
#
#     ./js_library_make_deps_file.sh \
#         foo/target \
#         bar.deps \
#         baz/qux.deps \
#         <Ignored junk>
#
# <Ignored junk> is there to allow the makefile to declare dependencies on other
# files. Anything that doesn't end in .deps will be ignored by this script.

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 TARGET DEPS ..."
  exit 1
fi

TARGET=$1
shift

OUTPUT_FILE="$TARGET.deps"

# Delete the existing file.
rm -f $OUTPUT_FILE

# Append the contents of each dependency's .deps file.
while [[ $1 ]]
do
  FILE=$1
  shift

  # Skip other files.
  if [[ $FILE =~ '.deps' ]]; then
    cat $FILE >> $OUTPUT_FILE || exit 1
  fi
done

# Add the library's .js file to the end of the list.
echo "$TARGET.js" >> $OUTPUT_FILE || exit 1

# Remove duplicate lines, preserving order.
mv $OUTPUT_FILE $OUTPUT_FILE.tmp || exit 1
awk '!x[$0]++' $OUTPUT_FILE.tmp > $OUTPUT_FILE || exit 1
rm $OUTPUT_FILE.tmp || exit 1
