PACKAGE = gjstest/internal/driver/cpp

######################################################
# Libraries
######################################################

$(PACKAGE)/v8_utils.o : $(PACKAGE)/v8_utils.h $(PACKAGE)/v8_utils.cc base/*.h $(V8_DIR)/include/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(PACKAGE)/v8_utils.cc -o $(PACKAGE)/v8_utils.o

######################################################
# Tests
######################################################

TESTS +=\
    $(PACKAGE)/v8_utils_test

$(PACKAGE)/v8_utils_test.o : $(PACKAGE)/v8_utils_test.cc $(PACKAGE)/v8_utils.h $(TEST_HEADERS) base/*.h $(V8_DIR)/include/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(PACKAGE)/v8_utils_test.cc -o $(PACKAGE)/v8_utils_test.o

$(PACKAGE)/v8_utils_test : $(PACKAGE)/v8_utils.o $(PACKAGE)/v8_utils_test.o third_party/gmock/gmock_main.a base/base.a $(V8_DIR)/libv8.a
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@
