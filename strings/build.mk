STRINGS_PACKAGE = strings

######################################################
# Libraries
######################################################

$(STRINGS_PACKAGE)/ascii_ctype.o : $(STRINGS_PACKAGE)/ascii_ctype.cc $(STRINGS_PACKAGE)/*.h base/*.h

$(STRINGS_PACKAGE)/strutil.o : $(STRINGS_PACKAGE)/strutil.cc $(STRINGS_PACKAGE)/*.h base/*.h
