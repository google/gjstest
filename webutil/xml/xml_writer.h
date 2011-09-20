// Copyright 2006 Google Inc. All Rights Reserved.
// Author: bmcquade@google.com (Bryan McQuade)
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

// XmlWriter is a lightweight wrapper class that provides a C++
// interface to libxml2. XmlWriter supports namespaces by
// automatically assigning a unique namespace prefix to each distinct
// namespace URI. This class is based on an earlier implementation by
// Greg Badros.
//
// N.B., you must restrict yourself to 7-bit ASCII characters in XML
// element and attribute names.  That restriction is not fundamental,
// but it seems reasonable and lets us ignore converting those strings
// to UTF-8. Upon breaking this invariant, libxml2 will complain like
// so:
//
// output conversion failed due to conv error
// Bytes: 0xA0 0x6E 0x6F 0x72
// I/O error : encoder error
//
// Data (between elements), attribute values, and comments can contain
// any valid sequence of bytes for the specified input_encoding.
//
// N.B., it is an error to add an attribute after adding a child
// element. libxml2 does not support it. See comments in xml_writer.cc
// around last_was_push_ for more information.
//
// N.B., non 7-bit ASCII characters in attribute values will be
// escaped to hex references (such as &#xF6;). This doesn't seem to be
// required by the standard, but libxml doesn't provide a way to turn
// this off. If we need to change this, the code to modify is in
// xmlsave.c function xmlAttrSerializeTxtContent. The last call to
// xmlSerializeHexCharRef could be changed to just output the valid
// UTF-8, for example.

#ifndef WEBUTIL_XML_XML_WRITER_H_
#define WEBUTIL_XML_XML_WRITER_H_

#include <string>

#include "base/basictypes.h"
#include "base/macros.h"

// some forward declaration trickery to prevent us from having to
// include libxml2's xmlwriter.h in our header.
typedef struct _xmlBuffer xmlBuffer;
typedef struct _xmlTextWriter xmlTextWriter;
typedef struct _xmlCharEncodingHandler xmlCharEncodingHandler;
typedef unsigned char xmlChar;

namespace webutil_xml {
// The XmlWriter class's lifecycle is: instantiate, start document,
// add elements, attributes, and data, end document, get content,
// optionally repeat any number of times from start document, and
// finally destroy. XmlWriter supports namespaces, but can also be
// used to generate XML that doesn't use namespaces. See the
// NamespaceExamples in the unittest file for examples. For a primer
// on XML namespaces, see: http://www.w3.org/TR/REC-xml-names/.
class XmlWriter {
 public:
  // the XML namespace URI (always mapped to the prefix 'xml')
  static const char * const kXmlNamespaceURI;

  // Construct the XML writer, using the specified output encoding.
  explicit XmlWriter(const char *output_encoding);

  // Set pretty-printing to true to enable automatic new-lines and indentation
  // in the output.
  XmlWriter(const char *output_encoding, bool pretty_print);

  virtual ~XmlWriter();

  // Call once at the start of a document. You must call this
  // immediately after constructing the XmlWriter. It is also safe to
  // call StartDocument() at any time to discard the content
  // accumulated so far and start from scratch. You can safely reuse
  // the same XmlWriter instance by calling StartDocument() once for
  // each document.
  //
  // input_encoding: the character encoding of the content passed into
  // the XmlWriter (via AddAttribute, Data, WriteComment).
  void StartDocument(const char *input_encoding);
  void StartDocument(const string &input_encoding) {
    StartDocument(input_encoding.c_str());
  }

  // Call once at the end of a document to close any open elements and
  // flush all content to the character buffer. Also appends a single
  // newline to the end of the buffer.
  void EndDocument();

  // Return the document written so far. The returned char * points to
  // the internal buffer and is no longer valid after the containing
  // XmlWriter is modified (an element/data/attribute is added,
  // etc). Make a copy of the string if you need it to last longer.
  const char *GetContent() const;

  // Return the length of the document written so far.
  size_t GetContentLength() const;

  // Call for each open tag. This is the non-namespace version. If you
  // need to associate a namespace with the element, see the namespace
  // versions, below. Each call to StartElement() should have a
  // corresponding call to EndElement().
  void StartElement(const char *name) { StartElement(name, NULL); }
  void StartElement(const string &name) { StartElement(name.c_str()); }

  // Call to close the currently open element.
  void EndElement();

  // Call after StartElement to add an attribute to the currently open
  // element. This is the non-namespace version. If you need to
  // associate a namespace with the element, see the namespace
  // versions, below.
  //
  // Note that characters in the value that are outside of 7-bit ASCII
  // will be escaped to hex references.
  //
  // Note that you must call AddAttribute before adding any child
  // elements or data, otherwise your attribute will not be added.
  void AddAttribute(const char *name, const char *value) {
    AddAttribute(name, NULL, value);
  }

  void AddAttribute(const char *name, const string &value) {
    AddAttribute(name, value.c_str());
  }

  void AddAttribute(const char *name, int value) {
    AddAttribute(name, NULL, value);
  }

  void AddAttribute(const char *name, bool value) {
    AddAttribute(name, NULL, value);
  }

