MATCHERS_PKG := gjstest/public/matchers

######################################################
# Tests
######################################################

$(eval $(call add_js_test,$(MATCHERS_PKG)/array_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/boolean_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/equality_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/function_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/number_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/string_matchers_test))
