COMPILER_PACKAGE = gjstest/internal/compiler

######################################################
# Generated code
######################################################

$(COMPILER_PACKAGE)/compiler.pb.h $(COMPILER_PACKAGE)/compiler.pb.cc : $(COMPILER_PACKAGE)/compiler.proto
	protoc --proto_path=. --cpp_out=. gjstest/internal/compiler/compiler.proto

######################################################
# Libraries
######################################################

$(COMPILER_PACKAGE)/compiler.pb.o : $(COMPILER_PACKAGE)/compiler.pb.h $(COMPILER_PACKAGE)/compiler.pb.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(COMPILER_PACKAGE)/compiler.pb.cc -o $(COMPILER_PACKAGE)/compiler.pb.o

######################################################
# Binaries
######################################################

$(COMPILER_PACKAGE)/compiler.o : $(COMPILER_PACKAGE)/compiler.cc $(COMPILER_PACKAGE)/compiler.pb.h base/*.h strings/strutil.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $(COMPILER_PACKAGE)/compiler.cc -o $(COMPILER_PACKAGE)/compiler.o
