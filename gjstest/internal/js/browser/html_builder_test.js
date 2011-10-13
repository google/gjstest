// Copyright 2011 Google Inc. All Rights Reserved.
// Author: daved@google.com (Dave Day)
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

// NOTE(daved): We don't test the three static functions HtmlBuilder.find,
// HtmlBuilder.elem and HtmlBuilder.text since they require the browser's global
// document object, and are each ludicrously simple. http://goo.gl/gC2Zz

// A fake, simple instance of the DOM Node class.
function FakeNode() {}
FakeNode.prototype.appendChild = function(childNode) {};
FakeNode.prototype.setAttribute = function(attribute, value) {};
FakeNode.prototype.addEventListener = function(event, fn, capture) {};

// Tests for the HtmlBuilder class.
function HtmlBuilderTest() {}
registerTestSuite(HtmlBuilderTest);

HtmlBuilderTest.prototype.AppendAddsChild = function() {
  var nodeA = gjstest.createMockInstance(FakeNode);
  var nodeB = gjstest.createMockInstance(FakeNode);
  var builderA = new gjstest.internal.HtmlBuilder(nodeA);
  var builderB = new gjstest.internal.HtmlBuilder(nodeB);

  expectCall(nodeA.appendChild)(nodeB);
  var ret = builderA.append(builderB);
  expectThat(ret, equals(builderA));
};

HtmlBuilderTest.prototype.AttrSetsAttribute = function() {
  var node = gjstest.createMockInstance(FakeNode);
  var builder = new gjstest.internal.HtmlBuilder(node);

  expectCall(node.setAttribute)('my_attribute', 'my_value');
  var ret = builder.attr('my_attribute', 'my_value');
  expectThat(ret, equals(builder));
};

HtmlBuilderTest.prototype.TextSetsTextContent = function() {
  var node = new FakeNode();
  var builder = new gjstest.internal.HtmlBuilder(node);

  var ret = builder.text('Set text here');
  expectThat(ret, equals(builder));
  expectThat(node.textContent, equals('Set text here'));
};

HtmlBuilderTest.prototype.AddClassClassNameEmpty = function() {
  var node = new FakeNode();
  node.className = '';
  var builder = new gjstest.internal.HtmlBuilder(node);

  builder.addClass('holly');
  expectThat(node.className, equals('holly'));
};

HtmlBuilderTest.prototype.AddClassClassNameNotEmpty = function() {
  var node = new FakeNode();
  node.className = 'charlie 1611';
  var builder = new gjstest.internal.HtmlBuilder(node);

  builder.addClass('holly');
  expectThat(node.className, equals('charlie 1611 holly'));
};

HtmlBuilderTest.prototype.AddClassClassNameAlreadyContained = function() {
  var node = new FakeNode();
  node.className = 'charlie holly 1611';
  var builder = new gjstest.internal.HtmlBuilder(node);

  builder.addClass('holly');
  expectThat(node.className, equals('charlie holly 1611'));
};

HtmlBuilderTest.prototype.RemoveClassClassNameEmpty = function() {
  var node = new FakeNode();
  node.className = '';
  var builder = new gjstest.internal.HtmlBuilder(node);

  builder.removeClass('holly');
  expectThat(node.className, equals(''));
};

HtmlBuilderTest.prototype.RemoveClassClassNameNotEmpty = function() {
  var node = new FakeNode();
  node.className = 'charlie 1611';
  var builder = new gjstest.internal.HtmlBuilder(node);

  builder.removeClass('holly');
  expectThat(node.className, equals('charlie 1611'));
};

HtmlBuilderTest.prototype.RemoveClassClassNameAlreadyContained = function() {
  var node = new FakeNode();
  node.className = 'charlie holly 1611';
  var builder = new gjstest.internal.HtmlBuilder(node);

  builder.removeClass('holly');
  expectThat(node.className, equals('charlie 1611'));
};

HtmlBuilderTest.prototype.MakeToggleForElem = function() {
  var node = gjstest.createMockInstance(FakeNode);
  node.className = '';
  var builder = new gjstest.internal.HtmlBuilder(node);
  var container = gjstest.createMockInstance(gjstest.internal.HtmlBuilder);

  var eventCallback;
  var captureEventCallback = function(ev, fn, capture) {
    eventCallback = fn;
  };

  // When toggle is called, we expect the event listener to be added and the
  // container hidden.
  expectCall(node.addEventListener)('click', _, false)
    .willOnce(captureEventCallback);
  expectCall(container.addClass)('hidden');

  builder.makeToggleForElem(container);
  expectThat(node.className, equals('collapsed'));

  // Call show to un-hide the container.
  expectCall(container.removeClass)('hidden');
  builder.showContainer();
  expectThat(node.className, equals('expanded'));

  // And call hide to reverse this.
  expectCall(container.addClass)('hidden');
  builder.hideContainer();
  expectThat(node.className, equals('collapsed'));

  // Finally, click the element to observe it toggling.
  expectCall(container.removeClass)('hidden');
  eventCallback();
  expectThat(node.className, equals('expanded'));
  expectCall(container.addClass)('hidden');
  eventCallback();
  expectThat(node.className, equals('collapsed'));
};
