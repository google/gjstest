PROJECT_ROOT = .
default: driver

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

SUBDIRS := \
    base \
    file \
    gjstest/internal/compiler \
    gjstest/internal/driver/cpp \
    strings \
    third_party/cityhash \
    third_party/gmock \
    webutil/xml \

clean :
	for subdir in $(SUBDIRS); \
	do \
	    echo "Cleaning in $$subdir"; \
	    make -C $$subdir clean || exit 1; \
	done

depend :
	# Make sure proto buffer generated headers exist.
	make -C gjstest/internal/compiler compiler.pb.h

	for subdir in $(SUBDIRS); \
	do \
	    echo "Making depend in $$subdir"; \
	    make -C $$subdir depend || exit 1; \
	done

base/base.a:
	make -C base base.a
