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

# Create a transitive header deps file for a C++ target.
#
# Arg 1:
#     Name of the library, including a path.
#
# Arg 2:
#     Space-separated list of dependencies, processed with a compatible rule.
#
# Arg 3:
#     Header file for the library, if any. This must be $(1).h if it is
#     non-empty.
#
define cc_header_deps

# A file listing the transitive header dependencies of this rule, topologically
# sorted. Depend on the makefile to ensure that this file is rebuilt when the
# graph changes. Depend on this library's header file to make sure that its
# dependents are rebuilt whenever the header is changed.
$(1).header_deps : $(2:=.header_deps) Makefile $(3) scripts/cc_library_make_header_deps_file.sh
	./scripts/cc_library_make_header_deps_file.sh $(1) $$^

endef

# Create a transitive object deps file for a C++ target.
#
# Arg 1:
#     Name of the library, including a path.
#
# Arg 2:
#     Space-separated list of dependencies, processed with a compatible rule.
#
# Arg 3:
#     The source file for this library, if any.
#
define cc_object_deps

# A file listing the transitive object dependencies of this rule, topologically
# sorted. Depend on the makefile to ensure that this file is rebuilt when the
# graph changes. Depend on the .o file in order to make any binaries built
# with this library to be rebuilt when its source file changes, and that
# they're not built before the object file is.
#
# TODO(jacobsa): This also implies that any dependent libraries will be rebuilt
# when this one's .cc file changes, which isn't strictly necessary. Can we do
# better?
$(1).object_deps : $(2:=.object_deps) Makefile $(3:.cc=.o) scripts/cc_library_make_object_deps_file.sh
	./scripts/cc_library_make_object_deps_file.sh $(1) $$^

endef

# Define a C++ library.
#
# Arg 1:
#     Name of the library, including a path. It is assumed that the relevant
#     source file is $(1).cc. The library is allowed to pull in $(1).h as a
#     header.
#
# Arg 2:
#     Space-separated list of dependencies, also defined with this rule or a
#     compatible one. The library is allowed to pull in (name).h for each of
#     these dependencies.
#
define cc_library
$(eval $(call cc_header_deps,$(1),$(2),$(1).h))
$(eval $(call cc_object_deps,$(1),$(2),$(1).cc))

# Make this library's object target depend on its transitive header
# dependencies, so that it's rebuilt if they change.
$(1).o : $(1).header_deps

endef

# Define a C++ library with no source file.
#
# Arg 1:
#     Name of the library, including a path. It is assumed that the relevant
#     header file is $(1).h.
#
# Arg 2:
#     Space-separated list of dependencies, also defined with this rule. The
#     library is allowed to pull in (name).h for each of these dependencies.
#
define hdr_only_cc_library
$(eval $(call cc_header_deps,$(1),$(2),$(1).h))
$(eval $(call cc_object_deps,$(1),$(2),))
endef

# Define a C++ binary.
#
# Arg 1:
#     Name of the binary, including a path. It is assumed that the relevant
#     source file is $(1).cc, and that there is no header files.
#
# Arg 2:
#     Space-separated list of dependencies, also defined with this rule. The
#     binary is allowed to pull in (name).h for each of these dependencies.
#
# Arg 3:
#     Extra flags for g++, if any.
#
CC_BINARIES =

define cc_binary

# Create deps files for this rule.
$(eval $(call cc_header_deps,$(1),$(2),))
$(eval $(call cc_object_deps,$(1),$(2),$(1).cc))

# Create a rule for building the binary. Make sure it's rebuilt when any of the
# transitive dependencies change.
#
# HACK: Make sure the gmock libraries are built before any other cc_binary, for
# the sake of test binaries.
$(1).bin : $(1).object_deps $(1).header_deps scripts/cc_binary_build.sh
	$(MAKE) -C third_party/gmock/make gmock.a gmock_main.a
	./scripts/cc_binary_build.sh $(1) $(3) -lglog -lv8 $(CXXFLAGS) $(CPPFLAGS) $(LDFLAGS)

CC_BINARIES += $(1).bin

endef

# Define a C++ test.
#
# Arg 1:
#     Name of the test, including a path. It is assumed that the relevant
#     source file is $(1).cc, and that there is no header files.
#
# Arg 2:
#     Space-separated list of dependencies, also defined with this rule. The
#     test is allowed to pull in (name).h for each of these dependencies.
#
# Arg 3:
#     Extra flags for g++, if any.
#
CC_TESTS =

define cc_test

# Create a binary for the test.
$(eval $(call cc_binary,$(1),$(2),./third_party/gmock/make/gmock_main.a $(3)))

# Create a rule that will run the test and write out a file if it passed.
$(1).out : $(1).bin scripts/cc_test_run.sh
	./scripts/cc_test_run.sh $(1)

CC_TESTS += $(1).out

endef
