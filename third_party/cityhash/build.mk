CITY_PKG := third_party/cityhash

######################################################
# Libraries
######################################################

$(CITY_PKG)/cityhash.o : $(CITY_PKG)/city.h $(CITY_PKG)/city.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CITY_PKG)/city.cc -o $(CITY_PKG)/cityhash.o

######################################################
# Tests
######################################################

CPP_TESTS +=\
    $(CITY_PKG)/city-test

$(CITY_PKG)/city-test.o : $(CITY_PKG)/city-test.cc $(CITY_PKG)/city.h $(CITY_PKG)/citycrc.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(CITY_PKG)/city-test.cc -o $(CITY_PKG)/city-test.o

$(CITY_PKG)/city-test : $(CITY_PKG)/cityhash.o $(CITY_PKG)/city-test.o
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -lpthread $^ -o $@ -lglog
