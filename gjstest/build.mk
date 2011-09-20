PACKAGE = gjstest

include $(PACKAGE)/internal/compiler/build.mk
include $(PACKAGE)/internal/driver/cpp/build.mk
include $(PACKAGE)/public/matchers/build.mk

$(eval $(call add_js_test,$(PACKAGE)/internal/assertions/expect_that_test))
$(eval $(call add_js_test,$(PACKAGE)/internal/driver/browser/html_builder_test))
$(eval $(call add_js_test,$(PACKAGE)/internal/driver/stack_utils_test))
$(eval $(call add_js_test,$(PACKAGE)/internal/driver/test_environment_test))
$(eval $(call add_js_test,$(PACKAGE)/internal/mocking/call_expectation_test))
$(eval $(call add_js_test,$(PACKAGE)/internal/mocking/mock_function_test))
$(eval $(call add_js_test,$(PACKAGE)/internal/mocking/mock_instance_test))
$(eval $(call add_js_test,$(PACKAGE)/public/mocking_test))
$(eval $(call add_js_test,$(PACKAGE)/public/register_test))
$(eval $(call add_js_test,$(PACKAGE)/public/stringify_test))
