# Path to the directory where v8 was built.
V8_DIR = ../../tmp/v8-read-only

# Preprocessor flags.
CPPFLAGS += -I. -I$(V8_DIR)/include

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

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

third_party/gmock/gmock_main.a:
	$(MAKE) -C third_party/gmock gmock_main.a

######################################################
# Packages
######################################################

BASE_HDRS = base/*.h

base/callback.o: base/callback.cc $(BASE_HDRS)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/callback.cc -o $@

base/logging.o: base/logging.cc $(BASE_HDRS)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/logging.cc -o $@

base/stringprintf.o: base/stringprintf.cc $(BASE_HDRS)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/stringprintf.cc -o $@

base/base.a: base/callback.o base/logging.o base/stringprintf.o
	$(AR) $(ARFLAGS) $@ $^

include gjstest/internal/driver/cpp/build.mk

######################################################
# House-keeping
######################################################

test : $(TESTS)
	for test in $(TESTS); do $$test; done

clean :
	find . -name '*.a' -delete
	find . -name '*.o' -delete
	rm -f $(TESTS)

.PHONY: test clean
