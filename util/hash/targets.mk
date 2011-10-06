$(eval $(call hdr_only_cc_library, \
    util/hash/hash, \
        base/stl_decl \
        third_party/cityhash/city \
))
