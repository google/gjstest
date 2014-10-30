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

////////////////////////////////////////////////////////////////////////
// notPresent
////////////////////////////////////////////////////////////////////////

function NotPresentTest() {}
registerTestSuite(NotPresentTest);

NotPresentTest.prototype.UnderstandsMissingArgs = function() {
  expectTrue(notPresent.understandsMissingArgs);
};

NotPresentTest.prototype.MatchesMissingArgs = function() {
  var pred = notPresent.predicate;
  expectTrue(pred(gjstest.missingArgSentinel));
};

NotPresentTest.prototype.DoesntMatchAnythingElse = function() {
  var pred = notPresent.predicate;

  expectFalse(pred(undefined));
  expectFalse(pred(null));
  expectFalse(pred(false));
  expectFalse(pred(0));
  expectFalse(pred(17));
  expectFalse(pred(''));
  expectFalse(pred('taco'));
  expectFalse(pred({}));
  expectFalse(pred([]));
  expectFalse(pred(['taco']));
  expectFalse(pred(function() {}));
};

NotPresentTest.prototype.Description = function() {
  expectEq('is not present', notPresent.getDescription());
  expectEq('is present', notPresent.getNegativeDescription());
};

////////////////////////////////////////////////////////////////////////
// maybePresent
////////////////////////////////////////////////////////////////////////

function MaybePresentTest() {}
registerTestSuite(MaybePresentTest);

MaybePresentTest.prototype.UnderstandsMissingArgs = function() {
  expectTrue(maybePresent.understandsMissingArgs);
};

MaybePresentTest.prototype.MatchesEverything = function() {
  var pred = maybePresent.predicate;

  expectTrue(pred(undefined));
  expectTrue(pred(null));
  expectTrue(pred(0));
  expectTrue(pred(17));
  expectTrue(pred('taco'));
  expectTrue(pred({}));
  expectTrue(pred([]));
  expectTrue(pred(['taco']));
  expectTrue(pred(function() {}));
};

MaybePresentTest.prototype.Description = function() {
  expectEq('is anything, or is not present', maybePresent.getDescription());
};
