$(eval $(call hdr_only_cc_library, \
    third_party/cityhash/citycrc, \
        third_party/cityhash/city \
))

$(eval $(call cc_library, \
    third_party/cityhash/city, \
        base/integral_types \
))

######################################################
# Tests
######################################################

$(eval $(call cc_test, \
    third_party/cityhash/city_test, \
        third_party/cityhash/city \
        third_party/cityhash/citycrc, \
))
