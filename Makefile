# Path to the directory where v8 was built.
V8_DIR = ../../tmp/v8-read-only

# Preprocessor flags.
CPPFLAGS += -I. -I$(V8_DIR)/include

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
