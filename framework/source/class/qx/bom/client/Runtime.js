/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#ignore(environment)
#ignore(process)

************************************************************************ */

/**
 * Basic runtime detection for qooxdoo.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Runtime",
{
  statics :
  {
    /**
     * Checks for the name of the runtime and returns it. In general, it checks
     * for rhino and node.js and if that could not be detected, it falls back
     * to the browser name defined by {@link qx.bom.client.Browser#getName}.
     * @return {String} The name of the current runtime.
     * @internal
     * @lint ignoreUndefined(environment, process)
     */
    getName : function() {
      var name = "";

       // check for the Rhino runtime
      if (typeof environment !== "undefined") {
        name = "rhino";
      // check for the Node.js runtime
      } else if (typeof process !== "undefined") {
        name = "node.js";
      } else {
        // otherwise, we think its a browser
        name = qx.bom.client.Browser.getName();
      }

      return name;
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("runtime.name", statics.getName);
  }
});
