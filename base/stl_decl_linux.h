//
// Copyright (C) 2007 and onwards Google, Inc.
//
//
// NOTE(jacobsa): A hacked up stl_decl.h for Linux. This should probably be done
// better.
//
// Don't include this directly.

#ifndef _STL_DECL_LINUX_H
#define _STL_DECL_LINUX_H

#include <cstddef>
#include <algorithm>
using std::min;
using std::max;
using std::swap;
using std::reverse;

#include <string>
using std::string;

#include <vector>
using std::vector;

#include <functional>
using std::less;

#include <utility>
using std::pair;
using std::make_pair;

#include <set>
using std::set;
using std::multiset;

#include <list>
#include <deque>
#include <iostream>
using std::ostream;
using std::cout;
using std::endl;

#include <map>
using std::map;
using std::multimap;

#include <queue>
using std::priority_queue;

#include <stack>
#include <bits/stl_tempbuf.h>
#include <ext/functional>
#include <ios>
#include <string>
using std::string;

#include <ext/hash_set>
#include <ext/hash_map>

using namespace std;
using __gnu_cxx::hash;
using __gnu_cxx::hash_set;
using __gnu_cxx::hash_map;
using __gnu_cxx::select1st;

/* On Linux (and gdrive on LINUX), this comes from places like
   google3/third_party/stl/gcc3/new.  On LINUX using "builtin"
   stl headers, however, it does not get defined. */
#ifndef __STL_USE_STD_ALLOCATORS
#define __STL_USE_STD_ALLOCATORS 1
#endif


#ifndef HASH_NAMESPACE
/* We can't define it here; it's too late. */
#error "HASH_NAMESPACE needs to be defined in the Makefile".
#endif

#endif  /* _STL_DECL_LINUX_H */
