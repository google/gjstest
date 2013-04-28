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
        -lgflags -lglog -lre2 ./third_party/gmock/make/gmock.a \
))

######################################################
# Tests
######################################################

INT_TEST_ARGS =

gjstest/internal/integration_tests/integration_test.out : gjstest/internal/integration_tests/integration_test.bin scripts/cc_test_run.sh share gjstest/internal/cpp/gjstest.bin gjstest/internal/integration_tests/*.js gjstest/internal/integration_tests/*.golden.txt gjstest/internal/integration_tests/*.golden.xml
	./scripts/cc_test_run.sh gjstest/internal/integration_tests/integration_test --test_srcdir=gjstest/internal/integration_tests --data_dir=share/gjstest --gjstest_binary=gjstest/internal/cpp/gjstest.bin $(INT_TEST_ARGS)

CC_TESTS += gjstest/internal/integration_tests/integration_test.out
