$(eval $(call compiled_js_library, \
    gjstest/internal/js/call_expectation, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/stack_utils \
        gjstest/public/matcher_types \
        gjstest/public/stringify \
        gjstest/public/matchers/equality_matchers \
        gjstest/public/matchers/missing_arg_matchers \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/error_utils, \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/expect_that, \
        gjstest/internal/js/namespace \
        gjstest/public/matcher_types \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/mock_function, \
        gjstest/internal/js/call_expectation \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/mock_instance, \
        gjstest/internal/js/mock_function \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/namespace, \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/run_test, \
        gjstest/internal/js/expect_that \
        gjstest/internal/js/mock_function \
        gjstest/internal/js/mock_instance \
        gjstest/internal/js/stack_utils \
        gjstest/public/assertions \
        gjstest/public/mocking \
        gjstest/public/register \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/stack_utils, \
        gjstest/internal/js/error_utils \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/test_environment, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/stack_utils \
))

######################################################
# Tests
######################################################

$(eval $(call js_test,gjstest/internal/js/call_expectation))
$(eval $(call js_test,gjstest/internal/js/expect_that))
$(eval $(call js_test,gjstest/internal/js/mock_function))
$(eval $(call js_test,gjstest/internal/js/mock_instance))
$(eval $(call js_test,gjstest/internal/js/stack_utils))
$(eval $(call js_test,gjstest/internal/js/test_environment))
