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

var internalExpectThat = gjstest.internal.expectThat;

function ExpectThatTest() {
  this.predicate_ = gjstest.createMockFunction();
  this.matcher_ = new gjstest.Matcher('desc', 'negative desc', this.predicate_);

  this.stringify_ = gjstest.createMockFunction();
  this.reportFailure_ = gjstest.createMockFunction();

  // Ignore calls to stringify by default.
  expectCall(this.stringify_)(_)
    .willRepeatedly(returnWith(''));
}
registerTestSuite(ExpectThatTest);

ExpectThatTest.prototype.CallsMatcher = function() {
  var obj = {};

  expectCall(this.predicate_)(obj)
    .willOnce(returnWith(true));

  internalExpectThat(obj, this.matcher_, this.stringify_, this.reportFailure_);
};

ExpectThatTest.prototype.MatcherSaysYes = function() {
  var obj = {};

  expectCall(this.predicate_)(_)
    .willOnce(returnWith(true));

  expectCall(this.reportFailure_)(_)
    .times(0);

  internalExpectThat(obj, this.matcher_, this.stringify_, this.reportFailure_);
};

ExpectThatTest.prototype.MatcherSaysNo = function() {
  var obj = {};

  expectCall(this.predicate_)(_)
    .willOnce(returnWith(false));

  expectCall(this.stringify_)(obj)
    .willOnce(returnWith('burrito'));

  expectCall(this.reportFailure_)('Expected: desc\nActual:   burrito');

  internalExpectThat(obj, this.matcher_, this.stringify_, this.reportFailure_);
};

ExpectThatTest.prototype.MatcherReturnsString = function() {
  var obj = {};

  expectCall(this.predicate_)(_)
    .willOnce(returnWith('which has too few tacos'));

  expectCall(this.stringify_)(obj)
    .willOnce(returnWith('burrito'));

  expectCall(this.reportFailure_)(
      'Expected: desc\nActual:   burrito, which has too few tacos');

  internalExpectThat(obj, this.matcher_, this.stringify_, this.reportFailure_);
};

ExpectThatTest.prototype.MatcherReturnsStringAndUserGivesErrorMessage =
    function() {
  var obj = {};

  expectCall(this.predicate_)(_)
    .willOnce(returnWith('which has too few tacos'));

  expectCall(this.stringify_)(obj)
    .willOnce(returnWith('burrito'));

  expectCall(this.reportFailure_)(
      'Expected: desc\n' +
          'Actual:   burrito, which has too few tacos\n' +
          'Grande Failure');

  internalExpectThat(
      obj,
      this.matcher_,
      this.stringify_,
      this.reportFailure_,
      'Grande Failure');
};
