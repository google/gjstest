MATCHERS_PKG := gjstest/public/matchers

######################################################
# Tests
######################################################

define add_js_test
$(1) : $(1).js $(JS_TEST_DEPS) gjstest/internal/driver/cpp/driver
	gjstest/internal/driver/cpp/driver --js_files=`echo "$(JS_TEST_DEPS) $(1).js" | perl -i -pe 's: :,:g'`

JS_TESTS += $(1)
endef

$(eval $(call add_js_test,$(MATCHERS_PKG)/array_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/boolean_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/equality_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/function_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/number_matchers_test))
$(eval $(call add_js_test,$(MATCHERS_PKG)/string_matchers_test))
