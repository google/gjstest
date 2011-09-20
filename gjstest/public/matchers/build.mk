MATCHERS_PKG := gjstest/public/matchers

######################################################
# Tests
######################################################

define add_js_test
$(MATCHERS_PKG)/$(1) : $(MATCHERS_PKG)/$(1).js $(JS_TEST_DEPS) gjstest/internal/driver/cpp/driver
	gjstest/internal/driver/cpp/driver --js_files=`echo "$(JS_TEST_DEPS) $(MATCHERS_PKG)/$(1).js" | perl -i -pe 's: :,:g'`

JS_TESTS += $(MATCHERS_PKG)/$(1)
endef

$(eval $(call add_js_test,array_matchers_test))
$(eval $(call add_js_test,boolean_matchers_test))
$(eval $(call add_js_test,equality_matchers_test))
$(eval $(call add_js_test,function_matchers_test))
$(eval $(call add_js_test,number_matchers_test))
$(eval $(call add_js_test,string_matchers_test))
