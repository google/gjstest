#!/bin/bash
#
# Build a C++ binary.
#
# Usage:
#
#     ./cc_binary_build.sh foo/target <extra g++ flags>
#
# The file foo/object_deps must already exist.

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 TARGET <extra g++ flags>"
  exit 1
fi

TARGET=$1
shift

OBJECT_DEPS_FILE="$TARGET.object_deps"
OUTPUT_FILE="$TARGET.bin"

# Build an appropriate invocation.
GCC_ARGS=()

for object_file in `cat $OBJECT_DEPS_FILE`; do
  GCC_ARGS[${#GCC_ARGS[@]}]="$object_file"
done

while [[ $1 ]]
do
  GCC_ARGS[${#GCC_ARGS[@]}]="$1"
  shift
done

# Run g++.
set -x
g++ "${GCC_ARGS[@]}" -o $OUTPUT_FILE ||
    (rm -f $OUTPUT_FILE; exit 1)
