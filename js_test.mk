# Nasty, hard-coded list of dependencies inherited by every JS test.
JS_TEST_DEPS := \
    $(PROJECT_ROOT)/gjstest/internal/js/namespace.js \
    $(PROJECT_ROOT)/gjstest/internal/js/error_utils.js \
    $(PROJECT_ROOT)/gjstest/internal/js/stack_utils.js \
    $(PROJECT_ROOT)/gjstest/internal/js/test_environment.js \
    $(PROJECT_ROOT)/gjstest/public/matcher_types.js \
    $(PROJECT_ROOT)/gjstest/public/matchers/number_matchers.js \
    $(PROJECT_ROOT)/gjstest/internal/js/browser/html_builder.js \
    $(PROJECT_ROOT)/gjstest/internal/js/expect_that.js \
    $(PROJECT_ROOT)/gjstest/public/matchers/boolean_matchers.js \
    $(PROJECT_ROOT)/gjstest/public/matchers/equality_matchers.js \
    $(PROJECT_ROOT)/gjstest/internal/js/call_expectation.js \
    $(PROJECT_ROOT)/gjstest/internal/js/mock_function.js \
    $(PROJECT_ROOT)/gjstest/internal/js/mock_instance.js \
    $(PROJECT_ROOT)/gjstest/public/stringify.js \
    $(PROJECT_ROOT)/gjstest/public/assertions.js \
    $(PROJECT_ROOT)/gjstest/public/mocking.js \
    $(PROJECT_ROOT)/gjstest/public/register.js \
    $(PROJECT_ROOT)/gjstest/internal/js/run_test.js \
    $(PROJECT_ROOT)/gjstest/internal/js/browser/driver.js \
    $(PROJECT_ROOT)/gjstest/public/logging.js \
    $(PROJECT_ROOT)/gjstest/public/matchers/array_matchers.js \
    $(PROJECT_ROOT)/gjstest/public/matchers/function_matchers.js \
    $(PROJECT_ROOT)/gjstest/public/matchers/string_matchers.js \
    $(PROJECT_ROOT)/gjstest/internal/js/use_global_namespace.js

define add_js_test
$(1) : $(PROJECT_ROOT)/$(PACKAGE)/$(1).js $(JS_TEST_DEPS) $(PROJECT_ROOT)/bin/gjstest
	$(PROJECT_ROOT)/bin/gjstest --js_files=`echo "$(JS_TEST_DEPS) $(PROJECT_ROOT)/$(PACKAGE)/$(1).js" | perl -i -pe 's: :,:g'`

JS_TESTS += $(1)
endef
