PROJECT_ROOT = ../../..
default: proto.a

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

######################################################
# Libraries
######################################################

# Objects to include in the library.
LIB_OBJS = named_scripts.pb.o

proto.a : $(LIB_OBJS)
	rm -f $@
	$(AR) $(ARFLAGS) $@ $^

named_scripts.pb.h named_scripts.pb.cc : named_scripts.proto
	cd $(PROJECT_ROOT) && protoc --proto_path=. --cpp_out=. gjstest/internal/proto/named_scripts.proto

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
