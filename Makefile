PROJECT_ROOT = .
default: bin/gjstest share

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

######################################################
# House-keeping
######################################################

SUBDIRS := \
    base \
    file \
    gjstest/internal/cpp \
    gjstest/internal/integration_tests \
    gjstest/internal/js \
    gjstest/internal/proto \
    gjstest/public \
    gjstest/public/matchers \
    strings \
    third_party/cityhash \
    third_party/gmock \
    webutil/xml \

clean :
	rm -f bin/gjstest
	rm -rf share/
	for subdir in $(SUBDIRS); \
	do \
	    echo "Cleaning in $$subdir"; \
	    $(MAKE) -C $$subdir clean || exit 1; \
	done

depend :
	# Make sure proto buffer generated headers exist.
	$(MAKE) -C gjstest/internal/proto named_scripts.pb.h

	for subdir in $(SUBDIRS); \
	do \
	    echo "Making depend in $$subdir"; \
	    $(MAKE) -C $$subdir depend || exit 1; \
	done

test : \
    bin/gjstest \
    third_party/gmock/gmock_main.a \
    share \
    gjstest/internal/cpp/cpp.a
	for subdir in $(SUBDIRS); \
	do \
	    echo "Making test in $$subdir"; \
	    $(MAKE) -C $$subdir test || exit 1; \
	done

######################################################
# Sub-packages
######################################################

base/base.a :
	$(MAKE) -C base base.a

file/file.a :
	$(MAKE) -C file file.a

gjstest/internal/cpp/cpp.a : gjstest/internal/proto/named_scripts.pb.h
	$(MAKE) -C gjstest/internal/cpp cpp.a

gjstest/internal/cpp/gjstest_main.a : gjstest/internal/proto/named_scripts.pb.h
	$(MAKE) -C gjstest/internal/cpp gjstest_main.a

gjstest/internal/proto/named_scripts.pb.h :
	$(MAKE) -C gjstest/internal/proto named_scripts.pb.h

gjstest/internal/proto/proto.a :
	$(MAKE) -C gjstest/internal/proto proto.a

strings/strings.a :
	$(MAKE) -C strings strings.a

third_party/cityhash/cityhash.a :
	$(MAKE) -C third_party/cityhash cityhash.a

third_party/gmock/gmock_main.a :
	$(MAKE) -C third_party/gmock gmock_main.a

webutil/xml/xml.a :
	$(MAKE) -C webutil/xml xml.a

.PHONY: \
    base/base.a \
    file/file.a \
    gjstest/internal/cpp/gjstest_main.a \
    gjstest/internal/proto/named_scripts.pb.h \
    gjstest/internal/proto/proto.a \
    strings/strings.a \
    third_party/cityhash/cityhash.a \
    third_party/gmock/gmock_main.a \
    webutil/xml/xml.a

######################################################
# Binaries
######################################################

bin/gjstest: \
    base/base.a \
    file/file.a \
    gjstest/internal/cpp/gjstest_main.a \
    gjstest/internal/proto/proto.a \
    strings/strings.a \
    third_party/cityhash/cityhash.a \
    webutil/xml/xml.a
	mkdir -p bin/
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $^ -o $@ -lglog -lv8 -lgflags -lprotobuf -lre2 -lxml2

######################################################
# Data
######################################################

SHARE_DATA = \
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
    public/matchers/equality_matchers.js \
    public/matchers/function_matchers.js \
    public/matchers/number_matchers.js \
    public/matchers/string_matchers.js \
    public/mocking.js \
    public/register.js \
    public/stringify.js \

share :
	mkdir -p share
	for f in $(SHARE_DATA); \
	do \
	    DIR=`dirname $$f`; \
	    mkdir -p share/$$DIR; \
	    cp gjstest/$$f share/$$DIR || exit 1; \
	done

.PHONY : share
