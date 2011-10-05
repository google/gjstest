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

#include <limits>

#include <gtest/gtest.h>

#include "base/logging.h"
#include "webutil/xml/xml_writer.h"

using std::numeric_limits;

namespace {

class XmlWriterTest : public testing::Test {
 protected:
  virtual void SetUp() {
    w_ = new webutil_xml::XmlWriter(kDefaultEncoding);
  }

  virtual void TearDown() {
    delete w_;
  }

  static const char * const kNsUri1;
  static const char * const kNsUri2;
  static const char * const kNsUri3;
  static const char * const kNsUri4;
  static const char * const kNsUri5;
  static const char * const kNsUri6;
  static const char * const kNsUri7;

  static const char * const kDefaultEncoding;

  static const string kSmokeTestContentStart;
  static const string kSmokeTestContentEnd;
  static const string kSmokeTestContent;

  static const string kExpectedOutputStart;
  static const string kExpectedOutputEnd;
  static const string kExpectedOutput;
  static const string kExpectedOutputIntTest;
  static const string kExpectedOutputBoolTest;
  static const string kExpectedOutputPrettyPrintTest;

  static const string kNamespaceExample1;
  static const string kNamespaceExample2;
  static const string kNamespaceExample3;
  static const string kNamespaceExample4;
  static const string kNamespaceExample5;

  static const string kReservedNamespaceTest;
  static const string kStartDocumentTwiceTest;

  webutil_xml::XmlWriter *w_;
};

TEST_F(XmlWriterTest, IntTest) {
  // Test to verify that we write integer values correctly.
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("root");
  int i = numeric_limits<int>::min();
  w_->AddAttribute("int", i);
  w_->Data(i);
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kExpectedOutputIntTest.c_str(), w_->GetContent());
}

TEST_F(XmlWriterTest, BoolTest) {
  // Test to verify that we write boolean values correctly.
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("root");
  w_->AddAttribute("bool1", true);
  w_->AddAttribute("bool2", false);
  w_->Data(true);
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kExpectedOutputBoolTest.c_str(), w_->GetContent());
}

TEST_F(XmlWriterTest, PrettyPrintTest) {
  // Test to verify that we pretty print when requested.
  delete w_;
  w_ = new webutil_xml::XmlWriter(kDefaultEncoding, true);

  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("root");
  w_->StartElement("child1");
  w_->StartElement("child2");
  w_->StartElement("child3");
  w_->Data("data");
  w_->EndElement();
  w_->EndElement();
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kExpectedOutputPrettyPrintTest.c_str(), w_->GetContent());
}

TEST_F(XmlWriterTest, NullUriTest) {
  // Test to verify that we can pass NULL as the namespace URI (which
  // causes behavior equivalent to the non-namespace implementation).
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("root", NULL);
  w_->AddAttribute("bool1", NULL, true);
  w_->AddAttribute("bool2", NULL, false);
  w_->Data(true, NULL);
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kExpectedOutputBoolTest.c_str(), w_->GetContent());
}

TEST_F(XmlWriterTest, EncodingTest) {
  // Test that input encoding conversion works.
  w_->StartDocument("ISO-8859-1");
  w_->StartElement("root");
  w_->StartElement("nested");
  w_->AddAttribute("name", "John Doe");
  w_->AddAttribute("i18n-name", "Urs Hˆlzle");
  w_->Data("rÈsumÈ");

  ASSERT_STREQ(kExpectedOutputStart.c_str(), w_->GetContent());
  ASSERT_EQ(kExpectedOutputStart.length(), w_->GetContentLength());

  w_->EndElement();
  w_->DataElement("some-text", "Urs Hˆlzle's rÈsumÈ");
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kExpectedOutput.c_str(), w_->GetContent());
  ASSERT_EQ(kExpectedOutput.length(), w_->GetContentLength());
}

