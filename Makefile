PROJECT_ROOT = .
default: driver

# Tools and flags.
include $(PROJECT_ROOT)/tools.mk

# Sub-directories, topologically sorted.
SUBDIRS := \
    base \
    strings \
    file \
    third_party/cityhash \
    util/hash \
    third_party/gmock \
    webutil/xml \
    gjstest/internal/compiler \
    gjstest/internal/driver/cpp \

clean :
	for subdir in $(SUBDIRS); \
	do \
	    echo "Cleaning in $$subdir"; \
	    make -C $$subdir clean || exit 1; \
	done

depend :
	for subdir in $(SUBDIRS); \
	do \
	    echo "Making depend in $$subdir"; \
	    make -C $$subdir depend || exit 1; \
	done

base/base.a:
	make -C base base.a
