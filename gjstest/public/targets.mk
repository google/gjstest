$(eval $(call compiled_js_library, \
    gjstest/public/actions, \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/public/assertions, \
        gjstest/internal/js/expect_that \
        gjstest/internal/js/test_environment \
        gjstest/internal/js/namespace \
        gjstest/public/matchers/boolean_matchers \
        gjstest/public/matchers/combining_matchers \
        gjstest/public/matchers/equality_matchers \
        gjstest/public/matchers/number_matchers \
        gjstest/public/stringify \
))

$(eval $(call compiled_js_library, \
    gjstest/public/logging, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matcher_types, \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/public/mocking, \
        gjstest/internal/js/call_expectation \
        gjstest/internal/js/mock_function \
        gjstest/internal/js/mock_instance \
        gjstest/internal/js/namespace \
        gjstest/internal/js/stack_utils \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
        gjstest/public/matchers/equality_matchers \
        gjstest/public/stringify \
))

$(eval $(call compiled_js_library, \
    gjstest/public/register, \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/public/stringify, \
        gjstest/internal/js/namespace \
))

######################################################
# Tests
######################################################

$(eval $(call js_test,gjstest/public/actions))
$(eval $(call js_test,gjstest/public/mocking))
$(eval $(call js_test,gjstest/public/register))
$(eval $(call js_test,gjstest/public/stringify))
