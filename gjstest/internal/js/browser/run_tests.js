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

/**
 * Run all registered tests, assuming a browser environment.
 *
 * @param {string} pageTitle
 *      A string to use as a header for the page.
 */
gjstest.internal.runTestsInBrowser = function(pageTitle) {
  document.title = pageTitle;

  var filter = gjstest.internal.browser.filterFromUrlParams_();

  // Iterate through the registered test suites to construct browser-specific
  // test suite and case objects.
  var testSuites = {};
  var allCases = [];
  for (var i = 0; i < gjstest.internal.testSuites.length; ++i) {
    var suiteConstructor = gjstest.internal.testSuites[i];
    var suiteName = suiteConstructor.name;

    var browserSuite = new gjstest.internal.browser.TestSuite(suiteName);
    testSuites[suiteName] = browserSuite;

    // Get all of the test functions for this suite.
    var testFunctions = gjstest.internal.getTestFunctions(suiteConstructor);
    for (var fullName in testFunctions) {
      var testFn = testFunctions[fullName];
      var caseName = gjstest.internal.browser.subtractSuiteName_(suiteName,
                                                              fullName);
      var enabled = !filter || caseName.match(filter);
      var testCase = new gjstest.internal.browser.TestCase(
          caseName, testFn, enabled);
      browserSuite.addTestCase(testCase);
      allCases.push(testCase);
    }
  }

  // Build the page's HTML.
  gjstest.internal.browser.constructPage(pageTitle, testSuites);

  // Run each of the tests.
  var testsRun = 0;
  var testsPassed = 0;
  var runOneTest = function() {
    // Take one test off the list, returning immediately if there are none left.
    var testCase = allCases.shift();
    if (!testCase) return;
    gjstest.internal.browser.runSoon_(function() {
      var passed = testCase.run();
      ++testsRun;
      if (passed) ++testsPassed;
      gjstest.internal.browser.updateStatus(testsRun,
                                         testsPassed,
                                         !allCases.length);
      // Start the next test.
      runOneTest();
    });
  };
  runOneTest();
};


/**
 * The namespace for helper functions and classes for the browser runner.
 */
gjstest.internal.browser = {};

/**
 * A wrapped version of window.setTimeout which always uses delay 0ms. We
 * capture the value of window and setTimeout so that it still works even if the
 * test code modifies/masks setTimeout.
 *
 * @param {Function} fn
 * @private
 */
gjstest.internal.browser.runSoon_ = (function(win) {
  var setTimeout = /** @type {Window} */(win).setTimeout;
  return function(fn) {
    setTimeout.call(win, fn, 0);
  };
})(this);  // Use 'this' as an alias to 'window': it makes the compiler happier.

/**
 * Removes the suite name from the given test name, if it is present.
 * @param {string} suiteName
 * @param {string} fullTestName
 * @private
 */
gjstest.internal.browser.subtractSuiteName_ =
    function(suiteName, fullTestName) {
  var removePrefix = suiteName + '.';
  if (fullTestName.indexOf(removePrefix) == 0) {
    return fullTestName.substr(removePrefix.length);
  }
  return fullTestName;
};


/**
 * Returns the first value of <x> for 'filter=<x>' in the Url paramters,
 * or undefined if no such parameter is present.
 * @return {?RegExp} The filter.
 * @private
 */
gjstest.internal.browser.filterFromUrlParams_ = function() {
  var match = window.location.search.match(/[&?]filter=([^&]*)/);
  return match && new RegExp(decodeURIComponent(match[1]), 'i');
};


/**
 * Construct the core HTML for the page.
 * @param {string} pageName  The title for the page.
 * @param {Object.<gjstest.internal.browser.TestSuite>} testSuites
 */
gjstest.internal.browser.constructPage = function(pageName, testSuites) {
  var $ = gjstest.internal.HtmlBuilder;
  var body = new $(document.body);

  // A header element.
  var header = $.elem('header');
  header.append($.elem('h1').text(pageName));
  header.append($.elem('p')
      .attr('id', 'status')
      .addClass('running')
      .text('0 tests run'));
  header.addClass('title');
  body.append(header);

  // Render each of the test suites.
  for (var suiteName in testSuites) {
    body.append(testSuites[suiteName].renderDom());
  }
};

/**
 * Update the status bar for the page.
 * @param {number} testsRun  The number of tests which have been run.
 * @param {number} testsPassed  The number of tests which passed when run.
 * @param {boolean} done  True iff all available tests have been run.
 */
gjstest.internal.browser.updateStatus = function(testsRun, testsPassed, done) {
  var status = gjstest.internal.HtmlBuilder.find('#status');
  if (done) {
    var allPassed = (testsRun == testsPassed);
    status.removeClass('running').addClass(allPassed ? 'pass' : 'fail');
    status.text(testsPassed + '/' + testsRun + ' tests passed');
  } else {
    var failed = testsRun - testsPassed;
    var text = testsRun + ' test' + (testsRun == 1 ? '' : 's') + ' run';
    text += failed ? (' (' + failed + ' failed)') : ' (all passing)';
    status.text(text);
  }
};

