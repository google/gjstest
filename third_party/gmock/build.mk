GMOCK_PACKAGE = third_party/gmock
GTEST_DIR = third_party/gtest
GMOCK_DIR = third_party/gmock

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

$(GMOCK_PACKAGE)/gtest-all.o : $(GTEST_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) -I$(GMOCK_DIR) $(CXXFLAGS) \
            -c $(GTEST_DIR)/src/gtest-all.cc -o $@

$(GMOCK_PACKAGE)/gmock-all.o : $(GMOCK_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) -I$(GMOCK_DIR) $(CXXFLAGS) \
            -c $(GMOCK_DIR)/src/gmock-all.cc -o $@

$(GMOCK_PACKAGE)/gmock_main.o : $(GMOCK_SRCS_)
	$(CXX) $(CPPFLAGS) -I$(GTEST_DIR) -I$(GMOCK_DIR) $(CXXFLAGS) \
            -c $(GMOCK_DIR)/src/gmock_main.cc -o $@

$(GMOCK_PACKAGE)/gmock.a : $(GMOCK_PACKAGE)/gmock-all.o $(GMOCK_PACKAGE)/gtest-all.o
	$(AR) $(ARFLAGS) $@ $^

$(GMOCK_PACKAGE)/gmock_main.a : $(GMOCK_PACKAGE)/gmock-all.o $(GMOCK_PACKAGE)/gtest-all.o $(GMOCK_PACKAGE)/gmock_main.o
	$(AR) $(ARFLAGS) $@ $^
