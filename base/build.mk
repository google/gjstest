BASE_PACKAGE = base

######################################################
# Libraries
######################################################

base/callback.o: base/callback.cc base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/callback.cc -o $@

base/logging.o: base/logging.cc base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/logging.cc -o $@

base/stringprintf.o: base/stringprintf.cc base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/stringprintf.cc -o $@

base/base.a: base/callback.o base/logging.o base/stringprintf.o
	$(AR) $(ARFLAGS) $@ $^