/**
 * Helper function which adds to the log for a test.
 * @param {gjstest.internal.HtmlBuilder} list  The list which contains the log.
 * @param {string} message  The message to add to the log.
 * @param {string} className  The class name to add the log message.
 * @param {string} tagName  The type of element ('pre', 'strong') to encapsulate
 *     the log message.
 */
gjstest.internal.browser.addToLog =
    function(list, message, className, tagName) {
  var $ = gjstest.internal.HtmlBuilder;

  // Construct an element to hold the message, and add it to the list.
  var logElem = $.elem(tagName).addClass(className);
  list.append($.elem('li').append(logElem));

  // Convert the message into text elements, extracting URLs which point to
  // source files where they exist.
  var parts = message.split(/((?:https?|file):\/\/\S*:\d+\b)/);
  for (var i = 0, I = parts.length; i < I; ++i) {
    // Every second part is a URL.
    var part = parts[i];
    if (i % 2) {
      var matches = /(.*\/)([^/:]*)(:\d+)?/.exec(part);
      logElem.append($.elem('a')
                      .attr('href', matches[1] + matches[2])
                      .text(matches[2] + matches[3] || ''));
    } else if (part) {
      logElem.append($.text(part));
    }
  }
};


/**
 * A class which encapsulates the DOM and behaviour for a single test case.
 *
 * @param {string} testName
 * @param {function()} testFn
 *     The test function for this case, as returned by
 *     gjstest.internal.getTestFunctions.
 * @param {boolean} enabled
 *     True if the function is intended to be run (e.g. not disabled by the
 *     ?filter= URL parameter.
 *
 * @constructor
 */
gjstest.internal.browser.TestCase = function(testName, testFn, enabled) {
  this.testName_ = testName;
  this.testFn_ = testFn;
  this.enabled_ = enabled;
  this.logElem_ = null;
  this.headerElem_ = null;
};

/**
 * Render the DOM for this particular test case.
 * @returns {gjstest.internal.HtmlBuilder}  The DOM of this test case.
 */
gjstest.internal.browser.TestCase.prototype.renderDom = function() {
  var $ = gjstest.internal.HtmlBuilder;
  var article = $.elem('article');
  this.headerElem_ = $.elem('h1').text(this.testName_);
  article.append($.elem('header').append(this.headerElem_));
  article.addClass('test-case');

  this.logElem_ = $.elem('ol').addClass('test-log');
  var runOnlyLink = $.elem('a').text('Re-run this test by itself').attr('href',
      window.location.href.replace(
      /(\?.*$|$)/, '?filter=^' + this.testName_ + '$'));
  this.logElem_.append(runOnlyLink);
  article.append(this.logElem_);

  this.headerElem_.makeToggleForElem(this.logElem_);
  return article;
};

/**
 * Invoke this test case.
 * @returns {boolean} True if the test passed.
 */
gjstest.internal.browser.TestCase.prototype.run = function() {
  var $ = gjstest.internal.HtmlBuilder;
  if (!this.enabled_) {
    this.headerElem_.addClass('skip');
    return true;
  }
  this.headerElem_.addClass('running');

  // Set up a test environment that knows how to log and report failures.
  var logElem = this.logElem_;
  var headerElem = this.headerElem_;
  var failure = false;

  var reportFailure = function(message) {
    failure = true;
    headerElem.showContainer();
    gjstest.internal.browser.addToLog(logElem, message, 'fail', 'pre');
  };

  var log = function(message) {
    gjstest.internal.browser.addToLog(logElem, message, 'info', 'pre');
  };

  var testEnvironment =
      new gjstest.internal.TestEnvironment(
          log,
          reportFailure,
          gjstest.internal.getCurrentStack);

  // Run the test.
  try {
    gjstest.internal.runTest(this.testFn_, testEnvironment);
  } catch (error) {
    testEnvironment.reportFailure(gjstest.stringify(error));
  }

  // Update the UI with the result.
  var className = failure ? 'fail' : 'pass';
  var status = failure ? 'FAILED' : 'PASSED';
  gjstest.internal.browser.addToLog(logElem, status, className, 'strong');
  this.headerElem_.removeClass('running');
  this.headerElem_.addClass(className);

  return !failure;
};


/**
 * A class which encapsulates the DOM for a test suite (collection of test
 * cases).
 * @param {string} suiteName
 * @constructor
 */
gjstest.internal.browser.TestSuite = function(suiteName) {
  this.suiteName_ = suiteName;
  this.testCases_ = [];
};

/**
 * Adds a test case as the child of this suite.
 * @param {gjstest.internal.browser.TestCase} testCase
 */
gjstest.internal.browser.TestSuite.prototype.addTestCase = function(testCase) {
  this.testCases_.push(testCase);
};

/**
 * Renders the DOM for this test suite
 * @returns {gjstest.internal.HtmlBuilder}  The DOM of this test suite.
 */
gjstest.internal.browser.TestSuite.prototype.renderDom = function() {
  var $ = gjstest.internal.HtmlBuilder;
  var section = $.elem('section');
  var h1 = $.elem('h1').text(this.suiteName_);
  section.append($.elem('header').append(h1));
  section.addClass('test-suite');

  // Add all the individual test cases.
  for (var i = 0, testCase; testCase = this.testCases_[i]; ++i) {
    section.append(testCase.renderDom());
  }
  return section;
};
