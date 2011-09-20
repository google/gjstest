PKG := webutil/xml

######################################################
# Libraries
######################################################

$(PKG)/xml_writer.o : $(PKG)/xml_writer.h $(PKG)/xml_writer.cc base/*.h util/hash/hash.h third_party/cityhash/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(PKG)/xml_writer.cc -o $(PKG)/xml_writer.o -I$(LIBXML2_INCLUDES_DIR)

######################################################
# Tests
######################################################

CPP_TESTS +=\
    $(PKG)/xml_writer_test

$(PKG)/xml_writer_test.o : $(PKG)/xml_writer_test.cc $(PKG)/xml_writer.h $(TEST_HEADERS) base/*.h

$(PKG)/xml_writer_test.bin : $(PKG)/xml_writer.o $(PKG)/xml_writer_test.o third_party/gmock/gmock_main.a base/base.a third_party/cityhash/cityhash.o
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lxml2 -lglog

$(PKG)/xml_writer_test : $(PKG)/xml_writer_test.bin
	$(PKG)/xml_writer_test.bin
