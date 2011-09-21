PROJECT_ROOT = .
default: driver

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

SUBDIRS := \
    base \
    file \
    gjstest/internal/compiler \
    gjstest/internal/driver/cpp \
    strings \
    third_party/cityhash \
    third_party/gmock \
    webutil/xml

depend :
	@for subdir in $(SUBDIRS); \
	do \
	    make -C $$subdir depend; \
	done


# Nasty, hard-coded list of dependencies inherited by every JS test.
JS_TEST_DEPS = \
    gjstest/internal/namespace.js \
    gjstest/internal/driver/error_utils.js \
    gjstest/internal/driver/stack_utils.js \
    gjstest/internal/driver/test_environment.js \
    gjstest/public/matcher_types.js \
    gjstest/public/matchers/number_matchers.js \
    gjstest/internal/driver/browser/html_builder.js \
    gjstest/internal/assertions/expect_that.js \
    gjstest/public/matchers/boolean_matchers.js \
    gjstest/public/matchers/equality_matchers.js \
    gjstest/internal/mocking/call_expectation.js \
    gjstest/internal/mocking/mock_function.js \
    gjstest/internal/mocking/mock_instance.js \
    gjstest/public/stringify.js \
    gjstest/public/assertions.js \
    gjstest/public/mocking.js \
    gjstest/public/register.js \
    gjstest/internal/driver/run_test.js \
    gjstest/internal/driver/browser/driver.js \
    gjstest/public/logging.js \
    gjstest/public/matchers/array_matchers.js \
    gjstest/public/matchers/function_matchers.js \
    gjstest/public/matchers/string_matchers.js \
    gjstest/internal/use_global_namespace.js

define add_js_test
$(1) : $(1).js $(JS_TEST_DEPS) gjstest/internal/driver/cpp/driver
	gjstest/internal/driver/cpp/driver --js_files=`echo "$(JS_TEST_DEPS) $(1).js" | perl -i -pe 's: :,:g'`

JS_TESTS += $(1)
endef

default: test

######################################################
# gtest and gmock configuration
######################################################

TEST_HEADERS = \
    third_party/gmock/include/gmock/*.h \
    third_party/gmock/include/gmock/internal/*.h \
    third_party/gtest/include/gtest/*.h \
    third_party/gtest/include/gtest/internal/*.h

######################################################
# Packages
######################################################

include base/build.mk
include gjstest/build.mk
include strings/build.mk
include third_party/cityhash/build.mk
include third_party/gmock/build.mk
include webutil/xml/build.mk

######################################################
# House-keeping
######################################################

test : $(CPP_TESTS) js_tests

js_tests : $(JS_TESTS)

clean :
	find . -name '*.a' -delete
	find . -name '*.o' -delete
	find . -name '*.pb.h' -delete
	find . -name '*.pb.cc' -delete
	rm -f $(CPP_TESTS)
	rm -f gjstest/internal/compiler/compiler

.PHONY: test clean
