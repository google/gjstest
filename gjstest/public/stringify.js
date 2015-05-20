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
 * Given an abitrary object, return a human-readble, 1-line description of that
 * object for use in messages about expectations.
 *
 * Various abbreviations are applied to try to keep the output reasonably
 * compact. Long arrays and deeply nested objects are truncated. Repeated
 * references to the same object are only expanded in the first case. Methods on
 * user-defined classes are not printed.
 *
 * This function makes use of toString methods on the objects it sees, if any.
 * The display of user-defined types may therefore be customised by defining
 * such methods.
 *
 * Note that stringifying very large objects without toString methods (or with
 * expensive toString methods) can be quite slow. Call this function lazily if
 * you can get away with it.
 *
 * @param {*} obj
 * @return {!string}
 */
gjstest.stringify = function(obj) {
  return gjstest.internal.stringifyToDepth(obj, 5);
};


/**
 * @param {*} obj
 * @param {number} depth Depth to which objects should be expanded.
 * @return {!string}
 */
gjstest.internal.stringifyToDepth = function(obj, depth) {
  var naiveResult = '' + obj;

  // Special-case: arrays and arguments should have their values printed:
  //     [ 1, 2, 'foo' ]
  if (obj instanceof Array || naiveResult == '[object Arguments]') {
    var description = new gjstest.internal.ObjectDescriptionBuilder(obj, depth);
    for (var i = 0; i < obj.length; ++i) {
      if (!obj.hasOwnProperty(i)) {
        // Leave a blank space for indexes where there's a missing element.
        description.addRawText('');
      } else {
        description.addArrayElement(i);
      }
    }
    return description.finish('[', ']');
  }

  // Special-case: objects should have their keys and values printed:
  //     { foo: 1, bar: { baz: 'asd' } }
  if (naiveResult == '[object Object]') {
    var description = new gjstest.internal.ObjectDescriptionBuilder(obj, depth);
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) {
        // Ignore inherited properties.
      } else {
        description.addKey(key);
      }
    }
    return description.finish('{', '}');
  }

  // Special-case: strings should be surrounded in quotation marks, and have
  // their newlines converted to \n:
  //     'foo\nbar'
  if (typeof(obj) == 'string') {
    return '\'' + obj.replace(/\n/g, '\\n') + '\'';
  }

  // Special-case: functions should have their names and arguments (if any)
  // printed, but leave off the bodies:
  //     function fooBar()     (named function)
  //     function ()           (anonymous function)
  //
  // Function.prototype.toString returns the exact source of the function, from
  // the 'f' in 'function' to the closing brace of the function body. We'll need
  // to account for potential whitespace around the function name and arguments.
  //     function fooBar(foo, bar) { return 17; }
  //     function() {}
  var functionRegex = /^function(\s+(\w+))?\s*\(\s*(\w+(\s*,\s*\w+)*)?\s*\)/;
  var match, functionName, functionArgs;
  if (match = functionRegex.exec(naiveResult)) {
    functionName = match[2] || '';
    functionArgs = (match[3] || '').replace(/\s*,\s*/g, ', ');
    return 'function ' + functionName + '(' + functionArgs + ')';
  }

  return '' + obj;
};


/**
 * Utility object for constructing a text representation of an object. The
 * output is intended for debugging purposes rather than serialization.
 *
 * Between the contruction of this object and the invocation of its finish()
 * method, a special property '__gjstest_next_object' will exist on any objects
 * whose properties are being added to the description. Its presence indicates
 * that the object has been visited at least once, so that we can skip it on
 * subsequent visits. It also forms a linked list of visited objects, so that
 * finish() can find all modified objects and remove the property.
 *
 * @param {*} parent
 * @param {number} depth Depth to which objects should be expanded.
 * @constructor
 * @struct
 */
gjstest.internal.ObjectDescriptionBuilder = function(parent, depth) {
  this.depth_ = depth;
  this.obj_ = parent;
  this.parts_ = [];
  this.isRoot_ = !parent.__gjstest_next_object;
  if (this.isRoot_) {
    parent.__gjstest_next_object = {};
  }
};


/**
 * Add the element at a given index to the object's description. The object is
 * assumed to be an array.
 *
 * @param {number} index
 */
gjstest.internal.ObjectDescriptionBuilder.prototype.addArrayElement =
    function(index) {
  this.addKeyWithPrefix('' + index, '');
};


/**
 * Add one of the object's properties to the description, with the key name
 * included.
 *
 * @param {string} key
 */
gjstest.internal.ObjectDescriptionBuilder.prototype.addKey = function(key) {
  this.addKeyWithPrefix(key, key + ': ');
};


/**
 * Add one of the parent object's properties as part of the description.
 *
 * @param {string} prefix
 * @param {string} key
 */
gjstest.internal.ObjectDescriptionBuilder.prototype.addKeyWithPrefix =
    function(key, prefix) {
  if (key === '__gjstest_next_object') {
    return;
  }

  // Beyond the depth limit, indicate whether the object is empty but otherwise
  // do not expand its contents.
  if (this.depth_ <= 0) {
    this.parts_[0] = '...';
    return;
  }

  // Truncate long arrays and leave an indicator that elements were removed.
  if (this.parts_.length == 25) {
    this.parts_.push('...');
  }
  if (this.parts_.length > 25) {
    return;
  }

  var child = this.obj_[key];

  // Skip the child if it has already been expanded. Using depth=0 causes
  // arrays to appear as '[]' or '[...]' (depending on whether they are empty)
  // but not to be expanded further.
  if (child && child.__gjstest_next_object) {
    this.parts_.push(prefix + gjstest.internal.stringifyToDepth(child, 0));
    return;
  }

  // If the child can have properties, insert it into the list of seen objects.
  if (child) {
    child.__gjstest_next_object = this.obj_.__gjstest_next_object;
    if (child.__gjstest_next_object) {
      this.obj_.__gjstest_next_object = child;
    }
  }

  this.parts_.push(
      prefix + gjstest.internal.stringifyToDepth(child, this.depth_ - 1));
};


/**
 * Add raw text to the description. It will be separated from other parts of the
 * description by a comma, as if it were a child element.
 *
 * @param {string} text
 */
gjstest.internal.ObjectDescriptionBuilder.prototype.addRawText =
    function(text) {
  this.parts_.push(text);
};


/**
 * Clean up temporary data structures and return the assembled description.
 *
 * @param {string} prefix
 * @param {string} suffix
 * @return {!string}
 */
gjstest.internal.ObjectDescriptionBuilder.prototype.finish =
    function(prefix, suffix) {
  // Clean up the list of visited objects.
  if (this.isRoot_) {
    var obj = this.obj_;
    while (obj) {
      var nextObj = obj.__gjstest_next_object;
      delete obj.__gjstest_next_object;
      obj = nextObj;
    }
  }

  if (this.parts_.length == 0) {
    return prefix + suffix;
  } else if (this.depth_ <= 0) {
    return prefix + '...' + suffix;
  } else {
    return prefix + ' ' + this.parts_.join(', ') + ' ' + suffix;
  }
};
