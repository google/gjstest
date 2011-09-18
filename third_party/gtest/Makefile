# Preprocessor flags.
CPPFLAGS += -I../..

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

######################################################
# House-keeping
######################################################

all : gtest_main.a

clean :
	rm -f $(TESTS) gtest.a gtest_main.a *.o

######################################################
# GTest configuration
######################################################

# Root of gtest, relative to this file.
GTEST_DIR = .

# All gtest headers.
GTEST_HEADERS = \
    $(GTEST_DIR)/include/gtest/*.h \
    $(GTEST_DIR)/include/gtest/internal/*.h

# All gtest sources and headers, used as dependencies.
GTEST_SRCS_ = $(GTEST_DIR)/src/*.cc $(GTEST_DIR)/src/*.h $(GTEST_HEADERS)

gtest-all.o : $(GTEST_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) $(CXXFLAGS) -c \
            $(GTEST_DIR)/src/gtest-all.cc

gtest_main.o : $(GTEST_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) $(CXXFLAGS) -c \
            $(GTEST_DIR)/src/gtest_main.cc

gtest.a : gtest-all.o
	$(AR) $(ARFLAGS) $@ $^

gtest_main.a : gtest-all.o gtest_main.o
	$(AR) $(ARFLAGS) $@ $^
