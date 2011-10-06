$(eval $(call cc_binary, \
    tools/build_binarypb, \
        file/file_utils \
        gjstest/internal/proto/named_scripts.pb \
        strings/strutil, \
        -lgflags -lprotobuf \
))
