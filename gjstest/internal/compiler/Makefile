PROJECT_ROOT = ../../..
default: compiler.pb.a

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

######################################################
# Libraries
######################################################

# Objects to include in the library.
LIB_OBJS = compiler.pb.o

compiler.pb.a : $(LIB_OBJS)
	rm -f $@
	$(AR) $(ARFLAGS) $@ $^

compiler.pb.h compiler.pb.cc : compiler.proto
	cd $(PROJECT_ROOT) && protoc --proto_path=. --cpp_out=. gjstest/internal/compiler/compiler.proto

######################################################
# Tests
######################################################

# Additional objects to include in the test.
TEST_OBJS =
TEST_DEPS =

test :
	@echo "No tests."

######################################################
# House-keeping
######################################################

clean :
	rm -f *.pb.*
	rm -f *.o
	rm -f *.a

# We can't do auto dependency analysis for a .proto file. (We don't need to, either.)
depend:
