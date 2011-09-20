MATCHERS_PKG := gjstest/public/matchers

######################################################
# Tests
######################################################

JS_TESTS +=\
    $(MATCHERS_PKG)/array_matchers_test

$(MATCHERS_PKG)/array_matchers_test : $(MATCHERS_PKG)/array_matchers_test.js $(JS_TEST_DEPS) gjstest/internal/driver/cpp/driver
	gjstest/internal/driver/cpp/driver --js_files=`echo "$(JS_TEST_DEPS) $(MATCHERS_PKG)/array_matchers_test.js" | perl -i -pe 's: :,:g'`

$(PKG)/xml_writer_test.o : $(PKG)/xml_writer_test.cc $(PKG)/xml_writer.h $(TEST_HEADERS) base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(PKG)/xml_writer_test.cc -o $(PKG)/xml_writer_test.o

$(PKG)/xml_writer_test : $(PKG)/xml_writer.o $(PKG)/xml_writer_test.o third_party/gmock/gmock_main.a base/base.a third_party/cityhash/cityhash.o
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lxml2 -lglog
