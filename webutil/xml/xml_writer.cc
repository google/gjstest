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

// XmlWriter uses a PrefixMapper object to keep track of URI to prefix
// mappings. All of the tricky work happens in the prefix mapper. The
// prefix mapper maintains a hash map that maps from URI to prefix, as
// well as a stack of the URIs registered at each depth in the node
// hierarchy. We need the stack so we can clear URI to prefix mappings
// as they go out of scope. We're careful to synchronize the stack
// depth with calls to StartElement() and EndElement().
//
// Note that libxml2 uses UTF-8 as its internal encoding. We use
// BAD_CAST to cheat and assume that some input strings are already a
// UTF-8 encoded sequence of bytes.  We use it only for names, since
// it is a reasonable restriction to require of attribute names
// because they don't need the full expressiveness of values.  This
// avoids us from having to do two memory allocs, conversions, and
// frees for each attribute.

#include <string.h>

#include <limits>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include <libxml/xmlwriter.h>

#include "webutil/xml/xml_writer.h"

#include "base/scoped_ptr.h"
#include "base/stl_decl.h"
#include "base/stringprintf.h"
#include "base/logging.h"

namespace webutil_xml {

class XmlWriter::PrefixMapper {
 public:
  PrefixMapper();
  ~PrefixMapper();

  // Gets the namespace prefix for the specified namespace URI. If the
  // namespace URI hasn't yet been mapped, it will be mapped to hte
  // next available prefix. So, calling IsMapped() is guaranteed to
  // return true after calling GetPrefix(), for the same URI.
  string GetPrefix(const string &ns_uri);

  // Associate the specified URI with the specified prefix
  // permanently (until the next call to Reset()).
  void AssociatePrefix(const char *ns_uri, const char *ns_prefix);

  // Reset the state to the same as it would be right after being
  // constructed.
  void Reset();

  // Call whenever the XML element depth increases (with
  // StartElement()). Pushes a vector on the history stack.
  void Push();

  // Call whenever the XML element depth decreases (with
  // EndElement()). Pops the vector on the top of the history stack,
  // and unassociates any namespace URIs in that vector.
  void Pop();

  // Is the specified namespace URI currently mapped to a namespace
  // prefix?
  bool IsMapped(const string &ns_uri) const {
    return uri_prefix_map_ != NULL && uri_prefix_map_->count(ns_uri) > 0;
  }

  // Returns the current depth of the uri stack.
  size_t stack_depth() const { return uri_stack_->size(); }

 private:
  typedef std::unordered_map<string, string> StringStringMap;
  typedef std::unordered_set<string> StringSet;
  typedef vector<string> StringVector;
  typedef stack<StringVector *> StringVectorStack;

  // The number of letters in our namespace prefix alphabet (26) - a through z.
  static const int kAlphabetSize;

  // The XML namespace prefix ("xml")
  static const char * const kXmlNamespacePrefix;

  // Generate the next available prefix.
  string GenerateNextPrefix();

  // Is the prefix a reserved prefix (either a special prefix defined
  // by the XML spec, or one already in use)?
  bool IsReservedPrefix(const string &ns_prefix) const;

  // Clear the namespace URI stack, and clean up any memory.
  void DeleteStackContents();

  // We allocate the prefix maps lazily so we don't use any extra
  // memory in the common (non-namespace) case.
  void AllocateMapsIfNull();

  // The uri stack contains a history of the URIs mapped at each level
  // of node depth. We use this to correctly clear mapped URIs as they
  // go out of scope.
  scoped_ptr<StringVectorStack> uri_stack_;

  // The prefix map contains the mapping of URIs to prefixes.
  scoped_ptr<StringStringMap> uri_prefix_map_;

  // The fixed prefix map contains all of the URI to prefix mappings
  // that are defined by the client. This includes those declared
  // explicitly via AssociatePrefix(), as well as any implicit
  // mappings generated via calls to the namespace versions of
  // StartElement(), AddAttribute(), etc.
  scoped_ptr<StringStringMap> uri_fixed_prefix_map_;

