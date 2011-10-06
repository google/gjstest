#!/bin/bash
#
# Run a C++ test.
#
# Usage:
#
#     ./cc_test_run.sh foo/target <test args>
#
# The file foo/target.bin must already exist.

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 TARGET"
  exit 1
fi

TARGET=$1
OUTPUT_FILE="$TARGET.out"
shift

rm -f $OUTPUT_FILE

set -x
./$TARGET.bin $@ || exit 1
set +x

echo "ok" > $OUTPUT_FILE
