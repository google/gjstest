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

var falsePred = gjstest.evalsToFalse.predicate;
var truePred = gjstest.evalsToTrue.predicate;

///////////////////////////////
// evalsToTrue, evalsToFalse
///////////////////////////////

function EvalsToTrueFalseTest() {}
registerTestSuite(EvalsToTrueFalseTest);

EvalsToTrueFalseTest.prototype.booleans = function() {
  expectFalse(truePred(false));
  expectTrue(falsePred(false));

  expectTrue(truePred(true));
  expectFalse(falsePred(true));
};

EvalsToTrueFalseTest.prototype.nullAndUndefined = function() {
  expectFalse(truePred(null));
  expectTrue(falsePred(null));

  expectFalse(truePred(undefined));
  expectTrue(falsePred(undefined));
};

EvalsToTrueFalseTest.prototype.strings = function() {
  expectFalse(truePred(''));
  expectTrue(falsePred(''));

  expectTrue(truePred(' '));
  expectFalse(falsePred(' '));

  expectTrue(truePred('taco'));
  expectFalse(falsePred('taco'));
};

EvalsToTrueFalseTest.prototype.arrays = function() {
  expectTrue(truePred([]));
  expectFalse(falsePred([]));

  expectTrue(truePred([0]));
  expectFalse(falsePred([0]));

  expectTrue(truePred([1]));
  expectFalse(falsePred([1]));
};

EvalsToTrueFalseTest.prototype.functions = function() {
  expectTrue(truePred(function() {}));
  expectFalse(falsePred(function() {}));

  expectTrue(truePred(function() { return 0; }));
  expectFalse(falsePred(function() { return 0; }));
};

EvalsToTrueFalseTest.prototype.objects = function() {
  expectTrue(truePred({}));
  expectFalse(falsePred({}));

  expectTrue(truePred({ 'foo': 'bar' }));
  expectFalse(falsePred({ 'foo': 'bar' }));
};

EvalsToTrueFalseTest.prototype.descriptions = function() {
  expectEq('evaluates to true', gjstest.evalsToTrue.description);
  expectEq('evaluates to false', gjstest.evalsToTrue.negativeDescription);

  expectEq('evaluates to false', gjstest.evalsToFalse.description);
  expectEq('evaluates to true', gjstest.evalsToFalse.negativeDescription);
};