  // The set of all fixed prefixes. This is the same data as in
  // uri_fixed_prefix_map_, but keyed by prefix, so we can lookup by
  // prefix in constant time.
  scoped_ptr<StringSet> fixed_prefix_set_;

  // We map the value in the counter to a base-26 namespace prefix,
  // incrementing it for each call to GenerateNextPrefix().
  unsigned int counter_;
};

XmlWriter::XmlWriter(const char *output_encoding)
    : prefix_mapper_(new PrefixMapper()),
      buf_(NULL),
      w_(NULL),
      encoder_(NULL),
      output_encoding_(output_encoding),
      pretty_print_(false),
      attribute_adding_still_ok_(false) {
  CHECK(output_encoding_ != NULL);
}

XmlWriter::XmlWriter(const char *output_encoding, bool pretty_print)
    : prefix_mapper_(new PrefixMapper()),
      buf_(NULL),
      w_(NULL),
      encoder_(NULL),
      output_encoding_(output_encoding),
      pretty_print_(pretty_print),
      attribute_adding_still_ok_(false) {
  CHECK(output_encoding_ != NULL);
}

XmlWriter::~XmlWriter() {
  Reset();
  delete prefix_mapper_;
}

void XmlWriter::Reset() {
  prefix_mapper_->Reset();

  if (encoder_ != NULL) {
    // Make sure we close the encoder. If it's allocated via iconv,
    // not closing the encoder will cause a memory leak.
    xmlCharEncCloseFunc(encoder_);
    encoder_ = NULL;
  }

  // Ideally, we would not free w_ and buf_; we would just reset
  // them. Unfortunately, libxml does not provide a clean way to reset
  // their state, so we do the safe thing and just free them. The next
  // time we need to use them (when StartDocument() gets called), they
  // will be allocated from scratch.
  if (w_ != NULL) {
    xmlFreeTextWriter(w_);
    w_ = NULL;
  }

  if (buf_ != NULL) {
    xmlBufferFree(buf_);
    buf_ = NULL;
  }

  attribute_adding_still_ok_ = false;
}

// Resets internal state and set up the encoder for the specified
// output encoding.
void XmlWriter::StartDocument(const char *input_encoding) {
  CHECK(input_encoding != NULL);

  // clean up any content left over from the last document and reset
  // our state to the same as when we were constructed.
  Reset();

  encoder_ = xmlFindCharEncodingHandler(input_encoding);
  if (!encoder_) {
    LOG(FATAL) << "Cannot find XmlWriter encoder = " << input_encoding;
  }

  buf_ = xmlBufferCreate();
  // Use a buffer allocation which will be efficient for large files and
  // many writes.
  xmlBufferSetAllocationScheme(buf_, XML_BUFFER_ALLOC_DOUBLEIT);
  w_ = xmlNewTextWriterMemory(buf_, 0);

  // Turn on pretty-printing, if appropriate.
  if (pretty_print_) {
    xmlTextWriterSetIndent(w_, 1);
  }

  xmlTextWriterStartDocument(w_, NULL, output_encoding_, NULL);
}

void XmlWriter::EndDocument() {
  xmlTextWriterEndDocument(w_);

  prefix_mapper_->Reset();

  if (w_ != NULL) {
    xmlFreeTextWriter(w_);
    w_ = NULL;
  }

  // Do not free buf_, since clients want to call GetContent() after
  // EndDocument() and buf_ owns our internal content buffer.
}

// Output the specified element. If we've never encountered the ns_uri
// before, make sure we output the xmlns: definition for
// it. Otherwise, use the prefix already bound to that URI.
void XmlWriter::StartElement(const char *name, const char *ns_uri) {
  CHECK(name != NULL);

  // Keep the prefix mapper's stack in sync with our node depth.
  prefix_mapper_->Push();

  attribute_adding_still_ok_ = true;

  string ns_prefix;
  bool define_ns_uri = false;

  if (ns_uri != NULL) {
    // Only define the URI if a parent node hasn't already mapped it
    // to a prefix before. This way, we only define it once, instead
    // of for every node.
    define_ns_uri = !prefix_mapper_->IsMapped(ns_uri);
    ns_prefix = prefix_mapper_->GetPrefix(ns_uri);
  }

  xmlTextWriterStartElementNS(
      w_,
      !ns_prefix.empty() ? BAD_CAST ns_prefix.c_str() : NULL,
      BAD_CAST name,
      define_ns_uri ? BAD_CAST ns_uri : NULL);

  if (ns_uri != NULL) {
    CHECK(prefix_mapper_->IsMapped(ns_uri));
  }
}

// Declaring a node with a default namespace just means not allocating
// a prefix for that namespace. It's a simpler case of StartElement().
void XmlWriter::StartElementDefaultNamespace(const char *name,
                                             const char *ns_uri) {
  CHECK(name != NULL);
  CHECK(ns_uri != NULL);

  // Keep the prefix mapper's stack in sync with our node depth.
  prefix_mapper_->Push();

  attribute_adding_still_ok_ = true;

  xmlTextWriterStartElementNS(
      w_,
      NULL,
      BAD_CAST name,
      BAD_CAST ns_uri);
}

void XmlWriter::EndElement() {
  xmlTextWriterEndElement(w_);

  // Keep the prefix mapper's stack in sync with our node depth.
  prefix_mapper_->Pop();

  attribute_adding_still_ok_ = false;
}

void XmlWriter::DeclareNamespaceURI(const char *ns_uri) {
  CHECK(ns_uri != NULL);

  // Blow up in devel when someone adds an attribute after adding a
  // child. Don't die in prod (even though the XML will not contain
  // the expected contents) but log an error, so we're sure to catch
  // the problem.
  LOG_IF(FATAL, !attribute_adding_still_ok_)
    << "Attempting to declare a namespace after "
    << "adding a child element doesn't work!";

  if (!prefix_mapper_->IsMapped(ns_uri)) {
    // this is a new namespace, so register it with our internal
    // structures and declare it in the document.
    string ns_prefix = prefix_mapper_->GetPrefix(ns_uri);
    xmlTextWriterWriteAttributeNS(
        w_,
        BAD_CAST "xmlns",
        BAD_CAST ns_prefix.c_str(),
        NULL,
        BAD_CAST ns_uri);
  }

  CHECK(prefix_mapper_->IsMapped(ns_uri));
}

void XmlWriter::BindNamespaceUriToPrefix(const char *ns_uri,
                                         const char *ns_prefix) {
  CHECK(ns_uri != NULL);
  CHECK(ns_prefix != NULL);

  prefix_mapper_->AssociatePrefix(ns_uri, ns_prefix);

  // note that we can't postcondition that the URI is mapped, since it
  // doesn't get mapped until the first call to GetPrefix(). At this
  // point, it should still not be mapped.
  CHECK(!prefix_mapper_->IsMapped(ns_uri));
}

void XmlWriter::AddAttribute(const char *name,
                             const char *ns_uri,
                             const char *value) {
  CHECK(name != NULL);
  CHECK(value != NULL);

  // Blow up in devel when someone adds an attribute after adding a
  // child. Don't die in prod (even though the XML will not contain
  // the expected contents) but log an error, so we're sure to catch
  // the problem.
  LOG_IF(FATAL, !attribute_adding_still_ok_)
    << "Attempting to add an attribute after "
    << "adding a child element doesn't work!";

  string ns_prefix;

  if (ns_uri != NULL) {
    // make sure that the URI has an associated prefix, and that its
    // URI-prefix mapping is declared in the document.
    DeclareNamespaceURI(ns_uri);
    ns_prefix = prefix_mapper_->GetPrefix(ns_uri);
  }

  char *out = NULL;

  if (NeedToConvertString()) {
    // Only do the conversion if the input encoding isn't the same as
    // the expected encoding. Otherwise we're doing unnecessary
    // mallocs and frees.
    out = ConvertString(value);
  }

  xmlTextWriterWriteAttributeNS(
      w_,
      !ns_prefix.empty() ? BAD_CAST ns_prefix.c_str() : NULL,
      BAD_CAST name,
      NULL,
      out != NULL ? BAD_CAST out : BAD_CAST value);

  free(out);
}

void XmlWriter::AddAttribute(const char *name,
                             const char *ns_uri,
                             int value) {
  CHECK(name != NULL);

  char strval[ numeric_limits<int>::digits10 +1
                                             +1 /*for negitive ints*/
                                             +1 /*for NULL*/ ];
  snprintf(strval, sizeof(strval), "%d", value);

  // to disambiguate which version of AddAttribute we want to call
  // (templated vs not), we take strval as a const char * and use it
  // instead.
  const char *ptr_to_strval = strval;
  AddAttribute(name, ns_uri, ptr_to_strval);
}

void XmlWriter::AddAttribute(const char *name,
                             const char *ns_uri,
                             bool value) {
  CHECK(name != NULL);

  AddAttribute(name, ns_uri, value ? kTrueValue : kFalseValue);
}

void XmlWriter::Data(const char *s, const char *ns_uri) {
  CHECK(s != NULL);

  string ns_prefix;

  if (ns_uri != NULL) {
    // make sure that the URI has an associated prefix, and that its
    // URI-prefix mapping is declared in the document.
    DeclareNamespaceURI(ns_uri);
    ns_prefix = prefix_mapper_->GetPrefix(ns_uri);
  }

  char *out = NULL;

  if (NeedToConvertString()) {
    // Only do the conversion if the input encoding isn't the same as
    // the expected encoding. Otherwise we're doing unnecessary
    // mallocs and frees.
    out = ConvertString(s);
  }

  {
    // get a pointer to the actual value we want to output.
    const char * const content = out != NULL ? out : s;

    if (!ns_prefix.empty()) {
      // write the value, with a namespace prefix
      xmlTextWriterWriteFormatString(w_, "%s:%s", ns_prefix.c_str(), content);
    } else {
      // write the regular value (no namespace prefix)
      xmlTextWriterWriteString(
          w_,
          BAD_CAST content);
    }
  }

  attribute_adding_still_ok_ = false;

  free(out);
}

void XmlWriter::Data(int value, const char *ns_uri) {
  char strval[ numeric_limits<int>::digits10 +1
                                             +1 /*for negative ints*/
                                             +1 /*for NULL*/ ];
  snprintf(strval, sizeof(strval), "%d", value);

  // to disambiguate which version of Data we want to call (templated
  // vs not), we take strval as a const char * and use it instead.
  const char *ptr_to_strval = strval;
  Data(ptr_to_strval, ns_uri);
}

void XmlWriter::Data(bool value, const char *ns_uri) {
  Data(value ? kTrueValue : kFalseValue, ns_uri);
}

void XmlWriter::Newline() {
  Data("\n");
}

void XmlWriter::WriteCData(const char *cdata) {
  xmlTextWriterWriteCDATA(w_, BAD_CAST cdata);

  attribute_adding_still_ok_ = false;
}

void XmlWriter::WriteComment(const char *comment) {
  CHECK(comment != NULL);

  char *out = NULL;

  if (NeedToConvertString()) {
    // Only do the conversion if the input encoding isn't the same as
    // the expected encoding. Otherwise we're doing unnecessary
    // mallocs and frees.
    out = ConvertString(comment);
  }

  xmlTextWriterWriteComment(
      w_,
      out != NULL ? BAD_CAST out : BAD_CAST comment);

  attribute_adding_still_ok_ = false;

  free(out);
}

void XmlWriter::DataElement(const char *name,
                            const char *ns_uri,
                            const char *value) {
  CHECK(name != NULL);
  CHECK(value != NULL);

  StartElement(name, ns_uri);
  Data(value);
  EndElement();
}

void XmlWriter::DataElement(const char *name,
                            const char *ns_uri,
                            int value) {
  CHECK(name != NULL);

  StartElement(name, ns_uri);
  Data(value);
  EndElement();
}

void XmlWriter::DataElement(const char *name,
                            const char *ns_uri,
                            bool value) {
  CHECK(name != NULL);

  StartElement(name, ns_uri);
  Data(value);
  EndElement();
}

const char *XmlWriter::GetContent() const {
  if (buf_ == NULL) {
    return NULL;
  }

  xmlTextWriterFlush(w_);
  return reinterpret_cast<const char *>(buf_->content);
}

size_t XmlWriter::GetContentLength() const {
  if (buf_ == NULL) {
    return 0;
  }

  xmlTextWriterFlush(w_);
  return static_cast<size_t>(buf_->use);
}

size_t XmlWriter::ElementDepth() const {
  return prefix_mapper_->stack_depth();
}

bool XmlWriter::NeedToConvertString() const {
  return encoder_->input != encoder_->output;
}

// Caller must free() the return value
char *XmlWriter::ConvertString(const char *s) {
  int size = strlen(s) + 1;
  // size * 2 - 1 is sufficient because at most we are using
  // a two bytes per character encoding.
  int out_size = size * 2 - 1;

  // keep our buffer in a scoped_ptr_malloc to make sure we don't
  // accidentally leak.
  scoped_ptr_malloc<char> out(
      reinterpret_cast<char *>(malloc((size_t)out_size)));

  if (out != NULL) {
    int temp = size - 1;
    int ret = encoder_->input(BAD_CAST out.get(), &out_size, BAD_CAST s, &temp);
    if (ret == -1 || ((temp - size + 1) != 0)) {
      if (ret == -1) {
        LOG(FATAL) << "XmlWriter::Data: conversion wasn't successful";
      } else {
        LOG(FATAL) << "XmlWriter::Data: conversion wasn't successful; "
          "converted " << temp << " octets";
      }
      return NULL;
    } else {
      // we don't want to free our buffer here, since realloc will
      // take care of all the memory allocation/deallocation, so we
      // release the pointer before calling into realloc.
      out.reset(reinterpret_cast<char *>(realloc(out.release(), out_size + 1)));
      out.get()[out_size] = 0;  /* null terminating out */
    }
  } else {
    LOG(FATAL) << "XmlWriter::Data: no memory";
  }

  // don't let scoped_ptr free our memory; instead, release it and
  // return it to the caller.
  return out.release();
}

XmlWriter::PrefixMapper::PrefixMapper()
    : uri_stack_(new StringVectorStack()),
      uri_prefix_map_(NULL),
      uri_fixed_prefix_map_(NULL),
      fixed_prefix_set_(NULL),
      counter_(0) {
}

XmlWriter::PrefixMapper::~PrefixMapper() {
  DeleteStackContents();
}

void XmlWriter::PrefixMapper::AllocateMapsIfNull() {
  // make sure the state of uri_prefix_map_ and uri_fixed_prefix_map_
  // are in sync. we assume that if one is null, the other is also
  // (and vice versa).
  CHECK((uri_prefix_map_ == NULL) == (uri_fixed_prefix_map_ == NULL));

  if (uri_prefix_map_ != NULL) {
    // already initialized - nothing to do.
    return;
  }

  uri_prefix_map_.reset(new StringStringMap());
  uri_fixed_prefix_map_.reset(new StringStringMap());

  // always include the default xml prefix in the namespace map
  (*uri_prefix_map_)[kXmlNamespaceURI] = kXmlNamespacePrefix;
}

string XmlWriter::PrefixMapper::GetPrefix(const string &ns_uri) {
  AllocateMapsIfNull();

  if (uri_prefix_map_->count(ns_uri) > 0) {
    // The prefix is already mapped, so just return it.
    return (*uri_prefix_map_)[ns_uri];
  }

  // The prefix hasn't been mapped previously. If it's defined as a
  // fixed prefix, use that; otherwise, allocate the next available
  // prefix and use that.
  string ns_prefix = ((uri_fixed_prefix_map_->count(ns_uri) > 0) ?
                      (*uri_fixed_prefix_map_)[ns_uri] :
                      GenerateNextPrefix());

  // Define the URI to prefix mapping, and put it in the uri stack.
  (*uri_fixed_prefix_map_)[ns_uri] = ns_prefix;
  (*uri_prefix_map_)[ns_uri] = ns_prefix;
  uri_stack_->top()->push_back(ns_uri);

  return ns_prefix;
}

void XmlWriter::PrefixMapper::AssociatePrefix(const char *ns_uri,
                                              const char *ns_prefix) {
  AllocateMapsIfNull();

  (*uri_fixed_prefix_map_)[ns_uri] = ns_prefix;

  if (fixed_prefix_set_ == NULL) {
    // lazily allocate the prefix set.
    fixed_prefix_set_.reset(new StringSet());
  }

  fixed_prefix_set_->insert(ns_prefix);
}

string XmlWriter::PrefixMapper::GenerateNextPrefix() {
  // We have to allocate a new namespace prefix. We do this in 2
  // parts. First, we determine how much space is required to hold the
  // prefix, and then we calculate the actual prefix. We assign
  // prefixes in order, starting at 'a', then 'b', then 'c', up to
  // 'z', and move on to 'aa', then 'ab', up to 'az', and on to 'ba',
  // etc.

  string retval;

  do {
    // First, determine how many chars are required to hold the
    // prefix.
    int ns_as_int = counter_;
    int n_chars = 1;
    while (ns_as_int >= kAlphabetSize) {
      ++n_chars;
      ns_as_int /= kAlphabetSize;
      --ns_as_int;
    }

    retval.resize(n_chars);

    // Now fill in the chars, using a base26 representation (each
    // digit is from a to z).
    for (int i = n_chars-1, ns_as_int = counter_;
         i >= 0;
         ns_as_int /= kAlphabetSize, --ns_as_int) {
      char char_val = static_cast<char>('a' + (ns_as_int % kAlphabetSize));
      retval[i--] = char_val;
    }

    // Increment the counter so we allocate the next available
    // namespace the next time around.
    ++counter_;

    // if the prefix is already reserved (either the special 'xml'
    // prefix or one in uri_fixed_prefix_map_) then we need to
    // allocate a new one.
  } while (IsReservedPrefix(retval));

  return retval;
}

bool XmlWriter::PrefixMapper::IsReservedPrefix(const string &ns_prefix) const {
  if (ns_prefix == kXmlNamespacePrefix || ns_prefix == "xmlns") {
    // These prefixes are special. The XML spec says they're always reserved.
    return true;
  }

  // If we haven't yet allocated the prefix set, then we don't have
  // any reserved prefixes. Otherwise, it's a reserved prefix if it's
  // in that set.
  return fixed_prefix_set_ != NULL && fixed_prefix_set_->count(ns_prefix) > 0;
}

void XmlWriter::PrefixMapper::DeleteStackContents() {
  StringVector *v;
  while (!uri_stack_->empty()) {
    v = uri_stack_->top();
    uri_stack_->pop();
    delete v;
  }
}

void XmlWriter::PrefixMapper::Reset() {
  DeleteStackContents();

  // delete the members used for managing namespace URI to prefix
  // mappings. we only use them if we're dealing with namespace, so
  // free them until we actually need them.
  fixed_prefix_set_.reset();
  uri_fixed_prefix_map_.reset();
  uri_prefix_map_.reset();

  // don't delete uri_stack_ - we need it in all cases, so it doesn't
  // make sense to lazily allocate it.

  counter_ = 0;
}

void XmlWriter::PrefixMapper::Push() {
  uri_stack_->push(new StringVector());
}

void XmlWriter::PrefixMapper::Pop() {
  StringVector *v = uri_stack_->top();

  // each element in the vector at the top of the stack is a URI who's
  // URI-prefix mapping is going out of scope. For each, remove it
  // from the uri-prefix std::unordered_map.
  for (StringVector::const_iterator uri_out_of_scope_iter =
         v->begin();
       uri_out_of_scope_iter != v->end();
       ++uri_out_of_scope_iter) {
    uri_prefix_map_->erase(*uri_out_of_scope_iter);
  }

  uri_stack_->pop();
  delete v;
}

const char * const XmlWriter::kTrueValue = "true";
const char * const XmlWriter::kFalseValue = "false";

const char * const XmlWriter::PrefixMapper::kXmlNamespacePrefix = "xml";
const char * const XmlWriter::kXmlNamespaceURI =
    "http://www.w3.org/XML/1998/namespace";

const int XmlWriter::PrefixMapper::kAlphabetSize = ('z' - 'a') + 1;

} // namespace webutil_xml
