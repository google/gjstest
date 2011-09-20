CPP_PKG := gjstest/internal/driver/cpp
COMPILER_PKG := gjstest/internal/compiler

######################################################
# Libraries
######################################################

$(CPP_PKG)/driver.o : $(CPP_PKG)/driver.h $(CPP_PKG)/driver.cc base/*.h $(V8_DIR)/include/*.h $(COMPILER_PKG)/compiler.pb.h $(CPP_PKG)/test_case.h $(CPP_PKG)/v8_utils.h webutil/xml/xml_writer.h util/hash/hash.h third_party/cityhash/*.h strings/strutil.h util/gtl/map-util.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PKG)/driver.cc -o $(CPP_PKG)/driver.o

$(CPP_PKG)/test_case.o : $(CPP_PKG)/test_case.h $(CPP_PKG)/test_case.cc base/*.h $(V8_DIR)/include/*.h $(CPP_PKG)/v8_utils.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PKG)/test_case.cc -o $(CPP_PKG)/test_case.o

$(CPP_PKG)/v8_utils.o : $(CPP_PKG)/v8_utils.h $(CPP_PKG)/v8_utils.cc base/*.h $(V8_DIR)/include/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PKG)/v8_utils.cc -o $(CPP_PKG)/v8_utils.o

######################################################
# Tests
######################################################

CPP_TESTS +=\
    $(CPP_PKG)/v8_utils_test

$(CPP_PKG)/v8_utils_test.o : $(CPP_PKG)/v8_utils_test.cc $(CPP_PKG)/v8_utils.h $(TEST_HEADERS) base/*.h $(V8_DIR)/include/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PKG)/v8_utils_test.cc -o $(CPP_PKG)/v8_utils_test.o

$(CPP_PKG)/v8_utils_test : $(CPP_PKG)/v8_utils.o $(CPP_PKG)/v8_utils_test.o third_party/gmock/gmock_main.a base/base.a $(V8_DIR)/libv8.a
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lglog

######################################################
# Binaries
######################################################

$(CPP_PKG)/driver_main.o : $(CPP_PKG)/driver_main.cc $(CPP_PKG)/driver.h base/*.h file/file_utils.h gjstest/internal/compiler/compiler.pb.h strings/strutil.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CPP_PKG)/driver_main.cc -o $(CPP_PKG)/driver_main.o

$(CPP_PKG)/driver : $(CPP_PKG)/v8_utils.o $(CPP_PKG)/driver_main.o $(CPP_PKG)/driver.o base/base.a file/file_utils.o gjstest/internal/compiler/compiler.pb.o third_party/cityhash/cityhash.o $(CPP_PKG)/test_case.o strings/strutil.o webutil/xml/xml_writer.o strings/ascii_ctype.o
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lglog -lv8 -lgflags -lprotobuf -lre2 -lxml2
