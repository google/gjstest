PROJECT_ROOT = ..

# Preprocessor flags.
CPPFLAGS += -I$(PROJECT_ROOT) -DHASH_NAMESPACE=__gnu_cxx

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

# Objects to include in the library.
OBJS = callback.o stringpiece.o stringprintf.o timer.o

base.a : $(OBJS)
	rm -f base.a
	$(AR) $(ARFLAGS) $@ $^

clean :
	rm -f *.o
	rm -f *.a

%.o : %.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c -o $@ $<
