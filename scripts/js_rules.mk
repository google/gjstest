# Copyright 2011 Google Inc. All Rights Reserved.
# Author: jacobsa@google.com (Aaron Jacobs)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Define a JS library.
#
# Arg 1:
#     Name of the library, including a path. It is assumed that the relevant
#     source file is $(1).js.
#
# Arg 2:
#     Space-separated list of dependencies, also defined with this rule.
#
define js_library

# A file listing the transitive dependencies of this rule, topologically
# sorted. Depend on the makefile to ensure that this file is rebuilt when the
# graph changes. Depend on the .js file to make sure that compilation targets
# are rerun whenever a transitive dependency changes.
$(1).deps : $(2:=.deps) Makefile $(1).js scripts/js_library_make_deps_file.sh
	./scripts/js_library_make_deps_file.sh $(1) $$^

endef

# Define a JS library with a compilation test.
#
# Arg 1:
#     Name of the library, including a path. It is assumed that the relevant
#     source file is $(1).js.
#
# Arg 2:
#     Space-separated list of dependencies, also defined with this rule.
#
define compiled_js_library

$(eval $(call js_library,$(1),$(2)))

# A target that makes sure the Closure compiler is okay with the code and its
# dependencies.
$(1).compile : $(1).deps scripts/js_library_check_compile.sh
	./scripts/js_library_check_compile.sh $(1)

COMPILATION_TESTS += $(1).compile

endef

# Define a JS test.
#
# Arg 1:
#     The name of the library to test, including a path. It is assumed that the
#     relevant test file is $(1)_test.js.
#
define js_test

# Create a library target for the test.
$(eval $(call js_library,$(1)_test,$(1)))

# Create a target for the test itself. Make sure to depend on the
# use_global_namespace deps target, because the shell script tests it for
# duplicates.
$(1)_test.out : $(1)_test.deps scripts/js_test_run.sh gjstest/internal/js/use_global_namespace.deps gjstest/internal/cpp/gjstest.bin share
	./scripts/js_test_run.sh $(1)_test

JS_TESTS += $(1)_test.out

endef
