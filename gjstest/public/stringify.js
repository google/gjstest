// Copyright 2011 Google Inc. All Rights Reserved.
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
 * Given an abitrary object, return a human-readble, 1-line description of that
 * object for use in messages about expectations.
 *
 * This function makes use of toString methods on the objects it sees, if any.
 * The display of user-defined types may therefore be customised by defining
 * such methods.
 *
 * Note that stringifying very large objects without toString methods (or with
 * expensive toString methods) can be quite slow. Call this function lazily if
 * you can get away with it.
 *
 * @param {*} obj
 * @return {!string}
 */
gjstest.stringify = function(obj) {
  var naiveResult = '' + obj;

  // Special-case: arrays and arguments should have their values printed:
  //     [ 1, 2, 'foo' ]
  if (obj instanceof Array || naiveResult == '[object Arguments]') {
    if (obj.length == 0) return '[]';

    // Was this array already seen in an invocation of this function further
    // down the stack?
    if (obj.__gjstest_stringify_already_seen) return '(cyclic reference)';

    // Annotate this object temporarily; clean up later.
    obj.__gjstest_stringify_already_seen = true;

    var descriptions = [];
    for (var i = 0; i < obj.length; ++i) {
      // Leave a blank space for indexes where there's a missing element.
      if (!obj.hasOwnProperty(i)) {
        descriptions.push('');
        continue;
      }

      descriptions.push(gjstest.stringify(obj[i]));
    }

    // Clear the tracking property.
    delete obj.__gjstest_stringify_already_seen;

    return '[ ' + descriptions.join(', ') + ' ]';
  }

  // Special-case: objects should have their keys and values printed:
  //     { foo: 1, bar: { baz: 'asd' } }
  if (naiveResult == '[object Object]') {
    // Was this array already seen in an invocation of this function further
    // down the stack?
    if (obj.__gjstest_stringify_already_seen) return '(cyclic reference)';

    // Annotate this object temporarily; clean up later.
    obj.__gjstest_stringify_already_seen = true;

    var keyValueDescriptions = [];
    for (var key in obj) {
      // Skip this key if it's our special tracker property.
      if (key == '__gjstest_stringify_already_seen') continue;

      var value = obj[key];
      keyValueDescriptions.push(key + ': ' + gjstest.stringify(value));
    }

    // Clear the tracking property.
    delete obj.__gjstest_stringify_already_seen;

    if (keyValueDescriptions.length == 0) return '{}';

    return '{ ' + keyValueDescriptions.join(', ') + ' }';
  }

  // Special-case: strings should be surrounded in quotation marks, and have
  // their newlines converted to \n:
  //     'foo\nbar'
  if (typeof(obj) == 'string') {
    return '\'' + obj.replace(/\n/g, '\\n') + '\'';
  }

  // Special-case: functions should have their names (if any) printed:
  //     function: fooBar
  //     function: (anonymous)
  //
  // Function.prototype.toString returns things like:
  //     function fooBar(asd) { return 17; }
  //     function (asd) {}
  var match;
  if (match = /^(function (\S+)?\([^()]*\)) {[\s\S]*}$/.exec(naiveResult)) {
    return match[1];
  }

  return '' + obj;
};
