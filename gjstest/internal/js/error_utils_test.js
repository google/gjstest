// Copyright 2018 Google Inc. All Rights Reserved.
// Author: eschoeffler@google.com (Eric Schoeffler)
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
//
function ErrorUtilsTest() {}
registerTestSuite(ErrorUtilsTest);

ErrorUtilsTest.prototype.FallsBackOnEvalOrigin = function() {
  var errorStack = gjstest.internal.getErrorStack(/** @type {!Error} */ ({
    stack: 'formatted stack',
    structuredStack: [
      new FakeCallSite('', 'evalfoobar.js', 11),
      new FakeCallSite('foobar.js', 'evalfoobar.js', 11),
      new FakeCallSite('foobar.js', '', 11)
    ]
  }));

  expectEq('evalfoobar.js', errorStack[0].fileName);
  expectEq('foobar.js', errorStack[1].fileName);
  expectEq('foobar.js', errorStack[2].fileName);
};

/**
 * @param {string} fileName
 * @param {string} evalOrigin
 * @param {number} lineNumber
 * @constructor
 */
function FakeCallSite(fileName, evalOrigin, lineNumber) {
  this.fileName_ = fileName;
  this.evalOrigin_ = evalOrigin;
  this.lineNumber_ = lineNumber;
};

/** @return {string} */
FakeCallSite.prototype.getFileName = function() {
  return this.fileName_;
};

/** @return {string} */
FakeCallSite.prototype.getEvalOrigin = function() {
  return this.evalOrigin_;
};

/** @return {string} */
FakeCallSite.prototype.getLineNumber = function() {
  return this.lineNumber_;
};

/** @return {boolean} */
FakeCallSite.prototype.isNative = function() {
  return false;
};
