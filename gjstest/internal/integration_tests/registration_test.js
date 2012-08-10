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


////////////////////////////////////////////////////////////////////////
// Registration with helper
////////////////////////////////////////////////////////////////////////

function HelperRegistrationTest() {}
registerTestSuite(HelperRegistrationTest);

// Functions without a trailing underscore should not be run as test cases.
HelperRegistrationTest.prototype.helperFunction_ = function() {
  throw new Error('I shouldn\'t have been run!');
};

// The one special name without a trailing underscore is 'tearDown'. It should
// be executed after each test, but not as a test case itself.
HelperRegistrationTest.prototype.tearDown = function() {
  // Create some output to make sure tearDown is run after each case.
  gjstest.log('tearDown has been run.');
};

// A test case with any old name should definitely be run.
addTest(HelperRegistrationTest, function FooBar() {
  expectTrue(false);
});

// Explicitly adding a test case with the name 'constructor' should work.
addTest(HelperRegistrationTest, function constructor() {
  expectTrue(false);
});

// Explicitly adding a test case with the name 'hasOwnProperty' should work.
addTest(HelperRegistrationTest, function hasOwnProperty() {
  expectTrue(false);
});

// Explicitly adding a test case with the name 'propertyIsEnumerable' should
// work.
addTest(HelperRegistrationTest, function propertyIsEnumerable() {
  expectTrue(false);
});

// Explicitly adding a test case with the name 'prototype' should work.
addTest(HelperRegistrationTest, function prototype() {
  expectTrue(false);
});


////////////////////////////////////////////////////////////////////////
// Registration without helper
////////////////////////////////////////////////////////////////////////

function BareRegistrationTest() {}
registerTestSuite(BareRegistrationTest);

// Functions without a trailing underscore should not be run as test cases.
BareRegistrationTest.prototype.helperFunction_ = function() {
  throw new Error('I shouldn\'t have been run!');
};

// The one special name without a trailing underscore is 'tearDown'. It should
// be executed after each test, but not as a test case itself.
BareRegistrationTest.prototype.tearDown = function() {
  // Create some output to make sure tearDown is run after each case.
  gjstest.log('tearDown has been run.');
};

// A test case with any old name should definitely be run.
BareRegistrationTest.prototype.FooBar = function() {
};

// A non-enumerable function should not be called. This function is non-emurable
// because BareRegistrationTest.prototype already automatically contains a
// non-enumerable property called 'constructor'.
BareRegistrationTest.prototype.constructor = function() {
  throw new Error('I shouldn\'t have been run!');
};
