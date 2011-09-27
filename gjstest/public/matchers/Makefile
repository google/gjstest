PROJECT_ROOT := ../../..
PACKAGE := gjstest/public/matchers
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

$(eval $(call add_js_test,array_matchers_test))
$(eval $(call add_js_test,boolean_matchers_test))
$(eval $(call add_js_test,combined_matchers_test))
$(eval $(call add_js_test,equality_matchers_test))
$(eval $(call add_js_test,function_matchers_test))
$(eval $(call add_js_test,number_matchers_test))
$(eval $(call add_js_test,string_matchers_test))

test : $(JS_TESTS)

######################################################
# House-keeping
######################################################

depend:

clean :
