$(eval $(call hdr_only_cc_library, \
    base/basictypes, \
        base/integral_types \
))

$(eval $(call cc_library, \
    base/callback, \
        base/logging \
))

$(eval $(call hdr_only_cc_library, \
    base/callback-types, \
        base/callback \
))

$(eval $(call hdr_only_cc_library, \
    base/integral_types, \
))

$(eval $(call hdr_only_cc_library, \
    base/logging, \
))

$(eval $(call hdr_only_cc_library, \
    base/macros, \
        base/type_traits \
))

$(eval $(call hdr_only_cc_library, \
    base/scoped_ptr, \
        base/basictypes \
        base/macros \
))

$(eval $(call hdr_only_cc_library, \
    base/stl_decl, \
        base/stl_decl_linux \
        base/stl_decl_osx \
))

$(eval $(call hdr_only_cc_library, \
    base/stl_decl_linux, \
))

$(eval $(call hdr_only_cc_library, \
    base/stl_decl_osx, \
))

$(eval $(call cc_library, \
    base/stringpiece, \
))

$(eval $(call cc_library, \
    base/stringprintf, \
))

$(eval $(call hdr_only_cc_library, \
    base/template_util, \
))

$(eval $(call cc_library, \
    base/timer, \
        base/integral_types \
        base/logging \
        base/macros \
))

$(eval $(call hdr_only_cc_library, \
    base/type_traits, \
        base/template_util \
))
