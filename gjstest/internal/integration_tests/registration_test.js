// Copyright 2011 Google Inc. All Rights Reserved.
// Author: enochlau@google.com (Enoch Lau)
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

// A test file that makes sure test registration works as it should.

function RegistrationTest() {}
registerTestSuite(RegistrationTest);

// Functions without a trailing underscore should not be run as test cases.
RegistrationTest.prototype.helperFunction_ = function() {
  throw new Error('I shouldn\'t have been run!');
};

// The one special name without a trailing underscore is 'tearDown'. It should
// be executed after each test, but not as a test case itself.
RegistrationTest.prototype.tearDown = function() {
  // Create some output to make sure tearDown is run after each case.
  gjstest.log('tearDown has been run.');
};

// A test case with any old name should definitely be run.
RegistrationTest.prototype.FooBar = function() {
};

// Test cases called 'constructor' should be executed, even though this is a
// magic property automatically created on Foo.prototype for any function Foo.
RegistrationTest.prototype.constructor = function() {
  expectTrue(false);
};
