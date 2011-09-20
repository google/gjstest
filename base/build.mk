BASE_PACKAGE = base

######################################################
# Libraries
######################################################

base/callback.o: base/callback.cc base/*.h
base/stringprintf.o: base/stringprintf.cc base/*.h
base/timer.o: base/timer.cc base/*.h

base/base.a: base/callback.o base/stringprintf.o base/timer.o
	rm -f $@
	$(AR) $(ARFLAGS) $@ $^
