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
 * Match functions that, when invoked, throw an error whose toString() method
 * returns a string that matches the supplied regular expression.
 *
 * @param {RegExp} re
 * @return {!gjstest.Matcher}
 */
gjstest.throwsError = function(re) {
  // Make sure the input is a regexp.
  if (!(re instanceof RegExp)) {
    throw new TypeError('throwsError requires a RegExp argument.');
  }

  var description = 'is a function that throws an error matching ' + re;
  var negativeDescription = description.replace('is a', 'is not a');

  return new gjstest.Matcher(
      description,
      negativeDescription,
      function(func) {
        // The argument must be a function that takes no arguments.
        if (!(func instanceof Function)) {
          return 'which is not a function';
        } else if (func.length != 0) {
          return 'which has arity ' + func.length;
        }

        // Run the function and look for an error.
        try {
          func();
        } catch (e) {
          if (re.test('' + e)) return true;

          return 'which threw the wrong error: ' + e;
        }

        return 'which threw no errors';
      }
  );
};
