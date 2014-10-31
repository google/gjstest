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
// throwsError
////////////////////////////////////////////////////////////////////////

function ThrowsErrorTest() {}
registerTestSuite(ThrowsErrorTest);

ThrowsErrorTest.prototype.WrongTypeArgs = function() {
  var error;

  function getError(arg) {
    try {
      throwsError(arg);
    } catch (e) {
      return e;
    }

    return null;
  }

  error = getError(null);
  expectThat(error.toString(), hasSubstr('TypeError'));
  expectThat(error.toString(), hasSubstr('throwsError'));
  expectThat(error.toString(), hasSubstr('RegExp'));

  error = getError('taco');
  expectThat(error.toString(), hasSubstr('TypeError'));
  expectThat(error.toString(), hasSubstr('throwsError'));
  expectThat(error.toString(), hasSubstr('RegExp'));

  error = getError(17);
  expectThat(error.toString(), hasSubstr('TypeError'));
  expectThat(error.toString(), hasSubstr('throwsError'));
  expectThat(error.toString(), hasSubstr('RegExp'));
};

ThrowsErrorTest.prototype.NonFunctionCandidates = function() {
  var pred = throwsError(/.*/).predicate;

  expectEq('which is not a function', pred(null));
  expectEq('which is not a function', pred(undefined));
  expectEq('which is not a function', pred(17));
  expectEq('which is not a function', pred('taco'));
  expectEq('which is not a function', pred({}));
};

ThrowsErrorTest.prototype.WrongArityCandidates = function() {
  var pred = throwsError(/.*/).predicate;

  expectEq('which has arity 1', pred(function(foo) {}));
  expectEq('which has arity 2', pred(function(foo, bar) {}));
};

ThrowsErrorTest.prototype.NoError = function() {
  var pred = throwsError(/.*/).predicate;
  expectEq('which threw no errors', pred(function() {}));
};

ThrowsErrorTest.prototype.NonMatchingError = function() {
  var pred = throwsError(/taco/).predicate;
  var func = function() { throw new TypeError('burrito'); };

  expectEq('which threw the wrong error: TypeError: burrito', pred(func));
};

ThrowsErrorTest.prototype.MatchingError = function() {
  var pred = throwsError(/TypeError.*taco/).predicate;
  var func = function() { throw new TypeError('burritos and tacos'); };

  expectTrue(pred(func));
};

ThrowsErrorTest.prototype.Descriptions = function() {
  var matcher = throwsError(/taco/);

  expectEq('is a function that throws an error matching /taco/',
           matcher.getDescription());

  expectEq('is not a function that throws an error matching /taco/',
           matcher.getNegativeDescription());
};
