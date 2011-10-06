$(eval $(call compiled_js_library, \
    gjstest/internal/js/browser/html_builder, \
        gjstest/internal/js/namespace \
))

$(eval $(call compiled_js_library, \
    gjstest/internal/js/browser/run_tests, \
        gjstest/internal/js/browser/html_builder \
        gjstest/internal/js/namespace \
        gjstest/internal/js/run_test \
        gjstest/internal/js/stack_utils \
        gjstest/public/register \
))

######################################################
# Tests
######################################################

$(eval $(call js_test,gjstest/internal/js/browser/html_builder))
