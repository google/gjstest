$(eval $(call compiled_js_library, \
    gjstest/public/matchers/array_matchers, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
        gjstest/public/matchers/equality_matchers \
        gjstest/public/stringify \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/boolean_matchers, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/combining_matchers, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
        gjstest/public/matchers/equality_matchers \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/equality_matchers, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
        gjstest/public/matchers/boolean_matchers \
        gjstest/public/stringify \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/function_matchers, \
        gjstest/internal/js/namespace \
        gjstest/public/matcher_types \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/missing_arg_matchers, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
        gjstest/public/matchers/combining_matchers \
        gjstest/public/matchers/equality_matchers \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/number_matchers, \
        gjstest/internal/js/namespace \
        gjstest/internal/js/test_environment \
        gjstest/public/matcher_types \
))

$(eval $(call compiled_js_library, \
    gjstest/public/matchers/string_matchers, \
        gjstest/internal/js/namespace \
        gjstest/public/matcher_types \
        gjstest/public/stringify \
))

######################################################
# Tests
######################################################

$(eval $(call js_test,gjstest/public/matchers/array_matchers))
$(eval $(call js_test,gjstest/public/matchers/boolean_matchers))
$(eval $(call js_test,gjstest/public/matchers/combining_matchers))
$(eval $(call js_test,gjstest/public/matchers/equality_matchers))
$(eval $(call js_test,gjstest/public/matchers/function_matchers))
$(eval $(call js_test,gjstest/public/matchers/missing_arg_matchers))
$(eval $(call js_test,gjstest/public/matchers/number_matchers))
$(eval $(call js_test,gjstest/public/matchers/string_matchers))
