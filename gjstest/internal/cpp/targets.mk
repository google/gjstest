$(eval $(call cc_library, \
    gjstest/internal/cpp/builtin_data, \
        base/logging \
        base/macros \
        base/stl_decl \
        file/file_utils \
        gjstest/internal/cpp/builtin_paths.generated \
        gjstest/internal/proto/named_scripts.pb \
        strings/strutil \
))

$(eval $(call hdr_only_cc_library, \
    gjstest/internal/cpp/builtin_paths.generated, \
))

$(eval $(call cc_library, \
    gjstest/internal/cpp/run_tests, \
        base/basictypes \
        base/integral_types \
        base/logging \
        base/macros \
        base/stl_decl \
        base/stringprintf \
        base/timer \
        gjstest/internal/cpp/test_case \
        gjstest/internal/cpp/v8_utils \
        gjstest/internal/proto/named_scripts.pb \
        strings/strutil \
        util/gtl/map_util \
        webutil/xml/xml_writer \
))

$(eval $(call cc_library, \
    gjstest/internal/cpp/test_case, \
        base/callback \
        base/integral_types \
        base/logging \
        base/macros \
        base/stl_decl \
        base/stringprintf \
        base/timer \
        gjstest/internal/cpp/v8_utils \
))

$(eval $(call cc_library, \
    gjstest/internal/cpp/typed_arrays, \
        base/logging \
))

$(eval $(call cc_library, \
    gjstest/internal/cpp/v8_utils, \
        base/callback-types \
        base/integral_types \
        base/logging \
        base/stringprintf \
        gjstest/internal/cpp/typed_arrays \
))

######################################################
# Tests
######################################################

$(eval $(call cc_test, \
    gjstest/internal/cpp/v8_utils_test, \
        base/callback \
        base/integral_types \
        base/logging \
        base/macros \
        gjstest/internal/cpp/v8_utils \
        , \
        -lv8_libbase -lv8_libplatform \
))

######################################################
# Binaries
######################################################

$(eval $(call cc_binary, \
    gjstest/internal/cpp/gjstest, \
        base/integral_types \
        base/logging \
        base/stringprintf \
        file/file_utils \
        gjstest/internal/cpp/builtin_data \
        gjstest/internal/cpp/run_tests \
        gjstest/internal/proto/named_scripts.pb \
        strings/strutil \
        , \
        -lprotobuf -lglog -lgflags -lxml2 -lre2 -lv8_libbase -lv8_libplatform \
))

######################################################
# Generated code
######################################################

gjstest/internal/cpp/builtin_paths.generated.h : gjstest/internal/js/use_global_namespace.deps gjstest/internal/cpp/generate_builtin_paths.sh
	./gjstest/internal/cpp/generate_builtin_paths.sh \
		gjstest/internal/js/use_global_namespace.deps \
		gjstest/internal/cpp/builtin_paths.generated.h
