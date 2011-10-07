#!/bin/bash
#
# Run gjstest for a test target.
#
# Usage:
#
#     ./js_test_run.sh foo/target
#
# The file foo/target.deps must already exist.

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 TARGET"
  exit 1
fi

TARGET=$1
shift

DEPS_FILE="$TARGET.deps"
OUTPUT_FILE="$TARGET.out"

# Build an appropriate invocation.
JS_FILES=
for js_file in `cat $DEPS_FILE`; do
  # Skip files that are built in to gjstest; otherwise we would, for example,
  # define the gjstest namespace twice.
  if [ `grep "$js_file" gjstest/internal/js/use_global_namespace.deps` ]; then
    continue
  fi

  JS_FILES[${#JS_FILES[@]}]=$js_file
done

JOINED_JS_FILES=$(printf ",%s" "${JS_FILES[@]}")
JOINED_JS_FILES=${JOINED_JS_FILES:1}

set -x
gjstest/internal/cpp/gjstest.bin --data_dir=share/gjstest "--js_files=$JOINED_JS_FILES" || exit 1
set +x

echo "ok" > $OUTPUT_FILE
