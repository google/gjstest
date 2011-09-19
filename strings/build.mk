STRINGS_PACKAGE = gjstest/internal/driver/cpp

######################################################
# Libraries
######################################################

$(STRINGS_PACKAGE)/strutil.o : $(STRINGS_PACKAGE)/strutil.h $(STRINGS_PACKAGE)/strutil.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(STRINGS_PACKAGE)/strutil.cc -o $(STRINGS_PACKAGE)/strutil.o
