# Copyright 2011 Google Inc. All Rights Reserved.
# Author: jacobsa@google.com (Aaron Jacobs)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Create a C++ library for a proto buffer.
#
# Arg 1:
#     Name of the library, including a path. It is assumed that $(1).proto is
#     the proto file. Users can depend on $(1).pb from cc_library and cc_binary
#     targets.
#
# TODO(jacobsa): Support dependencies when needed.
define proto_library

$(1:=.pb.h) $(1:=.pb.cc) : $(1:=.proto)
	protoc --proto_path=. --cpp_out=. $(1:=.proto)

$(eval $(call cc_library,$(1:=.pb),))

endef
