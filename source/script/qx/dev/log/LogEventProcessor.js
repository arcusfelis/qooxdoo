/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>
     * Til Schneider (til132)
       <tilman dot schneider at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#require(qx.core.Object)
#use(qx.dev.log.Filter)
#use(qx.dev.log.DefaultFilter)

************************************************************************ */

/**
 * Processes log events. May be configured with filters in order to specify
 * which log events should be processed.
 */
qx.OO.defineClass("qx.dev.log.LogEventProcessor", qx.core.Object,
function() {
  qx.core.Object.call(this);
});


/**
 * Appends a filter to the filter chain.
 *
 * @param filter {Filter} The filter to append.
 */
qx.Proto.addFilter = function(filter) {
  if (this._filterArr == null) {
    this._filterArr = []
  }
  this._filterArr.push(filter);
}


/**
 * Clears the filter chain.
 */
qx.Proto.clearFilters = function() {
  this._filterArr = null;
}


/**
 * Returns the head filter from the chain. Returns null if there are no filters.
 *
 * @return {Filter} the head filter from the chain.
 */
qx.Proto.getHeadFilter = function() {
  return (this._filterArr == null || this._filterArr.length == 0) ? null : this._filterArr[0];
}


/**
 * Returns the default filter from the chain. If the head filter is no default
 * filter, the chain will be cleared and a default filter will be created.
 *
 * @return {Filter} the default filter.
 */
qx.Proto._getDefaultFilter = function() {
  var headFilter = this.getHeadFilter();
  if (! (headFilter instanceof qx.dev.log.DefaultFilter)) {
    // The head filter of the appender is no DefaultFilter
    // (or the appender has no filters at all)
    // -> Create a default handler and append it
    this.clearFilters();
    headFilter = new qx.dev.log.DefaultFilter();
    this.addFilter(headFilter);
  }

  return headFilter;
}


/**
 * Sets whether event processing should be enabled.
 * <p>
 * Note: This will clear all custom filters.
 *
 * @param enabled {boolean} whether event processing should be enabled.
 */
qx.Proto.setEnabled = function(enabled) {
  this._getDefaultFilter().setEnabled(enabled);
}


/**
 * Sets the min level an event must have in order to be processed.
 * <p>
 * Note: This will clear all custom filters.
 *
 * @param minLevel {int} the new min level.
 */
qx.Proto.setMinLevel = function(minLevel) {
  this._getDefaultFilter().setMinLevel(minLevel);
}


/**
 * Decides whether a log event is processed.
 *
 * @param evt {Map} the event to check.
 * @return {int} {@link Filter#ACCEPT}, {@link Filter#DENY} or
 *     {@link Filter#NEUTRAL}.
 */
qx.Proto.decideLogEvent = function(evt) {
  var NEUTRAL = qx.dev.log.Filter.NEUTRAL;

  if (this._filterArr != null) {
    for (var i = 0; i < this._filterArr.length; i++) {
      var decision = this._filterArr[i].decide(evt);
      if (decision != NEUTRAL) {
        return decision;
      }
    }
  }

  // All filters are neutral, so are we
  return NEUTRAL;
}


/**
 * Processes a log event.
 *
 * @param evt {Map} The log event to process.
 */
qx.Proto.handleLogEvent = function(evt) {
  throw new Error("handleLogEvent is abstract");
}
