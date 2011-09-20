# Path to the directory where v8 was built.
V8_DIR = ../../tmp/v8-read-only

# Preprocessor flags.
#
# TODO(jacobsa): Let autoconf deal with HASH_NAMESPACE
CPPFLAGS += -I. -I$(V8_DIR)/include -DHASH_NAMESPACE=__gnu_cxx

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

# Protocol buffer compiler.
PROTOC = protoc

# Path to the libxml2 includes directory.
LIBXML2_INCLUDES_DIR := /usr/include/libxml2

# All tests, to be filled in by packages.
TESTS =

default: test

######################################################
# gtest and gmock configuration
######################################################

TEST_HEADERS = \
    third_party/gmock/include/gmock/*.h \
    third_party/gmock/include/gmock/internal/*.h \
    third_party/gtest/include/gtest/*.h \
    third_party/gtest/include/gtest/internal/*.h

######################################################
# Packages
######################################################

include base/build.mk
include gjstest/build.mk
include third_party/gmock/build.mk
include webutil/xml/build.mk

######################################################
# House-keeping
######################################################

test : $(TESTS)
	for test in $(TESTS); do $$test; done

clean :
	find . -name '*.a' -delete
	find . -name '*.o' -delete
	find . -name '*.pb.h' -delete
	find . -name '*.pb.cc' -delete
	rm -f $(TESTS)
	rm -f gjstest/internal/compiler/compiler

.PHONY: test clean