  template<typename T> void AddAttribute(const string &name,
                                         const T &value) {
    AddAttribute(name.c_str(), value);
  }

  // Call to add literal data to the currently open element.
  void Data(const char *s) { Data(s, NULL); }
  void Data(const string &s) {   Data(s.c_str()); }
  void Data(int i) { Data(i, NULL); }
  void Data(bool b) { Data(b, NULL); }

  // Writes the specified string as a CData section. Call after adding
  // all attributes (this includes calling DeclareNamespaceURI(),
  // since DeclareNamespaceURI() adds an attribute), but before adding
  // any child elements or literal data. If you call WriteCData() at
  // any other point, the output will be incorrect (either missing
  // attributes, missing CData, or missing literal content). Also, you
  // may only call WriteCData() once per element. This is all due to
  // bugs in libxml2's xmlwriter.
  //
  // For example:
  // mywriter.StartElement("root");
  // mywriter.AddAttribute("attr", "val");
  // mywriter.DeclareNamespaceURI("http://foo.com/nsuri");
  // mywriter.WriteCData("somecdata");
  // mywriter.Data(4);
  void WriteCData(const char *s);
  void WriteCData(const string &s) { WriteCData(s.c_str()); }

  // Call to insert a newline. Beware that this does not work when not
  // inside an element (e.g., immediately after the XML declaration
  // but before the first start element). Calling this is equivalent
  // to calling Data("\n").
  void Newline();

  // Call to generate a comment.
  void WriteComment(const char *comment);
  void WriteComment(const string &comment) { WriteComment(comment.c_str()); }

  // Helper function to generate an element w/o attributes and the
  // given literal data as its contents.
  void DataElement(const char *name, const char *value) {
    DataElement(name, NULL, value);
  }

  void DataElement(const char *name, const string &value) {
    DataElement(name, value.c_str());
  }

  void DataElement(const char *name, int value) {
    DataElement(name, NULL, value);
  }

  void DataElement(const char *name, bool value) {
    DataElement(name, NULL, value);
  }

  template<typename T> void DataElement(const string &name,
                                        const T &value) {
    DataElement(name.c_str(), value);
  }

  // The number of parent elements from the current element to the
  // document root, including this element. This function is intended
  // to be used in cases where control is handed to some other
  // component to fill in a subtree of the document. In these cases,
  // it is expected that the other component calls StartElement and
  // EndElement an equal number of times, returning the document to
  // the same element after it completes. If the other code is buggy
  // or misbehaved, it might call the functions an unequal number of
  // times, causing the document to be malformed. The control code can
  // CHECK() that ElementDepth() returns the same value before and
  // after handing control over to the other component, verifying that
  // the other component is behaving correctly.
  size_t ElementDepth() const;

  //
  // Namespace versions. For each of the namespace-aware functions
  // below, the ns_uri parameter is the actual namespace URI, not the
  // prefix. For instance, if you were starting an element that was
  // defined by the Google Sitemaps schema, you would specify
  // "http://www.google.com/schemas/sitemap/0.84" as the ns_uri. The
  // XmlWriter will automatically manage assignment of namespace
  // prefixes to each distinct namespace used in the document.
  //
  // Note that it is always safe to pass NULL as the ns_uri parameter,
  // in which case the behavior will fall back to the non-namespace
  // version.
  //

  // Call for each open tag. The ns_uri parameter is the actual
  // namespace URI, not the prefix. Each call to StartElement() should
  // have a corresponding call to EndElement().
  void StartElement(const char *name, const char *ns_uri);
  void StartElement(const string &name, const string &ns_uri) {
    StartElement(name.c_str(), ns_uri.c_str());
  }

  void StartElement(const char *name, const string &ns_uri) {
    StartElement(name, ns_uri.c_str());
  }

  void StartElement(const string &name, const char *ns_uri) {
    StartElement(name.c_str(), ns_uri);
  }

  // Call for each open tag, to make the ns_uri the default namespace
  // for this element and any child elements that do not have a
  // namespace prefix (see the class comments for more
  // information). Each call to StartElementDefaultNamespace() should
  // have a corresponding call to EndElement().
  void StartElementDefaultNamespace(const char *name, const char *ns_uri);

  void StartElementDefaultNamespace(const string &name,
                                           const string &ns_uri) {
    StartElementDefaultNamespace(name.c_str(), ns_uri.c_str());
  }

  void StartElementDefaultNamespace(const string &name,
                                    const char *ns_uri) {
    StartElementDefaultNamespace(name.c_str(), ns_uri);
  }

  void StartElementDefaultNamespace(const char *name,
                                    const string &ns_uri) {
    StartElementDefaultNamespace(name, ns_uri.c_str());
  }

  // Call after StartElement to add an attribute to that element. The
  // ns_uri parameter is the actual namespace URI, not the prefix.
  //
  // Note that characters in the value that are outside of 7-bit ASCII
  // will be escaped to hex references.
  //
  // Note that you must call AddAttribute before adding any
  // child elements, otherwise your attribute will not be added.
  void AddAttribute(const char *name, const char *ns_uri, const char *value);
  void AddAttribute(const char *name, const char *ns_uri, int value);
  void AddAttribute(const char *name, const char *ns_uri, bool value);
  void AddAttribute(const char *name, const char *ns_uri, const string &value) {
    AddAttribute(name, ns_uri, value.c_str());
  }

