PKG := third_party/cityhash

######################################################
# Libraries
######################################################

$(PKG)/cityhash.o : $(PKG)/city.h $(PKG)/city.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(PKG)/city.cc -o $(PKG)/city.o

######################################################
# Tests
######################################################

TESTS +=\
    $(PKG)/city-test

$(PKG)/city-test.o : $(PKG)/city-test.cc $(PKG)/city.h $(PKG)/citycrc.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(PKG)/city-test.cc -o $(PKG)/city-test.o

$(PKG)/city-test : $(PKG)/cityhash.o $(PKG)/city-test.o
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lglog
