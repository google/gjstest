PROJECT_ROOT := ../../..
PACKAGE := gjstest/internal/driver
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

$(eval $(call add_js_test,stack_utils_test))
$(eval $(call add_js_test,test_environment_test))

test : $(JS_TESTS)

######################################################
# House-keeping
######################################################

depend:

clean :
