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
// returnWith
////////////////////////////////////////////////////////////////////////

function ReturnWithTest() {}
registerTestSuite(ReturnWithTest);

ReturnWithTest.prototype.ReturnsArg = function() {
  expectEq('taco', returnWith('taco')());
  expectEq(2, returnWith(2)());
  expectEq(null, returnWith(null)());
};

////////////////////////////////////////////////////////////////////////
// doAll
////////////////////////////////////////////////////////////////////////

function DoAllTest() {}
registerTestSuite(DoAllTest);

DoAllTest.prototype.ArgNotArray = function() {
  expectThat(function() { doAll(17); }, throwsError(/TypeError.*doAll.*array/));
};

DoAllTest.prototype.NoActions = function() {
  expectThat(function() { doAll([]); }, throwsError(/doAll.*non-empty/));
};

DoAllTest.prototype.CallsActionsWithCorrectArgs = function() {
  var wrapped1 = createMockFunction('wrapped1');
  var wrapped2 = createMockFunction('wrapped2');
  var wrapped3 = createMockFunction('wrapped3');

  var action = doAll([wrapped1, wrapped2, wrapped3]);

  expectCall(wrapped1)('taco', 17, undefined);
  expectCall(wrapped2)('taco', 17, undefined);
  expectCall(wrapped3)('taco', 17, undefined);

  action('taco', 17, undefined);
};

DoAllTest.prototype.ReturnsLastReturnValue = function() {
  var action = doAll([returnWith(17), returnWith(19), returnWith(23)]);

  expectEq(23, action());
};

DoAllTest.prototype.SetsAppropriateThis = function() {
  var suppliedThis = undefined;
  function recordThis() { suppliedThis = this; }

  var action = doAll([recordThis]);

  var expectedThis = {};
  action.apply(expectedThis);

  expectEq(expectedThis, suppliedThis);
};
