$(eval $(call cc_library, \
    strings/ascii_ctype, \
        base/basictypes \
))

$(eval $(call cc_library, \
    strings/strutil, \
        base/basictypes \
        base/logging \
        base/scoped_ptr \
        strings/ascii_ctype \
))
