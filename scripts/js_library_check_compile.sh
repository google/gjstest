#!/bin/bash
#
# Make sure that the closure compiler is happy with a target.
#
# Usage:
#
#     ./js_library_check_compile.sh foo/target
#
# The file foo/target.deps must already exist.

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 TARGET"
  exit 1
fi

TARGET=$1
shift

DEPS_FILE="$TARGET.deps"
OUTPUT_FILE="$TARGET.compile"

# Build an appropriate invocation.
CLOSURE_ARGS=(\
    "--warning_level=VERBOSE" \
    "--jscomp_error=checkTypes" \
    "--jscomp_error=invalidCasts" \
    "--jscomp_error=missingProperties" \
    "--jscomp_off=internetExplorerChecks" \
    "--compilation_level=WHITESPACE_ONLY" \
)

for js_file in `cat $DEPS_FILE`; do
  CLOSURE_ARGS[${#CLOSURE_ARGS[@]}]="--js=$js_file"
done
set -x

# Run closure.
closure-compiler "${CLOSURE_ARGS[@]}" --js_output_file=$OUTPUT_FILE ||
    (rm -f $OUTPUT_FILE; exit 1)
