/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Rudimentary tests to check that Sinon.JS is integrated correctly.
 *
 * Also serves as a collection of examples.
 */
qx.Class.define("qx.test.dev.unit.Sinon",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.dev.unit.MMock,
             qx.dev.unit.MRequirements],

  members :
  {
    sinon: null,

    setUp : function()
    {
      this.sinon = qx.dev.unit.Sinon.getSinon();
    },

    "test: get sinon": function() {
      var sinon = this.sinon;

      this.assertObject(sinon, "Sinon not found");
      this.assertFunction(sinon.spy, "No spy");
      this.assertFunction(sinon.stub, "No stub");
      this.assertFunction(sinon.mock, "No mock");
      this.assertFunction(sinon.useFakeTimers, "No fake timers");
      this.assertFunction(sinon.useFakeXMLHttpRequest, "No fake XHR");
    },

    "test: fail": function() {
      var sinon = this.sinon;
      this.assertException(function() {
        sinon.fail();
      });
    },

    "test: spy": function() {
      var spy = this.sinon.spy();
      spy();
      this.assertTrue(spy.called);
    },

    "test: spy conveniently": function() {
      var spy = this.spy();
      spy();
      this.assertTrue(spy.called);
    },

    "test: stub": function() {
      var whoami = this.sinon.stub();
      whoami.returns("Affe");

      this.assertEquals("Affe", whoami());
    },

    "test: stub conveniently": function() {
      var whoami = this.stub();
      whoami.returns("Affe");

      this.assertEquals("Affe", whoami());
    },

    "test: stub property": function() {
      qx.test.PROP = false;

      this.stub(qx.test, "PROP", true);
      this.assertEquals(true, qx.test.PROP);

      qx.test.PROP = undefined;
    },

    "test: stub property in isolation": function() {
      qx.test.PROP = false;

      this.stub(qx.test, "PROP", true);
      this.getSandbox().restore();
      this.assertEquals(false, qx.test.PROP);

      qx.test.PROP = undefined;
    },

    "test: stub environment setting": function() {
      var setting = this.stub(qx.core.Environment, "get").withArgs("browser.name");
      setting.returns("My Browser");
      this.assertEquals("My Browser", qx.core.Environment.get("browser.name"));
    },

    "test: stub environment setting in isolation": function() {
      var name = qx.core.Environment.get("browser.name"),
          version = qx.core.Environment.get("browser.version"),
          setting = this.stub(qx.core.Environment, "get").withArgs("browser.name");
      setting.returns("My Browser");
      this.getSandbox().restore();
      this.assertEquals(name, qx.core.Environment.get("browser.name"));
      this.assertEquals(version, qx.core.Environment.get("browser.version"));
    },

    "test: assert": function() {
      var spy = this.sinon.spy();
      spy();
      this.assertCalled(spy);
    },

    "test: fake XHR": function() {
      this.require(["xhr"]);

      this.useFakeXMLHttpRequest();
      var nxhr = window.XMLHttpRequest;
      new nxhr;
      var req = this.getRequests()[0];

      this.assertFunction(nxhr.restore, "restore");
      this.assertFunction(req.open, "open");
      this.assertFunction(req.send, "send");
    },

    "test: fake server": function() {
      this.useFakeServer();
      var server = this.getServer();
      this.assertFunction(server.respond);
      this.assertFunction(server.respondWith);
    },

    "test: respond": function() {
      this.require(["xhr"]);

      this.useFakeServer();
      var nxhr = window.XMLHttpRequest,
          req = new nxhr,
          server = this.getServer();

      server.respondWith("GET", "found", [200, {}, "FOUND"]);
      req.open("GET", "found");
      req.send();
      server.respond();

      this.assertEquals(200, req.status);
      this.assertEquals("FOUND", req.responseText);
    },

    "test: respond with invalid XML": function() {
      this.require(["xhr"]);

      this.useFakeXMLHttpRequest();
      var nxhr = window.XMLHttpRequest,
      req = new nxhr,
      fakeReq = this.getRequests()[0];

      req.open();
      req.send();
      fakeReq.respond(200, { "Content-Type": "application/xml" }, "INVALID");
    },

    "test: sandbox and restore": function() {
      var func = function() {};
      var obj = {"a": function() {}};

      var spy = this.spy(func);
      var stub = this.stub(obj, "a");
      var xhr = this.useFakeXMLHttpRequest();
      var nxhr = window.XMLHttpRequest || window.ActiveXObject("Microsoft.XMLHTTP");

      this.getSandbox().restore();
      this.assertUndefined(func.called);
      this.assertUndefined(obj.a.called);
      this.assertUndefined(nxhr.restore);
    },

    hasXhr: function() {
      return qx.core.Environment.get("io.xhr") === "xhr";
    },

    tearDown : function()
    {
      this.getSandbox().restore();
      this.sinon = null;
    }
  }
});
