######################################################
# Binaries
######################################################

$(eval $(call cc_binary, \
    gjstest/internal/integration_tests/integration_test, \
        base/logging \
        base/macros \
        base/stringprintf \
        file/file_utils \
        strings/strutil \
	, \
	-lgtest -lgflags -lglog -lre2 -lgmock \
))

######################################################
# Tests
######################################################

INT_TEST_ARGS =

gjstest/internal/integration_tests/integration_test.out : gjstest/internal/integration_tests/integration_test.bin scripts/cc_test_run.sh share gjstest/internal/cpp/gjstest.bin
	./scripts/cc_test_run.sh gjstest/internal/integration_tests/integration_test --test_srcdir=gjstest/internal/integration_tests --gjstest_data_dir=share/gjstest --gjstest_binary=gjstest/internal/cpp/gjstest.bin $(INT_TEST_ARGS)

CC_TESTS += gjstest/internal/integration_tests/integration_test.out
