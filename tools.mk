# Preprocessor flags.
CPPFLAGS += -I$(PROJECT_ROOT) -DHASH_NAMESPACE=__gnu_cxx

# Compiler flags.
CXXFLAGS += -g -Wall -Wextra

# Install command.
INSTALL = install

%.o : %.cc
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) -c -o $@ $<
