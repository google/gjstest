PROJECT_ROOT = .
default: driver

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

######################################################
# House-keeping
######################################################

SUBDIRS := \
    base \
    file \
    gjstest/internal/assertions \
    gjstest/internal/compiler \
    gjstest/internal/driver \
    gjstest/internal/driver/cpp \
    gjstest/internal/mocking \
    gjstest/public \
    gjstest/public/matchers \
    strings \
    third_party/cityhash \
    third_party/gmock \
    webutil/xml \

clean :
	for subdir in $(SUBDIRS); \
	do \
	    echo "Cleaning in $$subdir"; \
	    $(MAKE) -C $$subdir clean || exit 1; \
	done

depend :
	# Make sure proto buffer generated headers exist.
	$(MAKE) -C gjstest/internal/compiler compiler.pb.h

	for subdir in $(SUBDIRS); \
	do \
	    echo "Making depend in $$subdir"; \
	    $(MAKE) -C $$subdir depend || exit 1; \
	done

test : driver third_party/gmock/gmock_main.a
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

gjstest/internal/compiler/compiler.pb.a :
	$(MAKE) -C gjstest/internal/compiler compiler.pb.a

gjstest/internal/driver/cpp/driver_main.a : gjstest/internal/compiler/compiler.pb.a
	$(MAKE) -C gjstest/internal/driver/cpp driver_main.a

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

driver: \
    base/base.a \
    file/file.a \
    gjstest/internal/compiler/compiler.pb.a \
    gjstest/internal/driver/cpp/driver_main.a \
    strings/strings.a \
    third_party/cityhash/cityhash.a \
    webutil/xml/xml.a
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $^ -o $@ -lglog -lv8 -lgflags -lprotobuf -lre2 -lxml2
