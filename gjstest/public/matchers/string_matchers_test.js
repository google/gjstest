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

//////////////////////
// containsRegExp
//////////////////////

function ContainsRegExpTest() {}
registerTestSuite(ContainsRegExpTest);

ContainsRegExpTest.prototype.nonStrings = function() {
  var pred = containsRegExp(/.+taco.*/).predicate;

  expectFalse(pred(null));
  expectFalse(pred(undefined));
  expectFalse(pred(false));
  expectFalse(pred(0));
  expectFalse(pred(17));
  expectFalse(pred([]));
  expectFalse(pred(function() {}));
};

ContainsRegExpTest.prototype.nonMatchingStrings = function() {
  var pred = containsRegExp(/.+taco.*/).predicate;

  expectFalse(pred(''));
  expectFalse(pred('taco'));
  expectFalse(pred('asd tac'));
};

ContainsRegExpTest.prototype.matchingStrings = function() {
  var pred = containsRegExp(/.+taco.*/).predicate;

  expectTrue(pred('1taco'));
  expectTrue(pred('blah taco blah'));
};

ContainsRegExpTest.prototype.partialMatch = function() {
  var pred = containsRegExp(/t.*o/).predicate;

  expectTrue(pred('to'));
  expectTrue(pred('taco'));
  expectTrue(pred('burrito and taco filling'));
};

ContainsRegExpTest.prototype.anchoredToEdges = function() {
  var pred = containsRegExp(/^t.*o$/).predicate;

  expectTrue(pred('to'));
  expectTrue(pred('taco'));
  expectFalse(pred('burrito and taco filling'));
};

ContainsRegExpTest.prototype.description = function() {
  var matcher = containsRegExp(/.+taco.*/);
  expectEq('partially matches regex: /.+taco.*/', matcher.description);
  expectEq('doesn\'t partially match regex: /.+taco.*/',
           matcher.negativeDescription);
};
