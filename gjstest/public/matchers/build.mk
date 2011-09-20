MATCHERS_PKG := gjstest/public/matchers

######################################################
# Tests
######################################################

JS_TESTS +=\
    $(MATCHERS_PKG)/array_matchers_test

$(MATCHERS_PKG)/array_matchers_test : $(MATCHERS_PKG)/array_matchers_test.js $(JS_TEST_DEPS) gjstest/internal/driver/cpp/driver
	gjstest/internal/driver/cpp/driver --js_files=`echo "$(JS_TEST_DEPS) $(MATCHERS_PKG)/array_matchers_test.js" | perl -i -pe 's: :,:g'`
