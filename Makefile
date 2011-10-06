default: gjstest/internal/cpp/gjstest.bin share

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
include gjstest/internal/js/targets.mk
include gjstest/internal/proto/targets.mk
include gjstest/public/targets.mk
include gjstest/public/matchers/targets.mk
include strings/targets.mk
include third_party/cityhash/targets.mk
include util/gtl/targets.mk
include util/hash/targets.mk
include webutil/xml/targets.mk

######################################################
# Data
#
# TODO(jacobsa): Make this a .binarypb target. See issue 9.
######################################################

SHARE_DATA = \
    internal/js/browser/browser.css \
    internal/js/browser/html_builder.js \
    internal/js/browser/run_tests.js \
    internal/js/call_expectation.js \
    internal/js/error_utils.js \
    internal/js/expect_that.js \
    internal/js/mock_function.js \
    internal/js/mock_instance.js \
    internal/js/namespace.js \
    internal/js/run_test.js \
    internal/js/stack_utils.js \
    internal/js/test_environment.js \
    internal/js/use_global_namespace.js \
    public/assertions.js \
    public/logging.js \
    public/matcher_types.js \
    public/matchers/array_matchers.js \
    public/matchers/boolean_matchers.js \
    public/matchers/combining_matchers.js \
    public/matchers/equality_matchers.js \
    public/matchers/function_matchers.js \
    public/matchers/missing_arg_matchers.js \
    public/matchers/number_matchers.js \
    public/matchers/string_matchers.js \
    public/actions.js \
    public/mocking.js \
    public/register.js \
    public/stringify.js \

share :
	for f in $(SHARE_DATA); \
	do \
	    DIR=`dirname $$f`; \
	    mkdir -p share/gjstest/$$DIR; \
	    cp gjstest/$$f share/gjstest/$$DIR || exit 1; \
	done

.PHONY : share

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
	$(INSTALL) -m 0755 -d $(PREFIX)/bin
	$(INSTALL) -m 0755 -d $(PREFIX)/share
	$(INSTALL) -m 0755 gjstest/internal/cpp/gjstest.bin $(PREFIX)/bin/gjstest
	for f in $$(find share -type f); \
	do \
	    DIR=`dirname $$f`; \
	    install -m 0755 -d $(PREFIX)/$$DIR; \
	    install -m 0644 $$f $(PREFIX)/$$f; \
	done

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
