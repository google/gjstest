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

$(eval $(call add_js_test,$(PACKAGE)/array_matchers_test))
$(eval $(call add_js_test,$(PACKAGE)/boolean_matchers_test))
$(eval $(call add_js_test,$(PACKAGE)/equality_matchers_test))
$(eval $(call add_js_test,$(PACKAGE)/function_matchers_test))
$(eval $(call add_js_test,$(PACKAGE)/number_matchers_test))
$(eval $(call add_js_test,$(PACKAGE)/string_matchers_test))

test : $(JS_TESTS)

######################################################
# House-keeping
######################################################

depend:

clean :
