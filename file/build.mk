FILE_PACKAGE = gjstest/internal/driver/cpp

######################################################
# Libraries
######################################################

$(FILE_PACKAGE)/file_utils.o : $(FILE_PACKAGE)/file_utils.h $(FILE_PACKAGE)/file_utils.cc base/*.h
