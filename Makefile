# Preprocessor flags.
CPPFLAGS += -I.

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

######################################################
# House-keeping
######################################################

# TODO(jacobsa): Update this.
all : gjstest/internal/driver/cpp/v8_utils.o

clean :
	find . -name '*.o' -delete

######################################################
# Libraries
######################################################

base.o : base/*.h base/*.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c base/*.cc

gjstest/internal/driver/cpp/v8_utils.o : gjstest/internal/driver/cpp/v8_utils.* base/*.h
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c gjstest/internal/driver/cpp/v8_utils.cc
