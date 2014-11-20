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

/**
 * A matcher for objects that evaluate to true.
 *
 * @type {!gjstest.Matcher}
 */
gjstest.evalsToTrue = new gjstest.Matcher(
    'evaluates to true',
    'evaluates to false',
    function(obj) { return !!obj; }
);

/**
 * A matcher for objects that evaluate to false.
 *
 * @type {!gjstest.Matcher}
 */
gjstest.evalsToFalse = new gjstest.Matcher(
    'evaluates to false',
    'evaluates to true',
    function(obj) { return !obj; }
);
