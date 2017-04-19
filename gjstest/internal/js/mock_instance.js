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

// NOTE(jacobsa): Here's a lecture on prototypical inheritance, because I surely
// will have forgotten the details by the time I come back to this code. Maybe
// you'll find it useful too. It's actually a very simple and beautiful concept
// once you get your head around it. But JavaScript doesn't make that easy, with
// its half-assed and perhaps misguided attempt at emulating class-based object
// oriented programming.
//
// In class-based inheritance there are classes, which define behavior and a
// structure for data, and there are instances of those classes, which contain
// the actual data. When you call a method on the instance, you're actually
// calling a function that's part of the shared class and passing it the
// instance's data.
//
// In JavaScript there are no classes, only objects. Objects are a map from
// keys (which are string names, also known as 'properties') to values, which
// can include references to functions and other objects. A function is
// actually a type of object, and can have properties set on it as well.
//
// An object may have a 'prototype'. The idea is that you set up a prototypical
// object that has a bunch of common properties, then clone it to create other
// objects that share some or all of them. When you look up a property that
// doesn't exist on that object, you get the prototype's property if it has one.
//
// In technical terms, when you look up a property 'foo' on an object x, you
// follow this algorithm:
//
//  1. If a value for 'foo' has been explicitly set on x, return that value.
//  2. If x has no prototype, return undefined.
//  3. Return the result of looking up 'foo' on x's prototype.
//
// That is, x delegates to its prototype any lookups for properties it doesn't
// have. The prototype itself may have a prototype, in which case the chain goes
// on. undefined is returned if you reach the end of the prototype chain without
// finding a value.
//
// This is a powerful concept, but JavaScript is weird and doesn't expose it
// directly. That is, there is no primitive for creating an x given a prototype
// y. Instead it exposes this mechanism: given a function Foo, the following
// code:
//
//     foo = new Foo(...);
//
// causes this to happen:
//
//  1. Assign to foo an empty object, and set its prototype to Foo.prototype --
//     that is, the property 'prototype' on Foo. (Remember, functions are also
//     maps and may have properties.)
//
//  2. Invoke the following code:
//
//         Foo.apply(foo, [...]);
//
//     That is, run the function Foo with 'this' set to the newly created
//     object.
//
// The confusing thing here is that Foo.prototype is *not* the prototype of Foo,
// but rather the prototype of objects constructed using 'new Foo()'.
// 'Foo.prototype.isPrototypeOf(Foo)' is false, which is weird, to say the
// least.
//
// The intention is to support something like classes. Foo is the analogue of a
// constructor, Foo.prototype of a class, and foo an instance of Foo. By
// default, one may look up from foo all and only the properties that are on
// Foo.prototype. The constructor can set further properties, which are like
// instance variables. It can even override ones in the prototype, which makes
// this different from straight-up classes.
//
// Inheritance can be emulated by making a function Bar, with Bar.prototype
// being an object whose prototype is Foo.prototype. Then lookups for properties
// on an instance of Bar will first check the local object, then the Bar class,
// then the Foo class. (Keep in mind though that classes and instances aren't a
// thing in JS; they're just emulated by this convention.  Prototypes can be
// used in arbitrary ways.)
//
// For example:
//
//     function Person(name) {
//       this.name_ = name;
//     }
//
//     Person.prototype.getName = function() {
//       return this.name_;
//     }
//
//     function Employee(name, idNumber) {
//       // Set up this object's properties as if it were a Person.
//       Person.apply(this, [name]);
//
//       // Now make additional modifications.
//       this.idNumber_ = idNumber;
//     }
//
//     // Set Employee.prototype to be an object whose prototype is
//     // Person.prototype, using the mechanism above. In order to do this we'd
//     // need to call 'new Person()', but we don't want to do that in case it
//     // requires its argument to be present. So create another function with
//     // the same prototype but no behavior, and call it instead. See what
//     // hoops JavaScript makes us jump through?
//     function Tmp() {}
//     Tmp.prototype = Person.prototype;
//     Employee.prototype = new Tmp();
//
//     // Now we can add further properties to Employee.prototype. Then if we
//     // have an employee object without a property 'foo', we'll first look for
//     // 'foo' in the Employee prototype, then the Person one.
//     Employee.prototype.getIdNumber = function() {
//       return this.idNumber_;
//     }
//

/**
 * Create an object that uses the supplied object as a prototype, and overrides
 * each of its function properties with mock functions.
 *
 * @param {!Object} prototype
 *
 * @param {string} baseName
 *     A base name for the resulting mock methods.
 *
 * @param {!function(string):function()} createMockFunction
 *     A function that knows how to create mock functions.
 *
 * @return {!Object}
 *
 * @private
 */
gjstest.internal.createMockOfPrototype_ =
    function(prototype, baseName, createMockFunction) {
  // Use the trick documented above to create an object with the appropriate
  // prototype.
  /** @constructor */
  function Tmp() {}
  Tmp.prototype = prototype;
  var result = new Tmp;

  // Mock each function in the prototype.
  for (var name of gjstest.internal.getAllPrototypeProperties_(Tmp.prototype)) {
    // Avoid mocking out the 'constructor' property.
    if (name == 'constructor' || typeof(result[name]) != 'function') continue;

    result[name] = createMockFunction(baseName + '.' + name);
  }

  return result;
};

/**
 * Object.getOwnPropertyNames does not include inherited methods. This method
 * crawls up the inheritance chain and records all properties.
 *
 * @param {?Object} obj
 *
 * @return {!Array<string>}
 *
 * @private
 */
gjstest.internal.getAllPrototypeProperties_ = function(obj) {
  var props = {};

  while(obj) {
    var nextObj = Object.getPrototypeOf(obj);

    // We've reached the base Object - break.
    if (!nextObj) break;

    Object.getOwnPropertyNames(obj).forEach(function(p) {
      props[p] = true;
    });

    obj = nextObj;
  }

  return Object.getOwnPropertyNames(props);
};

/**
 * Given a constructor for a class, create an instance of that class that has
 * mock functions for each of the class's prototype methods.
 *
 * @param {!Function} ctor
 *
 * @param {!function():function()} createMockFunction
 *     A function that knows how to create mock functions.
 *
 * @return {!Object}
 */
gjstest.internal.createMockInstance = function(ctor, createMockFunction) {
  // Make sure this is a function.
  if (typeof(ctor) != 'function') {
    throw new TypeError('createMockInstance requires a function.');
  }

  return gjstest.internal.createMockOfPrototype_(
      ctor.prototype,
      ctor.name,
      createMockFunction);
};
