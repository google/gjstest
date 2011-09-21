PROJECT_ROOT := ../../..
PACKAGE := gjstest/internal/mocking
default: test

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

######################################################
# Libraries
######################################################

######################################################
# Tests
######################################################

include $(PROJECT_ROOT)/js_test.mk

$(eval $(call add_js_test,call_expectation_test))
$(eval $(call add_js_test,mock_function_test))
$(eval $(call add_js_test,mock_instance_test))

test : $(JS_TESTS)

######################################################
# House-keeping
######################################################

depend:

clean :
