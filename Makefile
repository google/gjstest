# Path to the directory where v8 was built.
V8_DIR = ../../tmp/v8-read-only

# Preprocessor flags.
CPPFLAGS += -I. -I$(V8_DIR)/include

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

######################################################
# House-keeping
######################################################

# All tests.
TESTS =\
    gjstest/internal/driver/cpp/v8_utils_test

# TODO(jacobsa): Update this.
all : $(TESTS)

clean :
	find . -name '*.o' -delete
	rm -f $(TESTS)

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
# Libraries
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

gjstest/internal/driver/cpp/v8_utils.o : gjstest/internal/driver/cpp/v8_utils.h gjstest/internal/driver/cpp/v8_utils.cc base/*.h $(V8_DIR)/include/*.h $(BASE_HDRS)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c gjstest/internal/driver/cpp/v8_utils.cc -o gjstest/internal/driver/cpp/v8_utils.o

######################################################
# Tests
######################################################

gjstest/internal/driver/cpp/v8_utils_test.o : gjstest/internal/driver/cpp/v8_utils_test.cc gjstest/internal/driver/cpp/v8_utils.h $(TEST_HEADERS) $(BASE_HDRS)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c gjstest/internal/driver/cpp/v8_utils_test.cc -o gjstest/internal/driver/cpp/v8_utils_test.o

gjstest/internal/driver/cpp/v8_utils_test : gjstest/internal/driver/cpp/v8_utils.o gjstest/internal/driver/cpp/v8_utils_test.o third_party/gmock/gmock_main.a base/base.a
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@
