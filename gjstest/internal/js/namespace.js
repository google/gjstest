// Copyright 2010 Google Inc. All Rights Reserved.
// Author: jacobsa@google.com (Aaron Jacobs)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Make sure the gjstest namespace doesn't already exist. This is to help catch
// errors with dependency funniness -- for example, accidentally including this
// file twice. The second inclusion would otherwise silently overwrite the
// namespace, causing inscrutable errors from other code.
var globalContext = this;
if (!!globalContext['gjstest']) {
  throw new Error(
      'The gjstest namespace is already defined! ' +
          'Did you include namespace.js twice?');
}

/** @const */
var gjstest = {};

/** @const */
gjstest.internal = {};
