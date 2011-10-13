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
 * Match strings that fit the supplied regular expression, without an implied
 * anchor to the start and end of the string. That is, /a/ matches 'bar'.
 *
 * @param {RegExp} re
 * @return {!gjstest.Matcher}
 */
gjstest.containsRegExp = function(re) {
  if (!(re instanceof RegExp)) {
    throw new TypeError('containsRegExp requires a RegExp argument.');
  }

  return new gjstest.Matcher(
      'partially matches regex: ' + re,
      'doesn\'t partially match regex: ' + re,
      function(candidate) {
        if (typeof(candidate) != 'string') {
          return 'which is not a string';
        }

        return re.test(candidate);
      }
  );
};

/**
 * Match strings containing the supplied substring.
 *
 * @param {string} substr
 * @return {!gjstest.Matcher}
 */
gjstest.hasSubstr = function(substr) {
  if (typeof(substr) != 'string') {
    throw new TypeError('hasSubstr requires a string argument.');
  }

  return new gjstest.Matcher(
      'is a string containing the substring ' + gjstest.stringify(substr),
      'is not a string containing the substring ' + gjstest.stringify(substr),
      function(candidate) {
        if (typeof(candidate) != 'string') {
          return 'which is not a string';
        }

        return candidate.indexOf(substr) != -1;
      }
  );
};
