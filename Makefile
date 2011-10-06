default: gjstest/internal/cpp/gjstest.bin share/builtin_scripts.binarypb

######################################################
# Flags
######################################################

# The prefix into which the user wants to install.
export PREFIX = /usr/local
DEFAULT_DATA_DIR = $(PREFIX)/share/gjstest

# Preprocessor flags.
CPPFLAGS += -I.
CPPFLAGS += -I/usr/include/libxml2
CPPFLAGS += -DDEFAULT_DATA_DIR=$(DEFAULT_DATA_DIR)

# Compiler flags.
CXXFLAGS += -DHASH_NAMESPACE=__gnu_cxx

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
include tools/targets.mk
include util/gtl/targets.mk
include util/hash/targets.mk
include webutil/xml/targets.mk

######################################################
# Data
######################################################

$(eval $(call js_scripts_binarypb, \
    share/builtin_scripts.binarypb, \
        gjstest/internal/js/use_global_namespace \
))

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

install : gjstest/internal/cpp/gjstest.bin share/builtin_scripts.binarypb
	$(INSTALL) -m 0755 -d $(PREFIX)/bin
	$(INSTALL) -m 0755 -d $(PREFIX)/share
	$(INSTALL) -m 0755 gjstest/internal/cpp/gjstest.bin $(PREFIX)/bin/gjstest
	$(INSTALL) -m 0755 share/builtin_scripts.binarypb $(PREFIX)/share/gjstest/builtin_scripts.binarypb

######################################################
# House-keeping
######################################################

clean :
	find . -name '*.compile' -delete
	find . -name '*.deps' -delete
	find . -name '*.header_deps' -delete
	find . -name '*.object_deps' -delete
	find . -name '*.pb.h' -delete
	find . -name '*.pb.cc' -delete
	find . -name '*test.out' -delete
	find . -name '*.o' -delete
	rm -f $(CC_BINARIES)
	rm -rf share/
