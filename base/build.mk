BASE_PACKAGE = base

######################################################
# Libraries
######################################################

base/callback.o: base/callback.cc base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/callback.cc -o $@

base/stringprintf.o: base/stringprintf.cc base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/stringprintf.cc -o $@

base/timer.o: base/timer.cc base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/timer.cc -o $@


base/base.a: base/callback.o base/stringprintf.o base/timer.o
	rm -f $@
	$(AR) $(ARFLAGS) $@ $^
