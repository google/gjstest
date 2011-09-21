PROJECT_ROOT = ../../..
default: compiler.pb.a

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

# Objects to include in the library.
OBJS = compiler.pb.o

compiler.pb.a : $(OBJS)
	rm -f $@
	$(AR) $(ARFLAGS) $@ $^

compiler.pb.h compiler.pb.cc : compiler.proto
	cd $(PROJECT_ROOT) && protoc --proto_path=. --cpp_out=. gjstest/internal/compiler/compiler.proto

clean :
	rm -f *.pb.*
	rm -f *.o
	rm -f *.a

# We can't do auto dependency analysis for a .proto file. (We don't need to, either.)
depend:
