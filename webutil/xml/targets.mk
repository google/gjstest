$(eval $(call cc_library, \
    webutil/xml/xml_writer, \
        base/basictypes \
        base/logging \
        base/macros \
        base/scoped_ptr \
        base/stl_decl \
        base/stringprintf \
))

######################################################
# Tests
######################################################

$(eval $(call cc_test, \
    webutil/xml/xml_writer_test, \
        base/logging \
        webutil/xml/xml_writer \
	, \
	-lxml2 \
))
