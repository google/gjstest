STRINGS_PACKAGE = strings

######################################################
# Libraries
######################################################

$(STRINGS_PACKAGE)/ascii_ctype.o : $(STRINGS_PACKAGE)/*.h base/*.h $(STRINGS_PACKAGE)/ascii_ctype.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(STRINGS_PACKAGE)/ascii_ctype.cc -o $(STRINGS_PACKAGE)/ascii_ctype.o

$(STRINGS_PACKAGE)/strutil.o : $(STRINGS_PACKAGE)/*.h base/*.h $(STRINGS_PACKAGE)/strutil.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(STRINGS_PACKAGE)/strutil.cc -o $(STRINGS_PACKAGE)/strutil.o
