default: gjstest/internal/cpp/gjstest.bin share

######################################################
# Flags
######################################################

# The prefix into which the user wants to install.
export PREFIX = /usr/local
DEFAULT_DATA_DIR = $(PREFIX)/share/gjstest

# Preprocessor flags.
CPPFLAGS += -I.
CPPFLAGS += -I./third_party/gmock/include
CPPFLAGS += -I./third_party/gmock/gtest/include
CPPFLAGS += -I/usr/include/libxml2
CPPFLAGS += -I/usr/local/opt/libxml2/include/libxml2
CPPFLAGS += -I/usr/local/include
CPPFLAGS += -I$(HOME)/.homebrew/include
CPPFLAGS += -I$(HOME)/.homebrew/opt/libxml2/include/libxml2
CPPFLAGS += -DDEFAULT_DATA_DIR=$(DEFAULT_DATA_DIR)

# Compiler flags.
CXXFLAGS += -DHASH_NAMESPACE=__gnu_cxx
CXXFLAGS += -std=c++11

# Linker flags.
LDFLAGS += -L/usr/local/lib
LDFLAGS += -L$(HOME)/.homebrew/lib

# Fix clock_gettime in timer.cc.
UNAME := $(shell uname)
ifeq ($(UNAME), Linux)
CXXFLAGS += -lrt
endif

INSTALL = install

######################################################
# Functions
######################################################

include scripts/cc_rules.mk
include scripts/js_rules.mk
include scripts/proto_rules.mk

######################################################
# Packages
######################################################

include base/targets.mk
include file/targets.mk
include gjstest/internal/cpp/targets.mk
include gjstest/internal/integration_tests/targets.mk
include gjstest/internal/js/browser/targets.mk
include gjstest/internal/js/targets.mk
include gjstest/internal/proto/targets.mk
include gjstest/public/matchers/targets.mk
include gjstest/public/targets.mk
include strings/targets.mk
include third_party/cityhash/targets.mk
include util/gtl/targets.mk
include webutil/xml/targets.mk

######################################################
# Data
######################################################

# A directory containing a file called builtin_scripts.deps with one relative
# path per line, and the files defined by those relative paths. These are all
# of the JS files needed at runtime.
share : gjstest/internal/js/use_global_namespace.deps
	# Built-in JS files.
	for js_file in `cat gjstest/internal/js/use_global_namespace.deps`; do \
		mkdir -p share/`dirname $$js_file` || exit 1; \
		cp $$js_file share/$$js_file || exit 1; \
	done

	# Browser CSS.
	mkdir -p gjstest/internal/js/browser
	cp gjstest/internal/js/browser/browser.css share/gjstest/internal/js/browser/browser.css

######################################################
# Collections
######################################################

binaries : $(CC_BINARIES)
compilation_tests : $(COMPILATION_TESTS)
compile : binaries compilation_tests

js_tests : $(JS_TESTS)
cc_tests : $(CC_TESTS)
test : js_tests cc_tests

######################################################
# Installation
######################################################

install : gjstest/internal/cpp/gjstest.bin share
	# Binary
	$(INSTALL) -m 0755 -d $(PREFIX)/bin
	$(INSTALL) -m 0755 gjstest/internal/cpp/gjstest.bin $(PREFIX)/bin/gjstest
	
	# Data
	for f in $$(find share -type f); \
	do \
	    DIR=`dirname $$f` || exit 1; \
	    install -m 0755 -d $(PREFIX)/$$DIR || exit 1; \
	    install -m 0644 $$f $(PREFIX)/$$f || exit 1; \
	done

######################################################
# House-keeping
######################################################

clean :
	$(MAKE) -C third_party/gmock/make clean
	find . -name '*.bin' -delete
	find . -name '*.compile' -delete
	find . -name '*.deps' -delete
	find . -name '*.generated.h' -delete
	find . -name '*.generated.cc' -delete
	find . -name '*.header_deps' -delete
	find . -name '*.o' -delete
	find . -name '*.object_deps' -delete
	find . -name '*.pb.cc' -delete
	find . -name '*.pb.h' -delete
	find . -name '*test.out' -delete
	rm -f $(CC_BINARIES)
	rm -rf share/