  template<typename T> void AddAttribute(const string &name,
                                         const string &ns_uri,
                                         const T &value) {
    AddAttribute(name.c_str(), ns_uri.c_str(), value);
  }

  template<typename T> void AddAttribute(const char *name,
                                         const string &ns_uri,
                                         const T &value) {
    AddAttribute(name, ns_uri.c_str(), value);
  }

  template<typename T> void AddAttribute(const string &name,
                                         const char *ns_uri,
                                         const T &value) {
    AddAttribute(name.c_str(), ns_uri, value);
  }

  // Call to add literal data to the currently open element. The
  // literal will be prepended with the namespace prefix corresponding
  // to the specified namespace URI. For instance, if ns_uri is mapped
  // to prefix "a" and the string data is "test", "a:test" would be
  // written out. Note that calling this function might require a
  // namespace to be registered, which requires adding an attribute to
  // the currently open element, so you may only call this function
  // before adding any child elements or literal data to an element.
  void Data(const char *s, const char *ns_uri);
  void Data(int i, const char *ns_uri);
  void Data(bool b, const char *ns_uri);
  void Data(const string &s, const char *ns_uri) { Data(s.c_str(), ns_uri); }

  template<typename T> void Data(const T &value,
                                 const string &ns_uri) {
    Data(value, ns_uri.c_str());
  }

  // Helper function to generate an element w/o attributes and a given
  // value as its contents. This is equivalent to calling
  // StartElement(name,ns_uri); Data(value); EndElement();
  void DataElement(const char *name, const char *ns_uri, const char *value);
  void DataElement(const char *name, const char *ns_uri, int value);
  void DataElement(const char *name, const char *ns_uri, bool value);
  void DataElement(const char *name, const char *ns_uri, const string &value) {
    DataElement(name, ns_uri, value.c_str());
  }

  template<typename T> void DataElement(const string &name,
                                        const string &ns_uri,
                                        const T &value) {
    DataElement(name.c_str(), ns_uri.c_str(), value);
  }

  template<typename T> void DataElement(const char *name,
                                        const string &ns_uri,
                                        const T &value) {
    DataElement(name, ns_uri.c_str(), value);
  }

  template<typename T> void DataElement(const string &name,
                                        const char *ns_uri,
                                        const T &value) {
    DataElement(name.c_str(), ns_uri, value);
  }

  // Call after StartElement to associate the specified URI with a
  // prefix, and declare the namespace URI-prefix mapping with the
  // currently open element. The associated prefix will be
  // automatically generated. You can also register a namespace with
  // an element by calling StartElement(name, ns_uri). You should only
  // need to call this function when you want to register a namespace
  // with an element that isn't itself part of that namespace.
  void DeclareNamespaceURI(const char *ns_uri);

  // Call after StartDocument() but before any subsequent calls
  // (before calls to StartElement(), etc). This function lets you
  // bind a namespace prefix to a namespace URI for the lifetime of
  // the document. You should rarely need to use this, since namespace
  // prefixes are managed for you automatically by this class. Only
  // use this if the recipient of the XML you are generating requires
  // a certain namespace prefix for a given namespace URI.
  void BindNamespaceUriToPrefix(const char *ns_uri, const char *ns_prefix);

 private:
  // Forward-declare the nested class we use to manage URI-prefix
  // mappings.
  class PrefixMapper;

  // the literal "true"
  static const char * const kTrueValue;

  // the literal "false"
  static const char * const kFalseValue;

  // Tests to see if the character encoder we're using (the encoder_
  // member) has the same input and output function. If so, using it
  // is a no-op, but we'd end up allocating and deallocating
  // memory. So we test for this case as an optimization to avoid the
  // extra allocation and deallocation.
  bool NeedToConvertString() const;

  // Helper that converts from the specified input encoding to
  // UTF-8. UTF-8 is the format that xmlwriter requires for all
  // inputs. The caller owns the return value, and must free() it.
  char *ConvertString(const char *s);

  // Reset our internal state to the same as when we were constructed.
  void Reset();

  PrefixMapper *prefix_mapper_;
  xmlBuffer *buf_;
  xmlTextWriter *w_;
  xmlCharEncodingHandler *encoder_;
  const char * const output_encoding_;
  const bool pretty_print_;

  // Attempting to add an attribute after adding children to a node
  // does not work. For instance:
  //
  // w.StartElement("elt");
  // w.StartElement("child");
  // w.EndElement();
  // w.AddAttribute("name", "value");
  //
  // One might expect AddAttribute() to add the specified attribute to
  // the "elt" element, but instead, it silently does nothing. We use
  // attribute_adding_still_ok_ to more aggressively DCHECK for this
  // case.
  bool attribute_adding_still_ok_;

  DISALLOW_EVIL_CONSTRUCTORS(XmlWriter);
};

} // namespace webutil_xml

#endif  // WEBUTIL_XML_XML_WRITER_H_
