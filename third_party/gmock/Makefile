# Preprocessor flags.
CPPFLAGS += -I../..

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

######################################################
# House-keeping
######################################################

all : gmock_main.a

clean :
	rm -f gmock.a gmock_main.a *.o

######################################################
# gmock configuration
######################################################

GTEST_DIR = ../gtest
GMOCK_DIR = .

# All gtest headers.
GTEST_HEADERS = \
    $(GTEST_DIR)/include/gtest/*.h \
    $(GTEST_DIR)/include/gtest/internal/*.h

# All gmock headers, plus the gtest headers they include.
GMOCK_HEADERS = \
    $(GMOCK_DIR)/include/gmock/*.h \
    $(GMOCK_DIR)/include/gmock/internal/*.h \
    $(GTEST_HEADERS)

# Relevant source files.
GTEST_SRCS_ = $(GTEST_DIR)/src/*.cc $(GTEST_DIR)/src/*.h $(GTEST_HEADERS)
GMOCK_SRCS_ = $(GMOCK_DIR)/src/*.cc $(GMOCK_HEADERS)

gtest-all.o : $(GTEST_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) -I$(GMOCK_DIR) $(CXXFLAGS) \
            -c $(GTEST_DIR)/src/gtest-all.cc

gmock-all.o : $(GMOCK_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) -I$(GMOCK_DIR) $(CXXFLAGS) \
            -c $(GMOCK_DIR)/src/gmock-all.cc

gmock_main.o : $(GMOCK_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) -I$(GMOCK_DIR) $(CXXFLAGS) \
            -c $(GMOCK_DIR)/src/gmock_main.cc

gmock.a : gmock-all.o gtest-all.o
	$(AR) $(ARFLAGS) $@ $^

gmock_main.a : gmock-all.o gtest-all.o gmock_main.o
	$(AR) $(ARFLAGS) $@ $^
