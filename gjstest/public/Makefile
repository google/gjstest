PROJECT_ROOT := ../..
PACKAGE := gjstest/public
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

$(eval $(call add_js_test,mocking_test))
$(eval $(call add_js_test,register_test))
$(eval $(call add_js_test,stringify_test))

test : $(JS_TESTS)

######################################################
# House-keeping
######################################################

depend:

clean :
