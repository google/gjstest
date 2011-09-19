CPP_PACKAGE = gjstest/internal/driver/cpp

######################################################
# Libraries
######################################################

$(CPP_PACKAGE)/v8_utils.o : $(CPP_PACKAGE)/v8_utils.h $(CPP_PACKAGE)/v8_utils.cc base/*.h $(V8_DIR)/include/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PACKAGE)/v8_utils.cc -o $(CPP_PACKAGE)/v8_utils.o

######################################################
# Tests
######################################################

TESTS +=\
    $(CPP_PACKAGE)/v8_utils_test

$(CPP_PACKAGE)/v8_utils_test.o : $(CPP_PACKAGE)/v8_utils_test.cc $(CPP_PACKAGE)/v8_utils.h $(TEST_HEADERS) base/*.h $(V8_DIR)/include/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PACKAGE)/v8_utils_test.cc -o $(CPP_PACKAGE)/v8_utils_test.o

$(CPP_PACKAGE)/v8_utils_test : $(CPP_PACKAGE)/v8_utils.o $(CPP_PACKAGE)/v8_utils_test.o third_party/gmock/gmock_main.a base/base.a $(V8_DIR)/libv8.a
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lglog
