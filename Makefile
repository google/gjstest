# Path to the directory where v8 was built.
V8_DIR = ../../tmp/v8-read-only

# Preprocessor flags.
CPPFLAGS += -I. -I$(V8_DIR)/include

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

# Protocol buffer compiler.
PROTOC = protoc

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

.PHONY: test clean
