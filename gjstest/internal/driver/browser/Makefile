PROJECT_ROOT := ../../../..
PACKAGE := gjstest/internal/driver/browser
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

$(eval $(call add_js_test,html_builder_test))

test : $(JS_TESTS)

######################################################
# House-keeping
######################################################

depend:

clean :