TEST_F(XmlWriterTest, NamespaceExample1) {
  // The namespace prefixes ("a" and "b" in this example) are
  // automatically generated and managed by XmlWriter. The expected
  // output is shown below.
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("doc_root", "http://my.namespace.com/myschema/2006/07/");
  w_->StartElement("child_same_ns",
                   "http://my.namespace.com/myschema/2006/07/");
  w_->EndElement();
  w_->StartElement("child_different_ns",
                   "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kNamespaceExample1.c_str(), w_->GetContent());
}

// Expected output for the example above:
const string XmlWriterTest::kNamespaceExample1 =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<a:doc_root xmlns:a=\"http://my.namespace.com/myschema/2006/07/\">"
    "<a:child_same_ns/>"
    "<b:child_different_ns "
      "xmlns:b=\"http://other.namespace.com/otherschema/2006/07/\"/>"
  "</a:doc_root>\n";

TEST_F(XmlWriterTest, NamespaceExample2) {
  // XmlWriter correctly scopes the URI-prefix mappings, so if you
  // write code like:
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("doc_root", "http://my.namespace.com/myschema/2006/07/");
  w_->StartElement("child_1",
                   "http://other.namespace.com/otherschema/2006/07/");
  w_->StartElement("sub_1", "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->StartElement("child_2",
                   "http://other.namespace.com/otherschema/2006/07/");
  w_->StartElement("sub_2", "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kNamespaceExample2.c_str(), w_->GetContent());
}

// You get an XML document like (notice that prefix b gets redefined
// since it goes in and out of scope):
const string XmlWriterTest::kNamespaceExample2 =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<a:doc_root xmlns:a=\"http://my.namespace.com/myschema/2006/07/\">"
    "<b:child_1 xmlns:b=\"http://other.namespace.com/otherschema/2006/07/\">"
      "<b:sub_1/>"
    "</b:child_1>"
    "<b:child_2 xmlns:b=\"http://other.namespace.com/otherschema/2006/07/\">"
      "<b:sub_2/>"
    "</b:child_2>"
  "</a:doc_root>\n";

TEST_F(XmlWriterTest, NamespaceExample3) {
  // Continuing from the last test, it would also be valid to define
  // the namespace at the root element by calling
  // DeclareNamespaceURI() after starting the doc_root element:
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("doc_root", "http://my.namespace.com/myschema/2006/07/");
  w_->DeclareNamespaceURI("http://other.namespace.com/otherschema/2006/07/");
  w_->StartElement("child_same_ns",
                   "http://my.namespace.com/myschema/2006/07/");
  w_->EndElement();
  w_->StartElement("child_different_ns",
                   "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kNamespaceExample3.c_str(), w_->GetContent());
}

// Registering the namespace at the root element generates XML that
// takes up fewer bytes than the first example (since we only end up
// declaring the other.namespace.com URI once).
const string XmlWriterTest::kNamespaceExample3 =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<a:doc_root "
    "xmlns:b=\"http://other.namespace.com/otherschema/2006/07/\" "
    "xmlns:a=\"http://my.namespace.com/myschema/2006/07/\">"
    "<a:child_same_ns/>"
    "<b:child_different_ns/>"
  "</a:doc_root>\n";

TEST_F(XmlWriterTest, NamespaceExample4) {
  // In general, your code should not require hard-coded namespace
  // prefixes. If two different namespaces are bound to the same
  // prefix, you'll get a collision (though it will still be valid
  // XML, which could lead to messy bugs). XmlWriter manages prefixes
  // for you for this reason. However, in cases where you must bind a
  // specific prefix to a namespace URI, you can call
  // BindNamespaceUriToPrefix() like so:
  w_->StartDocument(kDefaultEncoding);
  w_->BindNamespaceUriToPrefix("http://my.namespace.com/myschema/2006/07/",
                               "myns");
  w_->StartElement("doc_root", "http://my.namespace.com/myschema/2006/07/");
  w_->StartElement("child_same_ns",
                   "http://my.namespace.com/myschema/2006/07/");
  w_->EndElement();
  w_->StartElement("child_different_ns",
                   "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kNamespaceExample4.c_str(), w_->GetContent());
}

// Which generates:
const string XmlWriterTest::kNamespaceExample4 =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<myns:doc_root xmlns:myns=\"http://my.namespace.com/myschema/2006/07/\">"
    "<myns:child_same_ns/>"
    "<a:child_different_ns "
      "xmlns:a=\"http://other.namespace.com/otherschema/2006/07/\"/>"
  "</myns:doc_root>\n";

TEST_F(XmlWriterTest, NamespaceExample5) {
  // Explicitly declaring the namespace URI in your code for every
  // element in a document can be tedious and error-prone. If most of
  // the elements in your document are in the same namespace, you can
  // declare a default namespace using
  // StartElementDefaultNamespace(). The element for which the default
  // namespace is declared and any of its children which don't have a
  // namespace prefix are considered part of the default
  // namespace. So, for code like:
  w_->StartDocument(kDefaultEncoding);
  w_->StartElementDefaultNamespace("doc_root",
                                   "http://my.namespace.com/myschema/2006/07/");
  w_->DeclareNamespaceURI("http://other.namespace.com/otherschema/2006/07/");
  w_->StartElement("child_1");
  w_->StartElement("sub_1", "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->StartElement("child_2");
  w_->StartElement("sub_2", "http://other.namespace.com/otherschema/2006/07/");
  w_->EndElement();
  w_->EndElement();
  w_->EndElement();
  w_->EndDocument();

  ASSERT_STREQ(kNamespaceExample5.c_str(), w_->GetContent());
}

// The generated output is below. Note that the default namespace is
// declared without a prefix:
// 'xmlns="http://my.namespace.com/myschema/2006/07/"'. The elements
// doc_root, child_1, and child_2 are now elements of the default
// namespace. sub_1 and sub_2 are in the
// "http://other.namespace.com/otherschema/2006/07/" namespace. Note
// that the W3C "Namespaces in XML" document states: "default
// namespaces do not apply directly to attributes".
const string XmlWriterTest::kNamespaceExample5 =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<doc_root "
    "xmlns:a=\"http://other.namespace.com/otherschema/2006/07/\" "
    "xmlns=\"http://my.namespace.com/myschema/2006/07/\">"
    "<child_1>"
      "<a:sub_1/>"
    "</child_1>"
    "<child_2>"
      "<a:sub_2/>"
    "</child_2>"
  "</doc_root>\n";

TEST_F(XmlWriterTest, ReservedNamespaceTest) {
  // Make sure that the prefix allocator doesn't allocate any prefixes
  // that we explicitly bind to a URI, and make sure that the XML
  // namespace URI always resolves to 'xml'.
  w_->StartDocument(kDefaultEncoding);

  // bind a namespace to prefix 'a', which we know that the allocator
  // normally allocates first.
  w_->BindNamespaceUriToPrefix("http://my.namespace.com/myschema/2006/07/",
                               "a");

  // start an element in a different namespace. make sure it binds to
  // 'b' since 'a' is reserved.
  w_->StartElement("doc_root",
                   "http://other.namespace.com/otherschema/2006/07/");

  // make sure the XML namespace URI is associated with the 'xml'
  // prefix
  w_->StartElement("special_xml_node",
                   webutil_xml::XmlWriter::kXmlNamespaceURI);

  // make sure that the namespace we bound to 'a' is really bound to
  // 'a'.
  w_->StartElement("child", "http://my.namespace.com/myschema/2006/07/");

  w_->EndDocument();

  ASSERT_STREQ(kReservedNamespaceTest.c_str(), w_->GetContent());
}

TEST_F(XmlWriterTest, AttributeAfterChildDeathTest) {
  // Verify that we correctly catch the case where a client tries to
  // add an attribute after a child.
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("child_1");
  w_->StartElement("sub_1");
  w_->EndElement();
  ASSERT_DEBUG_DEATH(w_->AddAttribute("name", "value"),
                     "Attempting to add an attribute after "
                     "adding a child element doesn't work!");
  w_->EndElement();
  w_->EndDocument();
}

TEST_F(XmlWriterTest, StartDocumentTwiceTest) {
  // Start a document, configure it, and then reuse the writer to
  // start another doc. Make sure that none of the state from the
  // first doc is left over.
  w_->StartDocument(kDefaultEncoding);
  w_->BindNamespaceUriToPrefix("http://my.namespace.com/myschema/2006/07/",
                               "myns");

  w_->StartElement("doc_root",
                   "http://other.namespace.com/otherschema/2006/07/");

  w_->StartElement("child", "http://my.namespace.com/myschema/2006/07/");

  // now start over, but without the bound namespace from the last
  // doc. Make sure that the namespace isn't bound in this case.
  w_->StartDocument(kDefaultEncoding);
  w_->StartElement("doc_root", "http://my.namespace.com/myschema/2006/07/");
  w_->StartElement("child",
                   "http://other.namespace.com/otherschema/2006/07/");

  // Invoke EndDocument so that the test is not dependent on
  // buffering details which might be inconsistent from one version
  // of libxml to another.
  w_->EndDocument();
  ASSERT_STREQ(kStartDocumentTwiceTest.c_str(), w_->GetContent());
}

TEST_F(XmlWriterTest, SmokeTest) {
  // Exercises every function on the public API of XmlWriter and
  // verifies correct output.
  w_->StartDocument(kDefaultEncoding);
  w_->BindNamespaceUriToPrefix(kNsUri1, "books");
  w_->StartElement("root");
  w_->DeclareNamespaceURI(kNsUri7);
  w_->WriteCData("<&cdataisnotescaped");
  w_->StartElement(string("child1"));
  w_->AddAttribute("attr1", "");
  w_->AddAttribute(string("attr2"), string("val"));
  w_->AddAttribute(string("attr3"), "val");
  w_->AddAttribute("attr4", string("val"));
  w_->AddAttribute("attr5", 0);
  w_->AddAttribute(string("attr6"), numeric_limits<int>::min());
  w_->AddAttribute("attr7", true);
  w_->AddAttribute(string("attr8"), false);
  w_->WriteCData(string("moreCData"));
  w_->Data("string data");
  w_->Data(string("<!-- & -->"));
  w_->Data(numeric_limits<int>::max());
  w_->Data(true);
  w_->Newline();
  w_->Newline();
  w_->WriteComment("a simple comment");
  w_->WriteComment(string("another <!--comment-->"));
  w_->DataElement("child2", "content1");
  w_->DataElement(string("child3"), string("content2"));
  w_->DataElement(string("child4"), "content3");
  w_->DataElement("child5", string("content4"));
  w_->DataElement("child6", 123);
  w_->DataElement(string("child7"), 4);
  w_->DataElement("child8", true);
  w_->DataElement(string("child9"), false);
  w_->StartElement("child10", kNsUri1);
  w_->StartElement(string("child11"), string(kNsUri2));
  w_->StartElement(string("child12"), kNsUri1);
  w_->StartElement("child13", string(kNsUri2));
  w_->StartElementDefaultNamespace("child14", kNsUri1);
  w_->StartElementDefaultNamespace(string("child15"), string(kNsUri2));
  w_->StartElementDefaultNamespace(string("child16"), kNsUri1);
  w_->StartElementDefaultNamespace("child17", string(kNsUri2));
  w_->AddAttribute(string("attr1"), string(kNsUri1), string("val"));
  w_->AddAttribute(string("attr2"), string(kNsUri2), "val");
  w_->AddAttribute(string("attr3"), kNsUri1, "val");
  w_->AddAttribute(string("attr4"), kNsUri2, string("val"));
  w_->AddAttribute("attr5", string(kNsUri3), string("val"));
  w_->AddAttribute("attr6", string(kNsUri4), "val");
  w_->AddAttribute("attr7", kNsUri1, string("val"));
  w_->AddAttribute("attr8", kNsUri1, "val");
  w_->AddAttribute(string("attr9"), string(kNsUri1), 0);
  w_->AddAttribute(string("attr10"), kNsUri2, 1010);
  w_->AddAttribute("attr11", string(kNsUri2), 1234);
  w_->AddAttribute("attr12", kNsUri1, -0);
  w_->AddAttribute(string("attr13"), string(kNsUri1), true);
  w_->AddAttribute(string("attr14"), kNsUri2, false);
  w_->AddAttribute("attr15", string(kNsUri2), false);
  w_->AddAttribute("attr16", kNsUri1, true);
  w_->Data("string_data", kNsUri1);
  w_->StartElement("sub1");
  w_->Data(string("str"), kNsUri6);
  w_->EndElement();
  w_->StartElement("sub2");
  w_->Data("stringdata", string(kNsUri1));
  w_->EndElement();
  w_->StartElement("sub3");
  w_->Data(string("qwerty"), string(kNsUri1));
  w_->EndElement();
  w_->StartElement("sub4");
  w_->Data(numeric_limits<int>::max(), kNsUri2);
  w_->EndElement();
  w_->StartElement("sub5");
  w_->Data(numeric_limits<int>::max(), string(kNsUri3));
  w_->EndElement();
  w_->StartElement("sub6");
  w_->Data(true, kNsUri3);
  w_->EndElement();
  w_->StartElement("sub7");
  w_->Data(false, string(kNsUri2));
  w_->EndElement();
  w_->DataElement(string("child18"), string(kNsUri6), string("val"));
  w_->DataElement(string("child19"), string(kNsUri5), "val");
  w_->DataElement(string("child20"), kNsUri4, "val");
  w_->DataElement(string("child21"), kNsUri3, string("val"));
  w_->DataElement("child22", string(kNsUri7), string("val"));
  w_->DataElement("child23", string(kNsUri2), "val");
  w_->DataElement("child24", kNsUri1, string("val"));
  w_->DataElement("child25", kNsUri2, "val");
  w_->DataElement(string("child26"), string(kNsUri1), 0);
  w_->DataElement(string("child27"), kNsUri2, 1010);
  w_->DataElement("child28", string(kNsUri1), 1234);
  w_->DataElement("child29", kNsUri2, -0);
  w_->DataElement(string("child30"), string(kNsUri3), true);
  w_->DataElement(string("child31"), kNsUri2, false);
  w_->DataElement("child32", string(kNsUri4), false);
  w_->DataElement("child33", kNsUri1, true);
  w_->EndElement();

  ASSERT_EQ(9, w_->ElementDepth()) << "XML element stack depth incorrect";

  ASSERT_STREQ(kSmokeTestContentStart.c_str(), w_->GetContent());

  // calling EndDocument() will close all of the open elements, so we
  // don't have to do so.
  w_->EndDocument();

  ASSERT_STREQ(kSmokeTestContent.c_str(), w_->GetContent());
}

const char * const XmlWriterTest::kNsUri1 = "urn:loc.gov:books";
const char * const XmlWriterTest::kNsUri2 = "http://ecommerce.org/schema";
const char * const XmlWriterTest::kNsUri3 = "http://www.w3.org/TR/REC-html40";
const char * const XmlWriterTest::kNsUri4 = "urn:ISBN:0-395-36341-6";
const char * const XmlWriterTest::kNsUri5 = "urn:w3-org-ns:HTML";
const char * const XmlWriterTest::kNsUri6 = "http://www.w3.org";
const char * const XmlWriterTest::kNsUri7 = "urn:com:books-r-us";
const char * const XmlWriterTest::kDefaultEncoding = "UTF-8";

const string XmlWriterTest::kSmokeTestContentStart =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<root xmlns:a=\"urn:com:books-r-us\"><![CDATA[<&cdataisnotescaped]]>"
  "<child1 attr1=\"\" attr2=\"val\" "
  "attr3=\"val\" attr4=\"val\" attr5=\"0\" attr6=\"-2147483648\" "
  "attr7=\"true\" attr8=\"false\"><![CDATA[moreCData]]>string data&lt;"
  "!-- &amp; --&gt;2147483647true\n"
  "\n"
  "<!--a simple comment--><!--another <!--comment-->--><child2>content1"
  "</child2><child3>content2</child3><child4>content3</child4><child5>"
  "content4</child5><child6>123</child6><child7>4</child7><child8>true"
  "</child8><child9>false</child9><books:child10 xmlns:books=\"urn:loc."
  "gov:books\"><b:child11 xmlns:b=\"http://ecommerce.org/schema\">"
  "<books:child12><b:child13><child14 xmlns=\"urn:loc.gov:books\">"
  "<child15 xmlns=\"http://ecommerce.org/schema\"><child16 xmlns=\"urn:"
  "loc.gov:books\"><child17 "
  "books:attr1=\"val\" b:attr2=\"val\" books:attr3=\"val\" b:attr4=\"val\" "
  "xmlns:c=\"http://www.w3.org/TR/REC-html40\" c:attr5=\"val\" xmlns:d=\""
  "urn:ISBN:0-395-36341-6\" d:attr6=\"val\" books:attr7=\"val\" books:"
  "attr8=\"val\" books:attr9=\"0\" b:attr10=\"1010\" b:attr11=\"1234\" "
  "books:attr12=\"0\" books:attr13=\"true\" b:attr14=\"false\" b:attr15="
  "\"false\" books:attr16=\"true\" xmlns=\"http://ecommerce.org/schema\">"
  "books:string_data<sub1 xmlns:e=\"http://www.w3.org\">e:str</sub1>"
  "<sub2>books:stringdata</sub2><sub3>books:qwerty</sub3><sub4>"
  "b:2147483647</sub4><sub5>c:2147483647</sub5><sub6>c:true</sub6>"
  "<sub7>b:false</sub7><e:child18 xmlns:e=\"http://www."
  "w3.org\">val</e:child18><f:child19 xmlns:f=\"urn:w3-org-ns:HTML\">val"
  "</f:child19><d:child20>val</d:child20><c:child21>val</c:child21>"
  "<a:child22>val</a:child22><b:child23>val</b:child23><books:child24>val"
  "</books:child24><b:child25>val</b:child25><books:child26>0</books:"
  "child26><b:child27>1010</b:child27><books:child28>1234</books:child28>"
  "<b:child29>0</b:child29><c:child30>true</c:child30><b:child31>false</b:"
  "child31><d:child32>false</d:child32><books:child33>true</books:child33>"
  "</child17>";

const string XmlWriterTest::kSmokeTestContentEnd =
  "</child16></child15></child14></b:child13></books:child12>"
  "</b:child11></books:child10></child1></root>";

// EndDocument() appends a newline, so we do the same.
const string XmlWriterTest::kSmokeTestContent =
  kSmokeTestContentStart + kSmokeTestContentEnd + "\n";

const string XmlWriterTest::kExpectedOutputStart =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<root><nested name=\"John Doe\" i18n-name=\"Urs H√∂lzle\">r√©sum√©";

const string XmlWriterTest::kExpectedOutputEnd =
  "</nested><some-text>Urs H√∂lzle's r√©sum√©</some-text></root>";

// EndDocument() appends a newline, so we do the same.
const string XmlWriterTest::kExpectedOutput =
  kExpectedOutputStart + kExpectedOutputEnd + "\n";

const string XmlWriterTest::kExpectedOutputIntTest =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<root int=\"-2147483648\">-2147483648</root>\n";

const string XmlWriterTest::kExpectedOutputBoolTest =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<root bool1=\"true\" bool2=\"false\">true</root>\n";

const string XmlWriterTest::kExpectedOutputPrettyPrintTest =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<root>\n"
  " <child1>\n"
  "  <child2>\n"
  "   <child3>data</child3>\n"
  "  </child2>\n"
  " </child1>\n"
  "</root>\n";

const string XmlWriterTest::kReservedNamespaceTest =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<b:doc_root xmlns:b=\"http://other.namespace.com/otherschema/2006/"
"07/\"><xml:special_xml_node><a:child xmlns:a=\"http://my.namespace.com"
"/myschema/2006/07/\"/></xml:special_xml_node></b:doc_root>\n";

const string XmlWriterTest::kStartDocumentTwiceTest =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
  "<a:doc_root xmlns:a=\"http://my.namespace.com/myschema/2006/"
  "07/\"><b:child xmlns:b=\"http://other.namespace.com/otherschema/"
  "2006/07/\"/></a:doc_root>\n";

}  // namespace
