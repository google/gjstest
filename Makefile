PROJECT_ROOT = .
default: bin/gjstest

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

######################################################
# House-keeping
######################################################

SUBDIRS := \
    base \
    file \
    gjstest/internal/cpp \
    gjstest/internal/js \
    gjstest/internal/proto \
    gjstest/public \
    gjstest/public/matchers \
    strings \
    third_party/cityhash \
    third_party/gmock \
    webutil/xml \

clean :
	rm -f bin/gjstest
	for subdir in $(SUBDIRS); \
	do \
	    echo "Cleaning in $$subdir"; \
	    $(MAKE) -C $$subdir clean || exit 1; \
	done

depend :
	# Make sure proto buffer generated headers exist.
	$(MAKE) -C gjstest/internal/proto named_scripts.pb.h

	for subdir in $(SUBDIRS); \
	do \
	    echo "Making depend in $$subdir"; \
	    $(MAKE) -C $$subdir depend || exit 1; \
	done

test : bin/gjstest third_party/gmock/gmock_main.a
	for subdir in $(SUBDIRS); \
	do \
	    echo "Making test in $$subdir"; \
	    $(MAKE) -C $$subdir test || exit 1; \
	done

######################################################
# Sub-packages
######################################################

base/base.a :
	$(MAKE) -C base base.a

file/file.a :
	$(MAKE) -C file file.a

gjstest/internal/cpp/gjstest_main.a : gjstest/internal/proto/named_scripts.pb.h
	$(MAKE) -C gjstest/internal/cpp gjstest_main.a

gjstest/internal/proto/named_scripts.pb.h :
	$(MAKE) -C gjstest/internal/proto named_scripts.pb.h

gjstest/internal/proto/proto.a :
	$(MAKE) -C gjstest/internal/proto proto.a

strings/strings.a :
	$(MAKE) -C strings strings.a

third_party/cityhash/cityhash.a :
	$(MAKE) -C third_party/cityhash cityhash.a

third_party/gmock/gmock_main.a :
	$(MAKE) -C third_party/gmock gmock_main.a

webutil/xml/xml.a :
	$(MAKE) -C webutil/xml xml.a

######################################################
# Binaries
######################################################

bin/gjstest: \
    base/base.a \
    file/file.a \
    gjstest/internal/cpp/gjstest_main.a \
    gjstest/internal/proto/proto.a \
    strings/strings.a \
    third_party/cityhash/cityhash.a \
    webutil/xml/xml.a
	mkdir -p bin/
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $^ -o $@ -lglog -lv8 -lgflags -lprotobuf -lre2 -lxml2
