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

// The HtmlBuilder object is a useful tool for creating, finding and modifying
// DOM elements. It is similar to frameworks like jQuery, but it is optimised
// only for modern (Chrome-ish) browsers and is less magical.

/**
 * The HTML builder object, wrapping a single node.
 *
 * @param {Node} node
 *     The node to wrap.
 *
 * @constructor
 */
gjstest.internal.HtmlBuilder = function(node) {
  this.node_ = node;
}


/**
 * Returns a new HtmlBuilder by finding an element in the DOM which corresponds
 * to the given CSS expression.
 *
 * @param {string} css  A CSS expression to location an element.
 *
 * @return {gjstest.internal.HtmlBuilder}
 *     An HTML builder for the first matched element, or null if no elements
 *     matched.
 */
gjstest.internal.HtmlBuilder.find = function(css) {
  var nodes = document.querySelectorAll(css);
  return nodes.length ? new gjstest.internal.HtmlBuilder(nodes[0]) : null;
};

/**
 * Returns a new HtmlBuilder for a newly constructed element of the specified
 * type.
 *
 * @param {string} tagName
 *
 * @return {!gjstest.internal.HtmlBuilder}
 */
gjstest.internal.HtmlBuilder.elem = function(tagName) {
  return new gjstest.internal.HtmlBuilder(document.createElement(tagName));
};

/**
 * Returns a new HtmlBuilder for a newly construct text node.
 *
 * @param {string} text
 *
 * @return {!gjstest.internal.HtmlBuilder}
 */
gjstest.internal.HtmlBuilder.text = function(text) {
  return new gjstest.internal.HtmlBuilder(document.createTextNode(text));
};


/**
 * Appends as the last child.
 *
 * @param {gjstest.internal.HtmlBuilder} child
 *
 * @return {gjstest.internal.HtmlBuilder}
 *     This builder, to allow chaining.
 */
gjstest.internal.HtmlBuilder.prototype.append = function(child) {
  this.node_.appendChild(child.node_);
  return this;
};


/**
 * Sets the text content of the given node.
 *
 * @param {string} text
 *
 * @return {gjstest.internal.HtmlBuilder}
 *     This builder, to allow chaining.
 */
gjstest.internal.HtmlBuilder.prototype.text = function(text) {
  this.node_.textContent = text;  // NOTE(daved): IE<9 should use .innerText.
  return this;
};


/**
 * Sets an attribute of the given node.
 *
 * @param {string} attr
 *
 * @param {string} value
 *
 * @return {gjstest.internal.HtmlBuilder}
 *     This builder, to allow chaining.
 */
gjstest.internal.HtmlBuilder.prototype.attr = function(attr, value) {
  this.node_.setAttribute(attr, value);
  return this;
};


/**
 * Adds the given classname as one of the classes of the node.
 *
 * @param {string} className
 *
 * @return {gjstest.internal.HtmlBuilder}
 *     This builder, to allow chaining.
 */
gjstest.internal.HtmlBuilder.prototype.addClass = function(className) {
  var classes = this.node_.className ? this.node_.className.split(/\s+/) : [];
  if (classes.indexOf(className) < 0) {
    classes.push(className);
    this.node_.className = classes.join(' ');
  }
  return this;
};


/**
 * Removes the given classname from the classes of the node.
 *
 * @param {string} className
 *
 * @return {gjstest.internal.HtmlBuilder}
 *     This builder, to allow chaining.
 */
gjstest.internal.HtmlBuilder.prototype.removeClass = function(className) {
  var classes = this.node_.className ? this.node_.className.split(/\s+/) : [];
  var index = classes.indexOf(className);
  if (index >= 0) {
    classes.splice(index, 1);
    this.node_.className = classes.join(' ');
  }
  return this;
};


/**
 * Makes this node act as a show/hide toggle for another element, which will be
 * initially hidden. This HTMLBuilder object will be decorated with two utility
 * methods: showContainer and hideContainer.
 *
 * @param {gjstest.internal.HtmlBuilder} container
 *     The node to show/hide.
 */
gjstest.internal.HtmlBuilder.prototype.makeToggleForElem = function(container) {
  var hidden;
  var me = this;  // To allow it to be accessed in the closures below.
  me.showContainer = function() {
    hidden = false;
    me.removeClass('collapsed').addClass('expanded');
    container.removeClass('hidden');
  };
  this.hideContainer = function() {
    hidden = true;
    me.addClass('collapsed').removeClass('expanded');
    container.addClass('hidden');
  };
  me.hideContainer();
  me.node_.addEventListener('click', function() {
    if (hidden) {
      me.showContainer();
    } else {
      me.hideContainer();
    }
  }, false);
};
