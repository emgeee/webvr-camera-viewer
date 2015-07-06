(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/matt/code/webvr-camera-viewer/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/index.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var normalice = require('normalice');

/**
  # freeice

  The `freeice` module is a simple way of getting random STUN or TURN server
  for your WebRTC application.  The list of servers (just STUN at this stage)
  were sourced from this [gist](https://gist.github.com/zziuni/3741933).

  ## Example Use

  The following demonstrates how you can use `freeice` with
  [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect):

  <<< examples/quickconnect.js

  As the `freeice` module generates ice servers in a list compliant with the
  WebRTC spec you will be able to use it with raw `RTCPeerConnection`
  constructors and other WebRTC libraries.

  ## Hey, don't use my STUN/TURN server!

  If for some reason your free STUN or TURN server ends up in the
  list of servers ([stun](https://github.com/DamonOehlman/freeice/blob/master/stun.json) or
  [turn](https://github.com/DamonOehlman/freeice/blob/master/turn.json))
  that is used in this module, you can feel
  free to open an issue on this repository and those servers will be removed
  within 24 hours (or sooner).  This is the quickest and probably the most
  polite way to have something removed (and provides us some visibility
  if someone opens a pull request requesting that a server is added).

  ## Please add my server!

  If you have a server that you wish to add to the list, that's awesome! I'm
  sure I speak on behalf of a whole pile of WebRTC developers who say thanks.
  To get it into the list, feel free to either open a pull request or if you
  find that process a bit daunting then just create an issue requesting
  the addition of the server (make sure you provide all the details, and if
  you have a Terms of Service then including that in the PR/issue would be
  awesome).

  ## I know of a free server, can I add it?

  Sure, if you do your homework and make sure it is ok to use (I'm currently
  in the process of reviewing the terms of those STUN servers included from
  the original list).  If it's ok to go, then please see the previous entry
  for how to add it.

  ## Current List of Servers

  * current as at the time of last `README.md` file generation

  ### STUN

  <<< stun.json

  ### TURN

  <<< turn.json

**/

var freeice = module.exports = function(opts) {
  // if a list of servers has been provided, then use it instead of defaults
  var servers = {
    stun: (opts || {}).stun || require('./stun.json'),
    turn: (opts || {}).turn || require('./turn.json')
  };

  var stunCount = (opts || {}).stunCount || 2;
  var turnCount = (opts || {}).turnCount || 0;
  var selected;

  function getServers(type, count) {
    var out = [];
    var input = [].concat(servers[type]);
    var idx;

    while (input.length && out.length < count) {
      idx = (Math.random() * input.length) | 0;
      out = out.concat(input.splice(idx, 1));
    }

    return out.map(function(url) {
      return normalice(type + ':' + url);
    });
  }

  // add stun servers
  selected = [].concat(getServers('stun', stunCount));

  if (turnCount) {
    selected = selected.concat(getServers('turn', turnCount));
  }

  return selected;
};

},{"./stun.json":"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/stun.json","./turn.json":"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/turn.json","normalice":"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/node_modules/normalice/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/node_modules/normalice/index.js":[function(require,module,exports){
/**
  # normalice

  Normalize an ice server configuration object (or plain old string) into a format
  that is usable in all browsers supporting WebRTC.  Primarily this module is designed
  to help with the transition of the `url` attribute of the configuration object to
  the `urls` attribute.

  ## Example Usage

  <<< examples/simple.js

**/

var protocols = [
  'stun:',
  'turn:'
];

module.exports = function(input) {
  var url = (input || {}).url || input;
  var protocol;
  var parts;
  var output = {};

  // if we don't have a string url, then allow the input to passthrough
  if (typeof url != 'string' && (! (url instanceof String))) {
    return input;
  }

  // trim the url string, and convert to an array
  url = url.trim();

  // if the protocol is not known, then passthrough
  protocol = protocols[protocols.indexOf(url.slice(0, 5))];
  if (! protocol) {
    return input;
  }

  // now let's attack the remaining url parts
  url = url.slice(5);
  parts = url.split('@');

  output.username = input.username;
  output.credential = input.credential;
  // if we have an authentication part, then set the credentials
  if (parts.length > 1) {
    url = parts[1];
    parts = parts[0].split(':');

    // add the output credential and username
    output.username = parts[0];
    output.credential = (input || {}).credential || parts[1] || '';
  }

  output.url = protocol + url;
  output.urls = [ output.url ];

  return output;
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/stun.json":[function(require,module,exports){
module.exports=[
  "stun.l.google.com:19302",
  "stun1.l.google.com:19302",
  "stun2.l.google.com:19302",
  "stun3.l.google.com:19302",
  "stun4.l.google.com:19302",
  "stun.ekiga.net",
  "stun.ideasip.com",
  "stun.rixtelecom.se",
  "stun.schlund.de",
  "stun.stunprotocol.org:3478",
  "stun.voiparound.com",
  "stun.voipbuster.com",
  "stun.voipstunt.com",
  "stun.voxgratia.org",
  "stun.services.mozilla.com"
]

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/turn.json":[function(require,module,exports){
module.exports=[]

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/page/index.js":[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {String}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {String} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object} [state]
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {String} from - if param 'to' is undefined redirects to 'from'
   * @param {String} [to]
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(to);
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {str} URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options.sensitive,
      options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Object} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    var el = e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":"/Users/matt/code/webvr-camera-viewer/node_modules/browserify/node_modules/process/browser.js","path-to-regexp":"/Users/matt/code/webvr-camera-viewer/node_modules/page/node_modules/path-to-regexp/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/page/node_modules/path-to-regexp/index.js":[function(require,module,exports){
var isArray = require('isarray');

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that are always escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name:      i,
        delimiter: null,
        optional:  false,
        repeat:    false
      });
    }
  }

  return attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  return attachKeys(regexp, keys);
}

/**
 * Replace the specific tags with regexp strings.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @return {String}
 */
function replacePath (path, keys) {
  var index = 0;

  function replace (_, escaped, prefix, key, capture, group, suffix, escape) {
    if (escaped) {
      return escaped;
    }

    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    prefix = prefix ? ('\\' + prefix) : '';
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  }

  return path.replace(PATH_REGEXP, replace);
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || [];

  if (!isArray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options);
  }

  if (isArray(path)) {
    return arrayToRegexp(path, keys, options);
  }

  var strict = options.strict;
  var end = options.end !== false;
  var route = replacePath(path, keys);
  var endsWithSlash = path.charAt(path.length - 1) === '/';

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
}

},{"isarray":"/Users/matt/code/webvr-camera-viewer/node_modules/page/node_modules/path-to-regexp/node_modules/isarray/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/page/node_modules/path-to-regexp/node_modules/isarray/index.js":[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/pyrsmk-toast/src/toast.js":[function(require,module,exports){
/*! toast 1.2.4 (https://github.com/pyrsmk/toast) */

;(function(context,name,definition){
	if(typeof module!='undefined' && module.exports){
		module.exports=definition;
	}
	else if(typeof define=='function' && define.amd){
		define(definition);
	}
	else{
		context[name]=definition;
	}
}(this,'toast',function(){

	var handled_resources={};

	return function(){
		var doc=document,
			head=doc.getElementsByTagName('head')[0],
			setTimeout=this.setTimeout,
			createElement='createElement',
			appendChild='appendChild',
			onreadystatechange='onreadystatechange',
			styleSheet='styleSheet',
			loading=0,
			decrementLoading=function(){--loading;},
			i,
			// Load as much resources as we can
			loadResources=function(resources,callback,a,b){
				// Waiting for DOM readiness then load resources
				if(!head){
					setTimeout(function(){loadResources(resources);},10);
				}
				// Load resources
				else if(resources.length){
					i=-1;
					while(a=resources[++i]){
						// Simple callback
						if((b=typeof a)=='function'){
							callback=function(){a();return true;};
							break;
						}
						// Resource
						else if(b=='string'){
							loadResource(a);
						}
						// Resource + validation callback
						else if(a.pop){
							loadResource(a[0]);
							callback=a[1];
							break;
						}
					}
					watchResources(callback,Array.prototype.slice.call(resources,i+1));
				}
			},
			// Load one resource
			loadResource=function(resource,a,b){
				// Extract resource name
				b=/(^.+\.\w+)(\?.*)?$/.exec(resource)[1];
				// Verify if the resource is not already handled
				if(handled_resources[b]){
					return;
				}
				// Load resource
				handled_resources[b]=1;
				++loading;
				// JS
				if(/\.js$/.test(b)){
					// Create SCRIPT element
					a=doc[createElement]('script');
					a.src=resource;
					head[appendChild](a);
					// Watching loading state
					if(a[onreadystatechange]===null){
						// Trident, Presto
						a[onreadystatechange]=watchScript;
					}
					else{
						// Webkit, Gecko (also IE>=9 and Presto)
						a.onload=decrementLoading;
					}
				}
				// CSS
				else{
					// Create LINK element
					a=doc[createElement]('link');
					a.rel=styleSheet;
					a.href=resource;
					head[appendChild](a);
					// Watching loading state
					watchStylesheet(a);
				}
			},
			// Watch if all resources have been loaded
			watchResources=function(callback,resourcesToLoad){
				if(!loading){
					if(!callback || callback()){
						loadResources(resourcesToLoad);
						return;
					}
				}
				setTimeout(function(){watchResources(callback,resourcesToLoad);},10);
			},
			// Watch if a CSS resource has been loaded
			watchStylesheet=function(node){
				if(node.sheet || node[styleSheet]){
					decrementLoading();
					return;
				}
				setTimeout(function(){watchStylesheet(node);},10);
			},
			// Watch if a script has been loaded
			watchScript=function(){
				if(/ded|co/.test(this.readyState)){
					decrementLoading();
				}
			};
		// Load resources
		loadResources(arguments);
	};

}()));

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/index.js":[function(require,module,exports){
/* jshint node: true */
/* global location */
'use strict';

var rtc = require('rtc-tools');
var mbus = require('mbus');
var detectPlugin = require('rtc-core/plugin');
var debug = rtc.logger('rtc-quickconnect');
var extend = require('cog/extend');

/**
  # rtc-quickconnect

  This is a high level helper module designed to help you get up
  an running with WebRTC really, really quickly.  By using this module you
  are trading off some flexibility, so if you need a more flexible
  configuration you should drill down into lower level components of the
  [rtc.io](http://www.rtc.io) suite.  In particular you should check out
  [rtc](https://github.com/rtc-io/rtc).

  ## Example Usage

  In the simplest case you simply call quickconnect with a single string
  argument which tells quickconnect which server to use for signaling:

  <<< examples/simple.js

  <<< docs/events.md

  <<< docs/examples.md

  ## Regarding Signalling and a Signalling Server

  Signaling is an important part of setting up a WebRTC connection and for
  our examples we use our own test instance of the
  [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard). For your
  testing and development you are more than welcome to use this also, but
  just be aware that we use this for our testing so it may go up and down
  a little.  If you need something more stable, why not consider deploying
  an instance of the switchboard yourself - it's pretty easy :)

  ## Reference

  ```
  quickconnect(signalhost, opts?) => rtc-sigaller instance (+ helpers)
  ```

  ### Valid Quick Connect Options

  The options provided to the `rtc-quickconnect` module function influence the
  behaviour of some of the underlying components used from the rtc.io suite.

  Listed below are some of the commonly used options:

  - `ns` (default: '')

    An optional namespace for your signalling room.  While quickconnect
    will generate a unique hash for the room, this can be made to be more
    unique by providing a namespace.  Using a namespace means two demos
    that have generated the same hash but use a different namespace will be
    in different rooms.

  - `room` (default: null) _added 0.6_

    Rather than use the internal hash generation
    (plus optional namespace) for room name generation, simply use this room
    name instead.  __NOTE:__ Use of the `room` option takes precendence over
    `ns`.

  - `debug` (default: false)

  Write rtc.io suite debug output to the browser console.

  - `expectedLocalStreams` (default: not specified) _added 3.0_

    By providing a positive integer value for this option will mean that
    the created quickconnect instance will wait until the specified number of
    streams have been added to the quickconnect "template" before announcing
    to the signaling server.

  - `manualJoin` (default: `false`)

    Set this value to `true` if you would prefer to call the `join` function
    to connecting to the signalling server, rather than having that happen
    automatically as soon as quickconnect is ready to.

  #### Options for Peer Connection Creation

  Options that are passed onto the
  [rtc.createConnection](https://github.com/rtc-io/rtc#createconnectionopts-constraints)
  function:

  - `iceServers`

  This provides a list of ice servers that can be used to help negotiate a
  connection between peers.

  #### Options for P2P negotiation

  Under the hood, quickconnect uses the
  [rtc/couple](https://github.com/rtc-io/rtc#rtccouple) logic, and the options
  passed to quickconnect are also passed onto this function.

**/
module.exports = function(signalhost, opts) {
  var hash = typeof location != 'undefined' && location.hash.slice(1);
  var signaller = require('rtc-pluggable-signaller')(extend({
    signaller: signalhost,

    // use the primus endpoint as a fallback in case we are talking to an
    // older switchboard instance
    endpoints: ['/', '/primus']
  }, opts));
  var getPeerData = require('./lib/getpeerdata')(signaller.peers);

  // init configurable vars
  var ns = (opts || {}).ns || '';
  var room = (opts || {}).room;
  var debugging = (opts || {}).debug;
  var allowJoin = !(opts || {}).manualJoin;
  var profile = {};
  var announced = false;

  // initialise iceServers to undefined
  // we will not announce until these have been properly initialised
  var iceServers;

  // collect the local streams
  var localStreams = [];

  // create the calls map
  var calls = signaller.calls = require('./lib/calls')(signaller, opts);

  // create the known data channels registry
  var channels = {};

  // save the plugins passed to the signaller
  var plugins = signaller.plugins = (opts || {}).plugins || [];
  var plugin = detectPlugin(plugins);
  var pluginReady;

  // check how many local streams have been expected (default: 0)
  var expectedLocalStreams = parseInt((opts || {}).expectedLocalStreams, 10) || 0;
  var announceTimer = 0;
  var updateTimer = 0;

  function checkReadyToAnnounce() {
    clearTimeout(announceTimer);
    // if we have already announced do nothing!
    if (announced) {
      return;
    }

    if (! allowJoin) {
      return;
    }

    // if we have a plugin but it's not initialized we aren't ready
    if (plugin && (! pluginReady)) {
      return;
    }

    // if we have no iceServers we aren't ready
    if (! iceServers) {
      return;
    }

    // if we are waiting for a set number of streams, then wait until we have
    // the required number
    if (expectedLocalStreams && localStreams.length < expectedLocalStreams) {
      return;
    }

    // announce ourselves to our new friend
    announceTimer = setTimeout(function() {
      var data = extend({ room: room }, profile);

      // announce and emit the local announce event
      signaller.announce(data);
      announced = true;
    }, 0);
  }

  function connect(id) {
    var data = getPeerData(id);
    var pc;
    var monitor;

    // if the room is not a match, abort
    if (data.room !== room) {
      return;
    }

    // end any call to this id so we know we are starting fresh
    calls.end(id);

    // create a peer connection
    // iceServers that have been created using genice taking precendence
    pc = rtc.createConnection(
      extend({}, opts, { iceServers: iceServers }),
      (opts || {}).constraints
    );

    signaller('peer:connect', data.id, pc, data);

    // add this connection to the calls list
    calls.create(data.id, pc);

    // add the local streams
    localStreams.forEach(function(stream) {
      pc.addStream(stream);
    });

    // add the data channels
    // do this differently based on whether the connection is a
    // master or a slave connection
    if (signaller.isMaster(data.id)) {
      debug('is master, creating data channels: ', Object.keys(channels));

      // create the channels
      Object.keys(channels).forEach(function(label) {
       gotPeerChannel(pc.createDataChannel(label, channels[label]), pc, data);
      });
    }
    else {
      pc.ondatachannel = function(evt) {
        var channel = evt && evt.channel;

        // if we have no channel, abort
        if (! channel) {
          return;
        }

        if (channels[channel.label] !== undefined) {
          gotPeerChannel(channel, pc, getPeerData(id));
        }
      };
    }

    // couple the connections
    debug('coupling ' + signaller.id + ' to ' + data.id);
    monitor = rtc.couple(pc, id, signaller, extend({}, opts, {
      logger: mbus('pc.' + id, signaller)
    }));

    signaller('peer:couple', id, pc, data, monitor);

    // once active, trigger the peer connect event
    monitor.once('connected', calls.start.bind(null, id, pc, data));
    monitor.once('closed', calls.end.bind(null, id));

    // if we are the master connnection, create the offer
    // NOTE: this only really for the sake of politeness, as rtc couple
    // implementation handles the slave attempting to create an offer
    if (signaller.isMaster(id)) {
      monitor.createOffer();
    }
  }

  function getActiveCall(peerId) {
    var call = calls.get(peerId);

    if (! call) {
      throw new Error('No active call for peer: ' + peerId);
    }

    return call;
  }

  function gotPeerChannel(channel, pc, data) {
    var channelMonitor;

    function channelReady() {
      var call = calls.get(data.id);
      var args = [ data.id, channel, data, pc ];

      // decouple the channel.onopen listener
      debug('reporting channel "' + channel.label + '" ready, have call: ' + (!!call));
      clearInterval(channelMonitor);
      channel.onopen = null;

      // save the channel
      if (call) {
        call.channels.set(channel.label, channel);
      }

      // trigger the %channel.label%:open event
      debug('triggering channel:opened events for channel: ' + channel.label);

      // emit the plain channel:opened event
      signaller.apply(signaller, ['channel:opened'].concat(args));

      // emit the channel:opened:%label% eve
      signaller.apply(
        signaller,
        ['channel:opened:' + channel.label].concat(args)
      );
    }

    debug('channel ' + channel.label + ' discovered for peer: ' + data.id);
    if (channel.readyState === 'open') {
      return channelReady();
    }

    debug('channel not ready, current state = ' + channel.readyState);
    channel.onopen = channelReady;

    // monitor the channel open (don't trust the channel open event just yet)
    channelMonitor = setInterval(function() {
      debug('checking channel state, current state = ' + channel.readyState);
      if (channel.readyState === 'open') {
        channelReady();
      }
    }, 500);
  }

  function initPlugin() {
    return plugin && plugin.init(opts, function(err) {
      if (err) {
        return console.error('Could not initialize plugin: ', err);
      }

      pluginReady = true;
      checkReadyToAnnounce();
    });
  }

  function handleLocalAnnounce(data) {
    // if we send an announce with an updated room then update our local room name
    if (data && typeof data.room != 'undefined') {
      room = data.room;
    }
  }

  function handlePeerFilter(id, data) {
    // only connect with the peer if we are ready
    data.allow = data.allow && (localStreams.length >= expectedLocalStreams);
  }

  function handlePeerUpdate(data) {
    var id = data && data.id;
    var activeCall = id && calls.get(id);

    // if we have received an update for a peer that has no active calls,
    // then pass this onto the announce handler
    if (id && (! activeCall)) {
      debug('received peer update from peer ' + id + ', no active calls');
      signaller.to(id).send('/reconnect');
      return connect(id);
    }
  }

  // if the room is not defined, then generate the room name
  if (! room) {
    // if the hash is not assigned, then create a random hash value
    if (typeof location != 'undefined' && (! hash)) {
      hash = location.hash = '' + (Math.pow(2, 53) * Math.random());
    }

    room = ns + '#' + hash;
  }

  if (debugging) {
    rtc.logger.enable.apply(rtc.logger, Array.isArray(debug) ? debugging : ['*']);
  }

  signaller.on('peer:announce', function(data) {
    connect(data.id);
  });

  signaller.on('peer:update', handlePeerUpdate);

  signaller.on('message:reconnect', function(sender) {
    connect(sender.id);
  });



  /**
    ### Quickconnect Broadcast and Data Channel Helper Functions

    The following are functions that are patched into the `rtc-signaller`
    instance that make working with and creating functional WebRTC applications
    a lot simpler.

  **/

  /**
    #### addStream

    ```
    addStream(stream:MediaStream) => qc
    ```

    Add the stream to active calls and also save the stream so that it
    can be added to future calls.

  **/
  signaller.broadcast = signaller.addStream = function(stream) {
    localStreams.push(stream);

    // if we have any active calls, then add the stream
    calls.values().forEach(function(data) {
      data.pc.addStream(stream);
    });

    checkReadyToAnnounce();
    return signaller;
  };

  /**
    #### endCalls()

    The `endCalls` function terminates all the active calls that have been
    created in this quickconnect instance.  Calling `endCalls` does not
    kill the connection with the signalling server.

  **/
  signaller.endCalls = function() {
    calls.keys().forEach(calls.end);
  };

  /**
    #### close()

    The `close` function provides a convenient way of closing all associated
    peer connections.  This function simply uses the `endCalls` function and
    the underlying `leave` function of the signaller to do a "full cleanup"
    of all connections.
  **/
  signaller.close = function() {
    signaller.endCalls();
    signaller.leave();
  };

  /**
    #### createDataChannel(label, config)

    Request that a data channel with the specified `label` is created on
    the peer connection.  When the data channel is open and available, an
    event will be triggered using the label of the data channel.

    For example, if a new data channel was requested using the following
    call:

    ```js
    var qc = quickconnect('https://switchboard.rtc.io/').createDataChannel('test');
    ```

    Then when the data channel is ready for use, a `test:open` event would
    be emitted by `qc`.

  **/
  signaller.createDataChannel = function(label, opts) {
    // create a channel on all existing calls
    calls.keys().forEach(function(peerId) {
      var call = calls.get(peerId);
      var dc;

      // if we are the master connection, create the data channel
      if (call && call.pc && signaller.isMaster(peerId)) {
        dc = call.pc.createDataChannel(label, opts);
        gotPeerChannel(dc, call.pc, getPeerData(peerId));
      }
    });

    // save the data channel opts in the local channels dictionary
    channels[label] = opts || null;

    return signaller;
  };

  /**
    #### join()

    The `join` function is used when `manualJoin` is set to true when creating
    a quickconnect instance.  Call the `join` function once you are ready to
    join the signalling server and initiate connections with other people.

  **/
  signaller.join = function() {
    allowJoin = true;
    checkReadyToAnnounce();
  };

  /**
    #### `get(name)`

    The `get` function returns the property value for the specified property name.
  **/
  signaller.get = function(name) {
    return profile[name];
  };

  /**
    #### `getLocalStreams()`

    Return a copy of the local streams that have currently been configured
  **/
  signaller.getLocalStreams = function() {
    return [].concat(localStreams);
  };

  /**
    #### reactive()

    Flag that this session will be a reactive connection.

  **/
  signaller.reactive = function() {
    // add the reactive flag
    opts = opts || {};
    opts.reactive = true;

    // chain
    return signaller;
  };

  /**
    #### removeStream

    ```
    removeStream(stream:MediaStream)
    ```

    Remove the specified stream from both the local streams that are to
    be connected to new peers, and also from any active calls.

  **/
  signaller.removeStream = function(stream) {
    var localIndex = localStreams.indexOf(stream);

    // remove the stream from any active calls
    calls.values().forEach(function(call) {
      call.pc.removeStream(stream);
    });

    // remove the stream from the localStreams array
    if (localIndex >= 0) {
      localStreams.splice(localIndex, 1);
    }

    return signaller;
  };

  /**
    #### requestChannel

    ```
    requestChannel(targetId, label, callback)
    ```

    This is a function that can be used to respond to remote peers supplying
    a data channel as part of their configuration.  As per the `receiveStream`
    function this function will either fire the callback immediately if the
    channel is already available, or once the channel has been discovered on
    the call.

  **/
  signaller.requestChannel = function(targetId, label, callback) {
    var call = getActiveCall(targetId);
    var channel = call && call.channels.get(label);

    // if we have then channel trigger the callback immediately
    if (channel) {
      callback(null, channel);
      return signaller;
    }

    // if not, wait for it
    signaller.once('channel:opened:' + label, function(id, dc) {
      callback(null, dc);
    });

    return signaller;
  };

  /**
    #### requestStream

    ```
    requestStream(targetId, idx, callback)
    ```

    Used to request a remote stream from a quickconnect instance. If the
    stream is already available in the calls remote streams, then the callback
    will be triggered immediately, otherwise this function will monitor
    `stream:added` events and wait for a match.

    In the case that an unknown target is requested, then an exception will
    be thrown.
  **/
  signaller.requestStream = function(targetId, idx, callback) {
    var call = getActiveCall(targetId);
    var stream;

    function waitForStream(peerId) {
      if (peerId !== targetId) {
        return;
      }

      // get the stream
      stream = call.pc.getRemoteStreams()[idx];

      // if we have the stream, then remove the listener and trigger the cb
      if (stream) {
        signaller.removeListener('stream:added', waitForStream);
        callback(null, stream);
      }
    }

    // look for the stream in the remote streams of the call
    stream = call.pc.getRemoteStreams()[idx];

    // if we found the stream then trigger the callback
    if (stream) {
      callback(null, stream);
      return signaller;
    }

    // otherwise wait for the stream
    signaller.on('stream:added', waitForStream);
    return signaller;
  };

  /**
    #### profile(data)

    Update the profile data with the attached information, so when
    the signaller announces it includes this data in addition to any
    room and id information.

  **/
  signaller.profile = function(data) {
    extend(profile, data);

    // if we have already announced, then reannounce our profile to provide
    // others a `peer:update` event
    if (announced) {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(function() {
        signaller.announce(profile);
      }, (opts || {}).updateDelay || 1000);
    }

    return signaller;
  };

  /**
    #### waitForCall

    ```
    waitForCall(targetId, callback)
    ```

    Wait for a call from the specified targetId.  If the call is already
    active the callback will be fired immediately, otherwise we will wait
    for a `call:started` event that matches the requested `targetId`

  **/
  signaller.waitForCall = function(targetId, callback) {
    var call = calls.get(targetId);

    if (call && call.active) {
      callback(null, call.pc);
      return signaller;
    }

    signaller.on('call:started', function handleNewCall(id) {
      if (id === targetId) {
        signaller.removeListener('call:started', handleNewCall);
        callback(null, calls.get(id).pc);
      }
    });
  };

  // if we have an expected number of local streams, then use a filter to
  // check if we should respond
  if (expectedLocalStreams) {
    signaller.on('peer:filter', handlePeerFilter);
  }

  // respond to local announce messages
  signaller.on('local:announce', handleLocalAnnounce);

  // handle ping messages
  signaller.on('message:ping', calls.ping);

  // use genice to find our iceServers
  require('rtc-core/genice')(opts, function(err, servers) {
    if (err) {
      return console.error('could not find iceServers: ', err);
    }

    iceServers = servers;
    checkReadyToAnnounce();
  });

  // if we plugin is active, then initialize it
  if (plugin) {
    initPlugin();
  }

  // pass the signaller on
  return signaller;
};

},{"./lib/calls":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/calls.js","./lib/getpeerdata":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/getpeerdata.js","cog/extend":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/extend.js","mbus":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js","rtc-core/genice":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/genice.js","rtc-core/plugin":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/plugin.js","rtc-pluggable-signaller":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/index.js","rtc-tools":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/calls.js":[function(require,module,exports){
(function (process){
var rtc = require('rtc-tools');
var debug = rtc.logger('rtc-quickconnect');
var cleanup = require('rtc-tools/cleanup');
var getable = require('cog/getable');

module.exports = function(signaller, opts) {
  var calls = getable({});
  var getPeerData = require('./getpeerdata')(signaller.peers);
  var heartbeat;

  function create(id, pc) {
    calls.set(id, {
      active: false,
      pc: pc,
      channels: getable({}),
      streams: [],
      lastping: Date.now()
    });
  }

  function createStreamAddHandler(id) {
    return function(evt) {
      debug('peer ' + id + ' added stream');
      updateRemoteStreams(id);
      receiveRemoteStream(id)(evt.stream);
    };
  }

  function createStreamRemoveHandler(id) {
    return function(evt) {
      debug('peer ' + id + ' removed stream');
      updateRemoteStreams(id);
      signaller('stream:removed', id, evt.stream);
    };
  }

  function end(id) {
    var call = calls.get(id);

    // if we have no data, then do nothing
    if (! call) {
      return;
    }

    // if we have no data, then return
    call.channels.keys().forEach(function(label) {
      var channel = call.channels.get(label);
      var args = [id, channel, label];

      // emit the plain channel:closed event
      signaller.apply(signaller, ['channel:closed'].concat(args));

      // emit the labelled version of the event
      signaller.apply(signaller, ['channel:closed:' + label].concat(args));

      // decouple the events
      channel.onopen = null;
    });

    // trigger stream:removed events for each of the remotestreams in the pc
    call.streams.forEach(function(stream) {
      signaller('stream:removed', id, stream);
    });

    // delete the call data
    calls.delete(id);

    // if we have no more calls, disable the heartbeat
    if (calls.keys().length === 0) {
      resetHeartbeat();
    }

    // trigger the call:ended event
    signaller('call:ended', id, call.pc);

    // ensure the peer connection is properly cleaned up
    cleanup(call.pc);
  }

  function ping(sender) {
    var call = calls.get(sender && sender.id);

    // set the last ping for the data
    if (call) {
      call.lastping = Date.now();
    }
  }

  function receiveRemoteStream(id) {
    return function(stream) {
      signaller('stream:added', id, stream, getPeerData(id));
    };
  }

  function resetHeartbeat() {
    clearInterval(heartbeat);
    heartbeat = 0;
  }

  function start(id, pc, data) {
    var call = calls.get(id);
    var streams = [].concat(pc.getRemoteStreams());

    // flag the call as active
    call.active = true;
    call.streams = [].concat(pc.getRemoteStreams());

    pc.onaddstream = createStreamAddHandler(id);
    pc.onremovestream = createStreamRemoveHandler(id);

    debug(signaller.id + ' - ' + id + ' call start: ' + streams.length + ' streams');
    signaller('call:started', id, pc, data);

    // configure the heartbeat timer
    heartbeat = heartbeat || require('./heartbeat')(signaller, calls, opts);

    // examine the existing remote streams after a short delay
    process.nextTick(function() {
      // iterate through any remote streams
      streams.forEach(receiveRemoteStream(id));
    });
  }

  function updateRemoteStreams(id) {
    var call = calls.get(id);

    if (call && call.pc) {
      call.streams = [].concat(call.pc.getRemoteStreams());
    }
  }

  calls.create = create;
  calls.end = end;
  calls.ping = ping;
  calls.start = start;

  return calls;
};

}).call(this,require('_process'))

},{"./getpeerdata":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/getpeerdata.js","./heartbeat":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/heartbeat.js","_process":"/Users/matt/code/webvr-camera-viewer/node_modules/browserify/node_modules/process/browser.js","cog/getable":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/getable.js","rtc-tools":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/index.js","rtc-tools/cleanup":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/cleanup.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/getpeerdata.js":[function(require,module,exports){
module.exports = function(peers) {
  return function(id) {
    var peer = peers.get(id);
    return peer && peer.data;
  };
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/lib/heartbeat.js":[function(require,module,exports){
module.exports = function(signaller, calls, opts) {
  var heartbeat = (opts || {}).heartbeat || 2500;
  var heartbeatTimer = 0;

  function send() {
    var tickInactive = (Date.now() - (heartbeat * 4));

    // iterate through our established calls
    calls.keys().forEach(function(id) {
      var call = calls.get(id);

      // if the call ping is too old, end the call
      if (call.lastping < tickInactive) {
        signaller('call:expired', id, call.pc);
        return calls.end(id);
      }

      // send a ping message
      signaller.to(id).send('/ping');
    });
  }

  if (! heartbeat) {
    return;
  }

  return setInterval(send, heartbeat);
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/defaults.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/defaults

```js
var defaults = require('cog/defaults');
```

### defaults(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed.  Do not,
however, overwrite existing keys with new values:

```js
defaults({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  // ensure we have a target
  target = target || {};

  // iterate through the sources and copy to the target
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      if (target[prop] === void 0) {
        target[prop] = source[prop];
      }
    }
  });

  return target;
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/extend.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/extend

```js
var extend = require('cog/extend');
```

### extend(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed:

```js
extend({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      target[prop] = source[prop];
    }
  });

  return target;
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/getable.js":[function(require,module,exports){
/**
  ## cog/getable

  Take an object and provide a wrapper that allows you to `get` and
  `set` values on that object.

**/
module.exports = function(target) {
  function get(key) {
    return target[key];
  }

  function set(key, value) {
    target[key] = value;
  }

  function remove(key) {
    return delete target[key];
  }

  function keys() {
    return Object.keys(target);
  };

  function values() {
    return Object.keys(target).map(function(key) {
      return target[key];
    });
  };

  if (typeof target != 'object') {
    return target;
  }

  return {
    get: get,
    set: set,
    remove: remove,
    delete: remove,
    keys: keys,
    values: values
  };
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/jsonparse.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/jsonparse

  ```js
  var jsonparse = require('cog/jsonparse');
  ```

  ### jsonparse(input)

  This function will attempt to automatically detect stringified JSON, and
  when detected will parse into JSON objects.  The function looks for strings
  that look and smell like stringified JSON, and if found attempts to
  `JSON.parse` the input into a valid object.

**/
module.exports = function(input) {
  var isString = typeof input == 'string' || (input instanceof String);
  var reNumeric = /^\-?\d+\.?\d*$/;
  var shouldParse ;
  var firstChar;
  var lastChar;

  if ((! isString) || input.length < 2) {
    if (isString && reNumeric.test(input)) {
      return parseFloat(input);
    }

    return input;
  }

  // check for true or false
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }

  // check for null
  if (input === 'null') {
    return null;
  }

  // get the first and last characters
  firstChar = input.charAt(0);
  lastChar = input.charAt(input.length - 1);

  // determine whether we should JSON.parse the input
  shouldParse =
    (firstChar == '{' && lastChar == '}') ||
    (firstChar == '[' && lastChar == ']') ||
    (firstChar == '"' && lastChar == '"');

  if (shouldParse) {
    try {
      return JSON.parse(input);
    }
    catch (e) {
      // apparently it wasn't valid json, carry on with regular processing
    }
  }


  return reNumeric.test(input) ? parseFloat(input) : input;
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/logger.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/logger

  ```js
  var logger = require('cog/logger');
  ```

  Simple browser logging offering similar functionality to the
  [debug](https://github.com/visionmedia/debug) module.

  ### Usage

  Create your self a new logging instance and give it a name:

  ```js
  var debug = logger('phil');
  ```

  Now do some debugging:

  ```js
  debug('hello');
  ```

  At this stage, no log output will be generated because your logger is
  currently disabled.  Enable it:

  ```js
  logger.enable('phil');
  ```

  Now do some more logger:

  ```js
  debug('Oh this is so much nicer :)');
  // --> phil: Oh this is some much nicer :)
  ```

  ### Reference
**/

var active = [];
var unleashListeners = [];
var targets = [ console ];

/**
  #### logger(name)

  Create a new logging instance.
**/
var logger = module.exports = function(name) {
  // initial enabled check
  var enabled = checkActive();

  function checkActive() {
    return enabled = active.indexOf('*') >= 0 || active.indexOf(name) >= 0;
  }

  // register the check active with the listeners array
  unleashListeners[unleashListeners.length] = checkActive;

  // return the actual logging function
  return function() {
    var args = [].slice.call(arguments);

    // if we have a string message
    if (typeof args[0] == 'string' || (args[0] instanceof String)) {
      args[0] = name + ': ' + args[0];
    }

    // if not enabled, bail
    if (! enabled) {
      return;
    }

    // log
    targets.forEach(function(target) {
      target.log.apply(target, args);
    });
  };
};

/**
  #### logger.reset()

  Reset logging (remove the default console logger, flag all loggers as
  inactive, etc, etc.
**/
logger.reset = function() {
  // reset targets and active states
  targets = [];
  active = [];

  return logger.enable();
};

/**
  #### logger.to(target)

  Add a logging target.  The logger must have a `log` method attached.

**/
logger.to = function(target) {
  targets = targets.concat(target || []);

  return logger;
};

/**
  #### logger.enable(names*)

  Enable logging via the named logging instances.  To enable logging via all
  instances, you can pass a wildcard:

  ```js
  logger.enable('*');
  ```

  __TODO:__ wildcard enablers
**/
logger.enable = function() {
  // update the active
  active = active.concat([].slice.call(arguments));

  // trigger the unleash listeners
  unleashListeners.forEach(function(listener) {
    listener();
  });

  return logger;
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/throttle.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/throttle

  ```js
  var throttle = require('cog/throttle');
  ```

  ### throttle(fn, delay, opts)

  A cherry-pickable throttle function.  Used to throttle `fn` to ensure
  that it can be called at most once every `delay` milliseconds.  Will
  fire first event immediately, ensuring the next event fired will occur
  at least `delay` milliseconds after the first, and so on.

**/
module.exports = function(fn, delay, opts) {
  var lastExec = (opts || {}).leading !== false ? 0 : Date.now();
  var trailing = (opts || {}).trailing;
  var timer;
  var queuedArgs;
  var queuedScope;

  // trailing defaults to true
  trailing = trailing || trailing === undefined;
  
  function invokeDefered() {
    fn.apply(queuedScope, queuedArgs || []);
    lastExec = Date.now();
  }

  return function() {
    var tick = Date.now();
    var elapsed = tick - lastExec;

    // always clear the defered timer
    clearTimeout(timer);

    if (elapsed < delay) {
      queuedArgs = [].slice.call(arguments, 0);
      queuedScope = this;

      return trailing && (timer = setTimeout(invokeDefered, delay - elapsed));
    }

    // call the function
    lastExec = tick;
    fn.apply(this, arguments);
  };
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js":[function(require,module,exports){
var reDelim = /[\.\:]/;

/**
  # mbus

  If Node's EventEmitter and Eve were to have a child, it might look something like this.
  No wildcard support at this stage though...

  ## Example Usage

  <<< docs/usage.md

  ## Reference

  ### `mbus(namespace?, parent?, scope?)`

  Create a new message bus with `namespace` inheriting from the `parent`
  mbus instance.  If events from this message bus should be triggered with
  a specific `this` scope, then specify it using the `scope` argument.

**/

var createBus = module.exports = function(namespace, parent, scope) {
  var registry = {};
  var feeds = [];

  function bus(name) {
    var args = [].slice.call(arguments, 1);
    var delimited = normalize(name);
    var handlers = registry[delimited] || [];
    var results;

    // send through the feeds
    feeds.forEach(function(feed) {
      feed({ name: delimited, args: args });
    });

    // run the registered handlers
    results = [].concat(handlers).map(function(handler) {
      return handler.apply(scope || this, args);
    });

    // run the parent handlers
    if (bus.parent) {
      results = results.concat(
        bus.parent.apply(
          scope || this,
          [(namespace ? namespace + '.' : '') + delimited].concat(args)
        )
      );
    }

    return results;
  }

  /**
    ### `mbus#clear()`

    Reset the handler registry, which essential deregisters all event listeners.

    _Alias:_ `removeAllListeners`
  **/
  function clear(name) {
    // if we have a name, reset handlers for that handler
    if (name) {
      delete registry[normalize(name)];
    }
    // otherwise, reset the entire handler registry
    else {
      registry = {};
    }
  }

  /**
    ### `mbus#feed(handler)`

    Attach a handler function that will see all events that are sent through
    this bus in an "object stream" format that matches the following format:

    ```
    { name: 'event.name', args: [ 'event', 'args' ] }
    ```

    The feed function returns a function that can be called to stop the feed
    sending data.

  **/
  function feed(handler) {
    function stop() {
      feeds.splice(feeds.indexOf(handler), 1);
    }

    feeds.push(handler);
    return stop;
  }

  function normalize(name) {
    return (Array.isArray(name) ? name : name.split(reDelim)).join('.');
  }

  /**
    ### `mbus#off(name, handler)`

    Deregister an event handler.
  **/
  function off(name, handler) {
    var handlers = registry[normalize(name)] || [];
    var idx = handlers ? handlers.indexOf(handler._actual || handler) : -1;

    if (idx >= 0) {
      handlers.splice(idx, 1);
    }
  }

  /**
    ### `mbus#on(name, handler)`

    Register an event handler for the event `name`.

  **/
  function on(name, handler) {
    var handlers;

    name = normalize(name);
    handlers = registry[name];

    if (handlers) {
      handlers.push(handler);
    }
    else {
      registry[name] = [ handler ];
    }

    return bus;
  }


  /**
    ### `mbus#once(name, handler)`

    Register an event handler for the event `name` that will only
    trigger once (i.e. the handler will be deregistered immediately after
    being triggered the first time).

  **/
  function once(name, handler) {
    function handleEvent() {
      var result = handler.apply(this, arguments);

      bus.off(name, handleEvent);
      return result;
    }

    handler._actual = handleEvent;
    return on(name, handleEvent);
  }

  if (typeof namespace == 'function') {
    parent = namespace;
    namespace = '';
  }

  namespace = normalize(namespace || '');

  bus.clear = bus.removeAllListeners = clear;
  bus.feed = feed;
  bus.on = bus.addListener = on;
  bus.once = once;
  bus.off = bus.removeListener = off;
  bus.parent = parent || (namespace && createBus());

  return bus;
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/detect.js":[function(require,module,exports){
/* jshint node: true */
/* global window: false */
/* global navigator: false */

'use strict';

var browser = require('detect-browser');

/**
  ### `rtc-core/detect`

  A browser detection helper for accessing prefix-free versions of the various
  WebRTC types.

  ### Example Usage

  If you wanted to get the native `RTCPeerConnection` prototype in any browser
  you could do the following:

  ```js
  var detect = require('rtc-core/detect'); // also available in rtc/detect
  var RTCPeerConnection = detect('RTCPeerConnection');
  ```

  This would provide whatever the browser prefixed version of the
  RTCPeerConnection is available (`webkitRTCPeerConnection`,
  `mozRTCPeerConnection`, etc).
**/
var detect = module.exports = function(target, opts) {
  var attach = (opts || {}).attach;
  var prefixIdx;
  var prefix;
  var testName;
  var hostObject = this || (typeof window != 'undefined' ? window : undefined);

  // initialise to default prefixes
  // (reverse order as we use a decrementing for loop)
  var prefixes = ((opts || {}).prefixes || ['ms', 'o', 'moz', 'webkit']).concat('');

  // if we have no host object, then abort
  if (! hostObject) {
    return;
  }

  // iterate through the prefixes and return the class if found in global
  for (prefixIdx = prefixes.length; prefixIdx--; ) {
    prefix = prefixes[prefixIdx];

    // construct the test class name
    // if we have a prefix ensure the target has an uppercase first character
    // such that a test for getUserMedia would result in a
    // search for webkitGetUserMedia
    testName = prefix + (prefix ?
                            target.charAt(0).toUpperCase() + target.slice(1) :
                            target);

    if (typeof hostObject[testName] != 'undefined') {
      // update the last used prefix
      detect.browser = detect.browser || prefix.toLowerCase();

      if (attach) {
         hostObject[target] = hostObject[testName];
      }

      return hostObject[testName];
    }
  }
};

// detect mozilla (yes, this feels dirty)
detect.moz = typeof navigator != 'undefined' && !!navigator.mozGetUserMedia;

// set the browser and browser version
detect.browser = browser.name;
detect.browserVersion = detect.version = browser.version;

},{"detect-browser":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/node_modules/detect-browser/browser.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/genice.js":[function(require,module,exports){
/**
  ### `rtc-core/genice`

  Respond appropriately to options that are passed to packages like
  `rtc-quickconnect` and trigger a `callback` (error first) with iceServer
  values.

  The function looks for either of the following keys in the options, in
  the following order or precedence:

  1. `ice` - this can either be an array of ice server values or a generator
     function (in the same format as this function).  If this key contains a
     value then any servers specified in the `iceServers` key (2) will be
     ignored.

  2. `iceServers` - an array of ice server values.
**/
module.exports = function(opts, callback) {
  var ice = (opts || {}).ice;
  var iceServers = (opts || {}).iceServers;

  if (typeof ice == 'function') {
    return ice(opts, callback);
  }
  else if (Array.isArray(ice)) {
    return callback(null, [].concat(ice));
  }

  callback(null, [].concat(iceServers || []));
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/node_modules/detect-browser/browser.js":[function(require,module,exports){
var browsers = [
  [ 'chrome', /Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/ ],
  [ 'firefox', /Firefox\/([0-9\.]+)(?:\s|$)/ ],
  [ 'opera', /Opera\/([0-9\.]+)(?:\s|$)/ ],
  [ 'ie', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/ ],
  [ 'ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/ ],
  [ 'ie', /MSIE\s(7\.0)/ ],
  [ 'bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/ ],
  [ 'android', /Android\s([0-9\.]+)/ ],
  [ 'ios', /iPad\;\sCPU\sOS\s([0-9\._]+)/ ],
  [ 'ios',  /iPhone\;\sCPU\siPhone\sOS\s([0-9\._]+)/ ],
  [ 'safari', /Safari\/([0-9\._]+)/ ]
];

var match = browsers.map(match).filter(isMatch)[0];
var parts = match && match[3].split(/[._]/).slice(0,3);

while (parts && parts.length < 3) {
  parts.push('0');
}

// set the name and version
exports.name = match && match[0];
exports.version = parts && parts.join('.');

function match(pair) {
  return pair.concat(pair[1].exec(navigator.userAgent));
}

function isMatch(pair) {
  return !!pair[2];
}

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/plugin.js":[function(require,module,exports){
var detect = require('./detect');
var requiredFunctions = [
  'init'
];

function isSupported(plugin) {
  return plugin && typeof plugin.supported == 'function' && plugin.supported(detect);
}

function isValid(plugin) {
  var supportedFunctions = requiredFunctions.filter(function(fn) {
    return typeof plugin[fn] == 'function';
  });

  return supportedFunctions.length === requiredFunctions.length;
}

module.exports = function(plugins) {
  return [].concat(plugins || []).filter(isSupported).filter(isValid)[0];
}

},{"./detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/detect.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/index.js":[function(require,module,exports){
/**
  # rtc-pluggable-signaller

  By using `rtc-pluggable-signaller` in your code, you provide the ability
  for your package to customize which signalling client it uses (and
  thus have significant control) over how signalling operates in your
  environment.

  ## How it Works

  The pluggable signaller looks in the provided `opts` for a `signaller`
  attribute.  If the value of this attribute is a string, then it is
  assumed that you wish to use the default
  [`rtc-signaller`](https://github.com/rtc-io/rtc-signaller) in your
  package.  If, however, it is not a string value then it will be passed
  straight back as the signaller (assuming that you have provided an
  object that is compliant with the rtc.io signalling API).

**/
module.exports = function(opts) {
  var signaller = (opts || {}).signaller;
  var messenger = (opts || {}).messenger || require('rtc-switchboard-messenger');

  if (typeof signaller == 'string' || (signaller instanceof String)) {
    return require('rtc-signaller')(messenger(signaller, opts), opts);
  }

  return signaller;
};

},{"rtc-signaller":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/index.js","rtc-switchboard-messenger":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/index.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var detect = require('rtc-core/detect');
var extend = require('cog/extend');
var mbus = require('mbus');
var getable = require('cog/getable');
var uuid = require('cuid');
var pull = require('pull-stream');
var pushable = require('pull-pushable');
var prepare = require('rtc-signal/prepare');
var createQueue = require('pull-pushable');

// ready state constants
var RS_DISCONNECTED = 0;
var RS_CONNECTING = 1;
var RS_CONNECTED = 2;

// initialise signaller metadata so we don't have to include the package.json
// TODO: make this checkable with some kind of prepublish script
var metadata = {
  version: '6.2.1'
};

/**
  # rtc-signaller

  The `rtc-signaller` module provides a transportless signalling
  mechanism for WebRTC.

  ## Purpose

  <<< docs/purpose.md

  ## Getting Started

  While the signaller is capable of communicating by a number of different
  messengers (i.e. anything that can send and receive messages over a wire)
  it comes with support for understanding how to connect to an
  [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard) out of the box.

  The following code sample demonstrates how:

  <<< examples/getting-started.js

  <<< docs/events.md

  <<< docs/signalflow-diagrams.md

  <<< docs/identifying-participants.md

  ## Reference

  The `rtc-signaller` module is designed to be used primarily in a functional
  way and when called it creates a new signaller that will enable
  you to communicate with other peers via your messaging network.

  ```js
  // create a signaller from something that knows how to send messages
  var signaller = require('rtc-signaller')(messenger);
  ```

  As demonstrated in the getting started guide, you can also pass through
  a string value instead of a messenger instance if you simply want to
  connect to an existing `rtc-switchboard` instance.

**/
module.exports = function(messenger, opts) {
  var autoconnect = (opts || {}).autoconnect;
  var reconnect = (opts || {}).reconnect;
  var queue = createQueue();
  var connectionCount = 0;

  // create the signaller
  var signaller = require('rtc-signal/signaller')(opts, bufferMessage);

  var announced = false;
  var announceTimer = 0;
  var readyState = RS_DISCONNECTED;

  function bufferMessage(message) {
    queue.push(message);

    // if we are not connected (and should autoconnect), then attempt connection
    if (readyState === RS_DISCONNECTED && (autoconnect === undefined || autoconnect)) {
      connect();
    }
  }

  function handleDisconnect() {
    if (reconnect === undefined || reconnect) {
      setTimeout(connect, 50);
    }
  }

  /**
    ### `signaller.connect()`

    Manually connect the signaller using the supplied messenger.

    __NOTE:__ This should never have to be called if the default setting
    for `autoconnect` is used.
  **/
  var connect = signaller.connect = function() {
    // if we are already connecting then do nothing
    if (readyState === RS_CONNECTING) {
      return;
    }

    // initiate the messenger
    readyState = RS_CONNECTING;
    messenger(function(err, source, sink) {
      if (err) {
        readyState = RS_DISCONNECTED;
        return signaller('error', err);
      }

      // increment the connection count
      connectionCount += 1;

      // flag as connected
      readyState = RS_CONNECTED;

      // pass messages to the processor
      pull(
        source,

        // monitor disconnection
        pull.through(null, function() {
          queue = createQueue();
          readyState = RS_DISCONNECTED;
          signaller('disconnected');
        }),
        pull.drain(signaller._process)
      );

      // pass the queue to the sink
      pull(queue, sink);

      // handle disconnection
      signaller.removeListener('disconnected', handleDisconnect);
      signaller.on('disconnected', handleDisconnect);

      // trigger the connected event
      signaller('connected');

      // if this is a reconnection, then reannounce
      if (announced && connectionCount > 1) {
        signaller._announce();
      }
    });
  };

  /**
    ### announce(data?)

    The `announce` function of the signaller will pass an `/announce` message
    through the messenger network.  When no additional data is supplied to
    this function then only the id of the signaller is sent to all active
    members of the messenging network.

    #### Joining Rooms

    To join a room using an announce call you simply provide the name of the
    room you wish to join as part of the data block that you annouce, for
    example:

    ```js
    signaller.announce({ room: 'testroom' });
    ```

    Signalling servers (such as
    [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard)) will then
    place your peer connection into a room with other peers that have also
    announced in this room.

    Once you have joined a room, the server will only deliver messages that
    you `send` to other peers within that room.

    #### Providing Additional Announce Data

    There may be instances where you wish to send additional data as part of
    your announce message in your application.  For instance, maybe you want
    to send an alias or nick as part of your announce message rather than just
    use the signaller's generated id.

    If for instance you were writing a simple chat application you could join
    the `webrtc` room and tell everyone your name with the following announce
    call:

    ```js
    signaller.announce({
      room: 'webrtc',
      nick: 'Damon'
    });
    ```

    #### Announcing Updates

    The signaller is written to distinguish between initial peer announcements
    and peer data updates (see the docs on the announce handler below). As
    such it is ok to provide any data updates using the announce method also.

    For instance, I could send a status update as an announce message to flag
    that I am going offline:

    ```js
    signaller.announce({ status: 'offline' });
    ```

  **/
  signaller.announce = function(data) {
    announced = true;
    signaller._update(data);
    clearTimeout(announceTimer);

    // send the attributes over the network
    return announceTimer = setTimeout(signaller._announce, (opts || {}).announceDelay || 10);
  };

  /**
    ### leave()

    Tell the signalling server we are leaving.  Calling this function is
    usually not required though as the signalling server should issue correct
    `/leave` messages when it detects a disconnect event.

  **/
  signaller.leave = signaller.close = function() {
    // send the leave signal
    signaller.send('/leave', { id: signaller.id });

    // stop announcing on reconnect
    signaller.removeListener('disconnected', handleDisconnect);
    signaller.removeListener('connected', signaller._announce);

    // end our current queue
    queue.end();

    // set connected to false
    readyState = RS_DISCONNECTED;
  };

  // update the signaller agent
  signaller._update({ agent: 'signaller@' + metadata.version });

  // autoconnect
  if (autoconnect === undefined || autoconnect) {
    connect();
  }

  return signaller;
};

},{"cog/extend":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/extend.js","cog/getable":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/getable.js","cuid":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/cuid/dist/browser-cuid.js","mbus":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js","pull-pushable":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/index.js","pull-stream":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/index.js","rtc-core/detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/detect.js","rtc-signal/prepare":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/prepare.js","rtc-signal/signaller":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/signaller.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/cuid/dist/browser-cuid.js":[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/index.js":[function(require,module,exports){
var pull = require('pull-stream')

module.exports = pull.Source(function (onClose) {
  var buffer = [], cbs = [], waiting = [], ended

  function drain() {
    var l
    while(waiting.length && ((l = buffer.length) || ended)) {
      var data = buffer.shift()
      var cb   = cbs.shift()
      waiting.shift()(l ? null : ended, data)
      cb && cb(ended === true ? null : ended)
    }
  }

  function read (end, cb) {
    ended = ended || end
    waiting.push(cb)
    drain()
    if(ended)
      onClose && onClose(ended === true ? null : ended)
  }

  read.push = function (data, cb) {
    if(ended)
      return cb && cb(ended === true ? null : ended)
    buffer.push(data); cbs.push(cb)
    drain()
  }

  read.end = function (end, cb) {
    if('function' === typeof end)
      cb = end, end = true
    ended = ended || end || true;
    if(cb) cbs.push(cb)
    drain()
    if(ended)
      onClose && onClose(ended === true ? null : ended)
  }

  return read
})


},{"pull-stream":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/index.js":[function(require,module,exports){

var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
var u        = require('pull-core')

for(var k in sources)
  exports[k] = u.Source(sources[k])

for(var k in throughs)
  exports[k] = u.Through(throughs[k])

for(var k in sinks)
  exports[k] = u.Sink(sinks[k])

var maybe = require('./maybe')(exports)

for(var k in maybe)
  exports[k] = maybe[k]

exports.Duplex  = 
exports.Through = exports.pipeable       = u.Through
exports.Source  = exports.pipeableSource = u.Source
exports.Sink    = exports.pipeableSink   = u.Sink



},{"./maybe":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/maybe.js","./sinks":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/sinks.js","./sources":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/sources.js","./throughs":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/throughs.js","pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/maybe.js":[function(require,module,exports){
var u = require('pull-core')
var prop = u.prop
var id   = u.id
var maybeSink = u.maybeSink

module.exports = function (pull) {

  var exports = {}
  var drain = pull.drain

  var find = 
  exports.find = function (test, cb) {
    return maybeSink(function (cb) {
      var ended = false
      if(!cb)
        cb = test, test = id
      else
        test = prop(test) || id

      return drain(function (data) {
        if(test(data)) {
          ended = true
          cb(null, data)
        return false
        }
      }, function (err) {
        if(ended) return //already called back
        cb(err === true ? null : err, null)
      })

    }, cb)
  }

  var reduce = exports.reduce = 
  function (reduce, acc, cb) {
    
    return maybeSink(function (cb) {
      return drain(function (data) {
        acc = reduce(acc, data)
      }, function (err) {
        cb(err, acc)
      })

    }, cb)
  }

  var collect = exports.collect = exports.writeArray =
  function (cb) {
    return reduce(function (arr, item) {
      arr.push(item)
      return arr
    }, [], cb)
  }

  return exports
}

},{"pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/node_modules/pull-core/index.js":[function(require,module,exports){
exports.id = 
function (item) {
  return item
}

exports.prop = 
function (map) {  
  if('string' == typeof map) {
    var key = map
    return function (data) { return data[key] }
  }
  return map
}

exports.tester = function (test) {
  if(!test) return exports.id
  if('object' === typeof test
    && 'function' === typeof test.test)
      return test.test.bind(test)
  return exports.prop(test) || exports.id
}

exports.addPipe = addPipe

function addPipe(read) {
  if('function' !== typeof read)
    return read

  read.pipe = read.pipe || function (reader) {
    if('function' != typeof reader)
      throw new Error('must pipe to reader')
    return addPipe(reader(read))
  }
  read.type = 'Source'
  return read
}

var Source =
exports.Source =
function Source (createRead) {
  function s() {
    var args = [].slice.call(arguments)
    return addPipe(createRead.apply(null, args))
  }
  s.type = 'Source'
  return s
}


var Through =
exports.Through = 
function (createRead) {
  return function () {
    var args = [].slice.call(arguments)
    var piped = []
    function reader (read) {
      args.unshift(read)
      read = createRead.apply(null, args)
      while(piped.length)
        read = piped.shift()(read)
      return read
      //pipeing to from this reader should compose...
    }
    reader.pipe = function (read) {
      piped.push(read) 
      if(read.type === 'Source')
        throw new Error('cannot pipe ' + reader.type + ' to Source')
      reader.type = read.type === 'Sink' ? 'Sink' : 'Through'
      return reader
    }
    reader.type = 'Through'
    return reader
  }
}

var Sink =
exports.Sink = 
function Sink(createReader) {
  return function () {
    var args = [].slice.call(arguments)
    if(!createReader)
      throw new Error('must be createReader function')
    function s (read) {
      args.unshift(read)
      return createReader.apply(null, args)
    }
    s.type = 'Sink'
    return s
  }
}


exports.maybeSink = 
exports.maybeDrain = 
function (createSink, cb) {
  if(!cb)
    return Through(function (read) {
      var ended
      return function (close, cb) {
        if(close) return read(close, cb)
        if(ended) return cb(ended)

        createSink(function (err, data) {
          ended = err || true
          if(!err) cb(null, data)
          else     cb(ended)
        }) (read)
      }
    })()

  return Sink(function (read) {
    return createSink(cb) (read)
  })()
}


},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/sinks.js":[function(require,module,exports){
var drain = exports.drain = function (read, op, done) {

  ;(function next() {
    var loop = true, cbed = false
    while(loop) {
      cbed = false
      read(null, function (end, data) {
        cbed = true
        if(end) {
          loop = false
          done && done(end === true ? null : end)
        }
        else if(op && false === op(data)) {
          loop = false
          read(true, done || function () {})
        }
        else if(!loop){
          next()
        }
      })
      if(!cbed) {
        loop = false
        return
      }
    }
  })()
}

var onEnd = exports.onEnd = function (read, done) {
  return drain(read, null, done)
}

var log = exports.log = function (read, done) {
  return drain(read, function (data) {
    console.log(data)
  }, done)
}


},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/sources.js":[function(require,module,exports){

var keys = exports.keys =
function (object) {
  return values(Object.keys(object))
}

var once = exports.once =
function (value) {
  return function (abort, cb) {
    if(abort) return cb(abort)
    if(value != null) {
      var _value = value; value = null
      cb(null, _value)
    } else
      cb(true)
  }
}

var values = exports.values = exports.readArray =
function (array) {
  if(!Array.isArray(array))
    array = Object.keys(array).map(function (k) {
      return array[k]
    })
  var i = 0
  return function (end, cb) {
    if(end)
      return cb && cb(end)  
    cb(i >= array.length || null, array[i++])
  }
}


var count = exports.count = 
function (max) {
  var i = 0; max = max || Infinity
  return function (end, cb) {
    if(end) return cb && cb(end)
    if(i > max)
      return cb(true)
    cb(null, i++)
  }
}

var infinite = exports.infinite = 
function (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}

var defer = exports.defer = function () {
  var _read, cbs = [], _end

  var read = function (end, cb) {
    if(!_read) {
      _end = end
      cbs.push(cb)
    } 
    else _read(end, cb)
  }
  read.resolve = function (read) {
    if(_read) throw new Error('already resolved')
    _read = read
    if(!_read) throw new Error('no read cannot resolve!' + _read)
    while(cbs.length)
      _read(_end, cbs.shift())
  }
  read.abort = function(err) {
    read.resolve(function (_, cb) {
      cb(err || true)
    })
  }
  return read
}

var empty = exports.empty = function () {
  return function (abort, cb) {
    cb(true)
  }
}

var depthFirst = exports.depthFirst =
function (start, createStream) {
  var reads = []

  reads.unshift(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        //if this stream has ended, go to the next queue
        reads.shift()
        return next(null, cb)
      }
      reads.unshift(createStream(data))
      cb(end, data)
    })
  }
}
//width first is just like depth first,
//but push each new stream onto the end of the queue
var widthFirst = exports.widthFirst = 
function (start, createStream) {
  var reads = []

  reads.push(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        return next(null, cb)
      }
      reads.push(createStream(data))
      cb(end, data)
    })
  }
}

//this came out different to the first (strm)
//attempt at leafFirst, but it's still a valid
//topological sort.
var leafFirst = exports.leafFirst = 
function (start, createStream) {
  var reads = []
  var output = []
  reads.push(once(start))
  
  return function next (end, cb) {
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        if(!output.length)
          return cb(true)
        return cb(null, output.shift())
      }
      reads.unshift(createStream(data))
      output.unshift(data)
      next(null, cb)
    })
  }
}


},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/throughs.js":[function(require,module,exports){
(function (process){
var u      = require('pull-core')
var sources = require('./sources')
var sinks = require('./sinks')

var prop   = u.prop
var id     = u.id
var tester = u.tester

var map = exports.map = 
function (read, map) {
  map = prop(map) || id
  return function (end, cb) {
    read(end, function (end, data) {
      var data = !end ? map(data) : null
      cb(end, data)
    })
  }
}

var asyncMap = exports.asyncMap =
function (read, map) {
  if(!map) return read
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    read(null, function (end, data) {
      if(end) return cb(end, data)
      map(data, cb)
    })
  }
}

var paraMap = exports.paraMap =
function (read, map, width) {
  if(!map) return read
  var ended = false, queue = [], _cb

  function drain () {
    if(!_cb) return
    var cb = _cb
    _cb = null
    if(queue.length)
      return cb(null, queue.shift())
    else if(ended && !n)
      return cb(ended)
    _cb = cb
  }

  function pull () {
    read(null, function (end, data) {
      if(end) {
        ended = end
        return drain()
      }
      n++
      map(data, function (err, data) {
        n--

        queue.push(data)
        drain()
      })

      if(n < width && !ended)
        pull()
    })
  }

  var n = 0
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    //continue to read while there are less than 3 maps in flight
    _cb = cb
    if(queue.length || ended)
      pull(), drain()
    else pull()
  }
  return highWaterMark(asyncMap(read, map), width)
}

var filter = exports.filter =
function (read, test) {
  //regexp
  test = tester(test)
  return function next (end, cb) {
    read(end, function (end, data) {
      if(!end && !test(data))
        return next(end, cb)
      cb(end, data)
    })
  }
}

var filterNot = exports.filterNot =
function (read, test) {
  test = tester(test)
  return filter(read, function (e) {
    return !test(e)
  })
}

var through = exports.through = 
function (read, op, onEnd) {
  var a = false
  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (end, cb) {
    if(end) once(end)
    return read(end, function (end, data) {
      if(!end) op && op(data)
      else once(end)
      cb(end, data)
    })
  }
}

var take = exports.take =
function (read, test) {
  var ended = false
  if('number' === typeof test) {
    var n = test; test = function () {
      return n --
    }
  }

  return function (end, cb) {
    if(ended) return cb(ended)
    if(ended = end) return read(ended, cb)

    read(null, function (end, data) {
      if(ended = ended || end) return cb(ended)
      if(!test(data)) {
        ended = true
        read(true, function (end, data) {
          cb(ended, data)
        })
      }
      else
        cb(null, data)
    })
  }
}

var unique = exports.unique = function (read, field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(read, function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}

var nonUnique = exports.nonUnique = function (read, field) {
  return unique(read, field, true)
}

var group = exports.group =
function (read, size) {
  var ended; size = size || 5
  var queue = []

  return function (end, cb) {
    //this means that the upstream is sending an error.
    if(end) return read(ended = end, cb)
    //this means that we read an end before.
    if(ended) return cb(ended)

    read(null, function next(end, data) {
      if(ended = ended || end) {
        if(!queue.length)
          return cb(ended)

        var _queue = queue; queue = []
        return cb(null, _queue)
      }
      queue.push(data)
      if(queue.length < size)
        return read(null, next)

      var _queue = queue; queue = []
      cb(null, _queue)
    })
  }
}

var flatten = exports.flatten = function (read) {
  var _read
  return function (abort, cb) {
    if(_read) nextChunk()
    else      nextStream()

    function nextChunk () {
      _read(null, function (end, data) {
        if(end) nextStream()
        else    cb(null, data)
      })
    }
    function nextStream () {
      read(null, function (end, stream) {
        if(end)
          return cb(end)
        if(Array.isArray(stream))
          stream = sources.values(stream)
        else if('function' != typeof stream)
          throw new Error('expected stream of streams')
        
        _read = stream
        nextChunk()
      })
    }
  }
}

var prepend =
exports.prepend =
function (read, head) {

  return function (abort, cb) {
    if(head !== null) {
      if(abort)
        return read(abort, cb)
      var _head = head
      head = null
      cb(null, _head)
    } else {
      read(abort, cb)
    }
  }

}

//var drainIf = exports.drainIf = function (op, done) {
//  sinks.drain(
//}

var _reduce = exports._reduce = function (read, reduce, initial) {
  return function (close, cb) {
    if(close) return read(close, cb)
    if(ended) return cb(ended)

    sinks.drain(function (item) {
      initial = reduce(initial, item)
    }, function (err, data) {
      ended = err || true
      if(!err) cb(null, initial)
      else     cb(ended)
    })
    (read)
  }
}

var nextTick = process.nextTick

var highWaterMark = exports.highWaterMark = 
function (read, highWaterMark) {
  var buffer = [], waiting = [], ended, reading = false
  highWaterMark = highWaterMark || 10

  function readAhead () {
    while(waiting.length && (buffer.length || ended))
      waiting.shift()(ended, ended ? null : buffer.shift())
  }

  function next () {
    if(ended || reading || buffer.length >= highWaterMark)
      return
    reading = true
    return read(ended, function (end, data) {
      reading = false
      ended = ended || end
      if(data != null) buffer.push(data)
      
      next(); readAhead()
    })
  }

  nextTick(next)

  return function (end, cb) {
    ended = ended || end
    waiting.push(cb)

    next(); readAhead()
  }
}




}).call(this,require('_process'))

},{"./sinks":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/sinks.js","./sources":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/sources.js","_process":"/Users/matt/code/webvr-camera-viewer/node_modules/browserify/node_modules/process/browser.js","pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-pushable/node_modules/pull-stream/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/index.js":[function(require,module,exports){
var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
var u        = require('pull-core')

function isFunction (fun) {
  return 'function' === typeof fun
}

function isReader (fun) {
  return fun && (fun.type === "Through" || fun.length === 1)
}
var exports = module.exports = function pull () {
  var args = [].slice.call(arguments)

  if(isReader(args[0]))
    return function (read) {
      args.unshift(read)
      return pull.apply(null, args)
    }

  var read = args.shift()

  //if the first function is a duplex stream,
  //pipe from the source.
  if(isFunction(read.source))
    read = read.source

  function next () {
    var s = args.shift()

    if(null == s)
      return next()

    if(isFunction(s)) return s

    return function (read) {
      s.sink(read)
      //this supports pipeing through a duplex stream
      //pull(a, b, a) "telephone style".
      //if this stream is in the a (first & last position)
      //s.source will have already been used, but this should never be called
      //so that is okay.
      return s.source
    }
  }

  while(args.length)
    read = next() (read)

  return read
}


for(var k in sources)
  exports[k] = u.Source(sources[k])

for(var k in throughs)
  exports[k] = u.Through(throughs[k])

for(var k in sinks)
  exports[k] = u.Sink(sinks[k])

var maybe = require('./maybe')(exports)

for(var k in maybe)
  exports[k] = maybe[k]

exports.Duplex  = 
exports.Through = exports.pipeable       = u.Through
exports.Source  = exports.pipeableSource = u.Source
exports.Sink    = exports.pipeableSink   = u.Sink



},{"./maybe":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/maybe.js","./sinks":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/sinks.js","./sources":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/sources.js","./throughs":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/throughs.js","pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/maybe.js":[function(require,module,exports){
var u = require('pull-core')
var prop = u.prop
var id   = u.id
var maybeSink = u.maybeSink

module.exports = function (pull) {

  var exports = {}
  var drain = pull.drain

  var find =
  exports.find = function (test, cb) {
    return maybeSink(function (cb) {
      var ended = false
      if(!cb)
        cb = test, test = id
      else
        test = prop(test) || id

      return drain(function (data) {
        if(test(data)) {
          ended = true
          cb(null, data)
        return false
        }
      }, function (err) {
        if(ended) return //already called back
        cb(err === true ? null : err, null)
      })

    }, cb)
  }

  var reduce = exports.reduce =
  function (reduce, acc, cb) {

    return maybeSink(function (cb) {
      return drain(function (data) {
        acc = reduce(acc, data)
      }, function (err) {
        cb(err, acc)
      })

    }, cb)
  }

  var collect = exports.collect = exports.writeArray =
  function (cb) {
    return reduce(function (arr, item) {
      arr.push(item)
      return arr
    }, [], cb)
  }

  var concat = exports.concat =
  function (cb) {
    return reduce(function (a, b) {
      return a + b
    }, '', cb)
  }

  return exports
}

},{"pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/node_modules/pull-core/index.js":[function(require,module,exports){
exports.id = 
function (item) {
  return item
}

exports.prop = 
function (map) {  
  if('string' == typeof map) {
    var key = map
    return function (data) { return data[key] }
  }
  return map
}

exports.tester = function (test) {
  if(!test) return exports.id
  if('object' === typeof test
    && 'function' === typeof test.test)
      return test.test.bind(test)
  return exports.prop(test) || exports.id
}

exports.addPipe = addPipe

function addPipe(read) {
  if('function' !== typeof read)
    return read

  read.pipe = read.pipe || function (reader) {
    if('function' != typeof reader && 'function' != typeof reader.sink)
      throw new Error('must pipe to reader')
    var pipe = addPipe(reader.sink ? reader.sink(read) : reader(read))
    return reader.source || pipe;
  }
  
  read.type = 'Source'
  return read
}

var Source =
exports.Source =
function Source (createRead) {
  function s() {
    var args = [].slice.call(arguments)
    return addPipe(createRead.apply(null, args))
  }
  s.type = 'Source'
  return s
}


var Through =
exports.Through = 
function (createRead) {
  return function () {
    var args = [].slice.call(arguments)
    var piped = []
    function reader (read) {
      args.unshift(read)
      read = createRead.apply(null, args)
      while(piped.length)
        read = piped.shift()(read)
      return read
      //pipeing to from this reader should compose...
    }
    reader.pipe = function (read) {
      piped.push(read) 
      if(read.type === 'Source')
        throw new Error('cannot pipe ' + reader.type + ' to Source')
      reader.type = read.type === 'Sink' ? 'Sink' : 'Through'
      return reader
    }
    reader.type = 'Through'
    return reader
  }
}

var Sink =
exports.Sink = 
function Sink(createReader) {
  return function () {
    var args = [].slice.call(arguments)
    if(!createReader)
      throw new Error('must be createReader function')
    function s (read) {
      args.unshift(read)
      return createReader.apply(null, args)
    }
    s.type = 'Sink'
    return s
  }
}


exports.maybeSink = 
exports.maybeDrain = 
function (createSink, cb) {
  if(!cb)
    return Through(function (read) {
      var ended
      return function (close, cb) {
        if(close) return read(close, cb)
        if(ended) return cb(ended)

        createSink(function (err, data) {
          ended = err || true
          if(!err) cb(null, data)
          else     cb(ended)
        }) (read)
      }
    })()

  return Sink(function (read) {
    return createSink(cb) (read)
  })()
}


},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/sinks.js":[function(require,module,exports){
var drain = exports.drain = function (read, op, done) {

  ;(function next() {
    var loop = true, cbed = false
    while(loop) {
      cbed = false
      read(null, function (end, data) {
        cbed = true
        if(end) {
          loop = false
          if(done) done(end === true ? null : end)
          else if(end && end !== true)
            throw end
        }
        else if(op && false === op(data)) {
          loop = false
          read(true, done || function () {})
        }
        else if(!loop){
          next()
        }
      })
      if(!cbed) {
        loop = false
        return
      }
    }
  })()
}

var onEnd = exports.onEnd = function (read, done) {
  return drain(read, null, done)
}

var log = exports.log = function (read, done) {
  return drain(read, function (data) {
    console.log(data)
  }, done)
}


},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/sources.js":[function(require,module,exports){

var keys = exports.keys =
function (object) {
  return values(Object.keys(object))
}

function abortCb(cb, abort, onAbort) {
  cb(abort)
  onAbort && onAbort(abort === true ? null: abort)
  return
}

var once = exports.once =
function (value, onAbort) {
  return function (abort, cb) {
    if(abort)
      return abortCb(cb, abort, onAbort)
    if(value != null) {
      var _value = value; value = null
      cb(null, _value)
    } else
      cb(true)
  }
}

var values = exports.values = exports.readArray =
function (array, onAbort) {
  if(!array)
    return function (abort, cb) {
      if(abort) return abortCb(cb, abort, onAbort)
      return cb(true)
    }
  if(!Array.isArray(array))
    array = Object.keys(array).map(function (k) {
      return array[k]
    })
  var i = 0
  return function (abort, cb) {
    if(abort)
      return abortCb(cb, abort, onAbort)
    cb(i >= array.length || null, array[i++])
  }
}


var count = exports.count =
function (max) {
  var i = 0; max = max || Infinity
  return function (end, cb) {
    if(end) return cb && cb(end)
    if(i > max)
      return cb(true)
    cb(null, i++)
  }
}

var infinite = exports.infinite =
function (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}

var defer = exports.defer = function () {
  var _read, cbs = [], _end

  var read = function (end, cb) {
    if(!_read) {
      _end = end
      cbs.push(cb)
    } 
    else _read(end, cb)
  }
  read.resolve = function (read) {
    if(_read) throw new Error('already resolved')
    _read = read
    if(!_read) throw new Error('no read cannot resolve!' + _read)
    while(cbs.length)
      _read(_end, cbs.shift())
  }
  read.abort = function(err) {
    read.resolve(function (_, cb) {
      cb(err || true)
    })
  }
  return read
}

var empty = exports.empty = function () {
  return function (abort, cb) {
    cb(true)
  }
}

var error = exports.error = function (err) {
  return function (abort, cb) {
    cb(err)
  }
}

var depthFirst = exports.depthFirst =
function (start, createStream) {
  var reads = []

  reads.unshift(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        //if this stream has ended, go to the next queue
        reads.shift()
        return next(null, cb)
      }
      reads.unshift(createStream(data))
      cb(end, data)
    })
  }
}
//width first is just like depth first,
//but push each new stream onto the end of the queue
var widthFirst = exports.widthFirst =
function (start, createStream) {
  var reads = []

  reads.push(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        return next(null, cb)
      }
      reads.push(createStream(data))
      cb(end, data)
    })
  }
}

//this came out different to the first (strm)
//attempt at leafFirst, but it's still a valid
//topological sort.
var leafFirst = exports.leafFirst =
function (start, createStream) {
  var reads = []
  var output = []
  reads.push(once(start))

  return function next (end, cb) {
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        if(!output.length)
          return cb(true)
        return cb(null, output.shift())
      }
      reads.unshift(createStream(data))
      output.unshift(data)
      next(null, cb)
    })
  }
}


},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/throughs.js":[function(require,module,exports){
(function (process){
var u      = require('pull-core')
var sources = require('./sources')
var sinks = require('./sinks')

var prop   = u.prop
var id     = u.id
var tester = u.tester

var map = exports.map =
function (read, map) {
  map = prop(map) || id
  return function (abort, cb) {
    read(abort, function (end, data) {
      try {
      data = !end ? map(data) : null
      } catch (err) {
        return read(err, function () {
          return cb(err)
        })
      }
      cb(end, data)
    })
  }
}

var asyncMap = exports.asyncMap =
function (read, map) {
  if(!map) return read
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    read(null, function (end, data) {
      if(end) return cb(end, data)
      map(data, cb)
    })
  }
}

var paraMap = exports.paraMap =
function (read, map, width) {
  if(!map) return read
  var ended = false, queue = [], _cb

  function drain () {
    if(!_cb) return
    var cb = _cb
    _cb = null
    if(queue.length)
      return cb(null, queue.shift())
    else if(ended && !n)
      return cb(ended)
    _cb = cb
  }

  function pull () {
    read(null, function (end, data) {
      if(end) {
        ended = end
        return drain()
      }
      n++
      map(data, function (err, data) {
        n--

        queue.push(data)
        drain()
      })

      if(n < width && !ended)
        pull()
    })
  }

  var n = 0
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    //continue to read while there are less than 3 maps in flight
    _cb = cb
    if(queue.length || ended)
      pull(), drain()
    else pull()
  }
  return highWaterMark(asyncMap(read, map), width)
}

var filter = exports.filter =
function (read, test) {
  //regexp
  test = tester(test)
  return function next (end, cb) {
    var sync, loop = true
    while(loop) {
      loop = false
      sync = true
      read(end, function (end, data) {
        if(!end && !test(data))
          return sync ? loop = true : next(end, cb)
        cb(end, data)
      })
      sync = false
    }
  }
}

var filterNot = exports.filterNot =
function (read, test) {
  test = tester(test)
  return filter(read, function (e) {
    return !test(e)
  })
}

var through = exports.through =
function (read, op, onEnd) {
  var a = false
  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (end, cb) {
    if(end) once(end)
    return read(end, function (end, data) {
      if(!end) op && op(data)
      else once(end)
      cb(end, data)
    })
  }
}

var take = exports.take =
function (read, test) {
  var ended = false
  if('number' === typeof test) {
    var n = test; test = function () {
      return n --
    }
  }

  return function (end, cb) {
    if(ended) return cb(ended)
    if(ended = end) return read(ended, cb)

    read(null, function (end, data) {
      if(ended = ended || end) return cb(ended)
      if(!test(data)) {
        ended = true
        read(true, function (end, data) {
          cb(ended, data)
        })
      }
      else
        cb(null, data)
    })
  }
}

var unique = exports.unique = function (read, field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(read, function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}

var nonUnique = exports.nonUnique = function (read, field) {
  return unique(read, field, true)
}

var group = exports.group =
function (read, size) {
  var ended; size = size || 5
  var queue = []

  return function (end, cb) {
    //this means that the upstream is sending an error.
    if(end) return read(ended = end, cb)
    //this means that we read an end before.
    if(ended) return cb(ended)

    read(null, function next(end, data) {
      if(ended = ended || end) {
        if(!queue.length)
          return cb(ended)

        var _queue = queue; queue = []
        return cb(null, _queue)
      }
      queue.push(data)
      if(queue.length < size)
        return read(null, next)

      var _queue = queue; queue = []
      cb(null, _queue)
    })
  }
}

var flatten = exports.flatten = function (read) {
  var _read
  return function (abort, cb) {
    if(_read) nextChunk()
    else      nextStream()

    function nextChunk () {
      _read(null, function (end, data) {
        if(end) nextStream()
        else    cb(null, data)
      })
    }
    function nextStream () {
      read(null, function (end, stream) {
        if(end)
          return cb(end)
        if(Array.isArray(stream) || stream && 'object' === typeof stream)
          stream = sources.values(stream)
        else if('function' != typeof stream)
          throw new Error('expected stream of streams')
        _read = stream
        nextChunk()
      })
    }
  }
}

var prepend =
exports.prepend =
function (read, head) {

  return function (abort, cb) {
    if(head !== null) {
      if(abort)
        return read(abort, cb)
      var _head = head
      head = null
      cb(null, _head)
    } else {
      read(abort, cb)
    }
  }

}

//var drainIf = exports.drainIf = function (op, done) {
//  sinks.drain(
//}

var _reduce = exports._reduce = function (read, reduce, initial) {
  return function (close, cb) {
    if(close) return read(close, cb)
    if(ended) return cb(ended)

    sinks.drain(function (item) {
      initial = reduce(initial, item)
    }, function (err, data) {
      ended = err || true
      if(!err) cb(null, initial)
      else     cb(ended)
    })
    (read)
  }
}

var nextTick = process.nextTick

var highWaterMark = exports.highWaterMark =
function (read, highWaterMark) {
  var buffer = [], waiting = [], ended, ending, reading = false
  highWaterMark = highWaterMark || 10

  function readAhead () {
    while(waiting.length && (buffer.length || ended))
      waiting.shift()(ended, ended ? null : buffer.shift())

    if (!buffer.length && ending) ended = ending;
  }

  function next () {
    if(ended || ending || reading || buffer.length >= highWaterMark)
      return
    reading = true
    return read(ended || ending, function (end, data) {
      reading = false
      ending = ending || end
      if(data != null) buffer.push(data)

      next(); readAhead()
    })
  }

  process.nextTick(next)

  return function (end, cb) {
    ended = ended || end
    waiting.push(cb)

    next(); readAhead()
  }
}

var flatMap = exports.flatMap =
function (read, mapper) {
  mapper = mapper || id
  var queue = [], ended

  return function (abort, cb) {
    if(queue.length) return cb(null, queue.shift())
    else if(ended)   return cb(ended)

    read(abort, function next (end, data) {
      if(end) ended = end
      else {
        var add = mapper(data)
        while(add && add.length)
          queue.push(add.shift())
      }

      if(queue.length) cb(null, queue.shift())
      else if(ended)   cb(ended)
      else             read(null, next)
    })
  }
}


}).call(this,require('_process'))

},{"./sinks":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/sinks.js","./sources":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/sources.js","_process":"/Users/matt/code/webvr-camera-viewer/node_modules/browserify/node_modules/process/browser.js","pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/handlers/announce.js":[function(require,module,exports){
var extend = require('cog/extend');

module.exports = function(signaller) {

  function dataAllowed(data) {
    var cloned = extend({ allow: true }, data);
    signaller('peer:filter', data.id, cloned);

    return cloned.allow;
  }

  return function(args, messageType, srcData, srcState, isDM) {
    var data = args[0];
    var peer;

    // if we have valid data then process
    if (data && data.id && data.id !== signaller.id) {
      if (! dataAllowed(data)) {
        return;
      }
      // check to see if this is a known peer
      peer = signaller.peers.get(data.id);

      // trigger the peer connected event to flag that we know about a
      // peer connection. The peer has passed the "filter" check but may
      // be announced / updated depending on previous connection status
      signaller('peer:connected', data.id, data);

      // if the peer is existing, then update the data
      if (peer) {
        // update the data
        extend(peer.data, data);

        // trigger the peer update event
        return signaller('peer:update', data, srcData);
      }

      // create a new peer
      peer = {
        id: data.id,

        // initialise the local role index
        roleIdx: [data.id, signaller.id].sort().indexOf(data.id),

        // initialise the peer data
        data: {}
      };

      // initialise the peer data
      extend(peer.data, data);

      // set the peer data
      signaller.peers.set(data.id, peer);

      // if this is an initial announce message (no vector clock attached)
      // then send a announce reply
      if (signaller.autoreply && (! isDM)) {
        signaller
          .to(data.id)
          .send('/announce', signaller.attributes);
      }

      // emit a new peer announce event
      return signaller('peer:announce', data, peer);
    }
  };
};

},{"cog/extend":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/extend.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/prepare.js":[function(require,module,exports){
/**
  ### prepare

  ```
  fn(args) => String
  ```

  Convert an array of values into a pipe-delimited string.

**/
module.exports = function(args) {
  return args.map(prepareArg).join('|');
};

function prepareArg(arg) {
  if (typeof arg == 'object' && (! (arg instanceof String))) {
    return JSON.stringify(arg);
  }
  else if (typeof arg == 'function') {
    return null;
  }

  return arg;
}

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/process.js":[function(require,module,exports){
var jsonparse = require('cog/jsonparse');

/**
  ### process

  ```
  fn(signaller, opts) => fn(message)
  ```

  The core processing logic that is used to respond to incoming signaling
  messages.

**/
module.exports = function(signaller, opts) {
  var handlers = {
    announce: require('./handlers/announce')(signaller, opts)
  };

  function sendEvent(parts, srcState, data) {
    // initialise the event name
    var evtName = 'message:' + parts[0].slice(1);

    // convert any valid json objects to json
    var args = parts.slice(2).map(jsonparse);

    signaller.apply(
      signaller,
      [evtName].concat(args).concat([srcState, data])
    );
  }

  return function(originalData) {
    var data = originalData;
    var isMatch = true;
    var parts;
    var handler;
    var srcData;
    var srcState;
    var isDirectMessage = false;

    // discard primus messages
    if (data && data.slice(0, 6) === 'primus') {
      return;
    }

    // force the id into string format so we can run length and comparison tests on it
    var id = signaller.id + '';

    // process /to messages
    if (data.slice(0, 3) === '/to') {
      isMatch = data.slice(4, id.length + 4) === id;
      if (isMatch) {
        parts = data.slice(5 + id.length).split('|').map(jsonparse);

        // get the source data
        isDirectMessage = true;

        // extract the vector clock and update the parts
        parts = parts.map(jsonparse);
      }
    }

    // if this is not a match, then bail
    if (! isMatch) {
      return;
    }

    // chop the data into parts
    signaller('rawdata', data);
    parts = parts || data.split('|').map(jsonparse);

    // if we have a specific handler for the action, then invoke
    if (typeof parts[0] == 'string') {
      // extract the metadata from the input data
      srcData = parts[1];

      // if we got data from ourself, then this is pretty dumb
      // but if we have then throw it away
      if (srcData === signaller.id) {
        return console.warn('got data from ourself, discarding');
      }

      // get the source state
      srcState = signaller.peers.get(srcData) || srcData;

      // handle commands
      if (parts[0].charAt(0) === '/') {
        // look for a handler for the message type
        handler = handlers[parts[0].slice(1)];

        if (typeof handler == 'function') {
          handler(
            parts.slice(2),
            parts[0].slice(1),
            srcData,
            srcState,
            isDirectMessage
          );
        }
        else {
          sendEvent(parts, srcState, originalData);
        }
      }
      // otherwise, emit data
      else {
        signaller(
          'data',
          parts.slice(0, 1).concat(parts.slice(2)),
          srcData,
          srcState,
          isDirectMessage
        );
      }
    }
  };
};

},{"./handlers/announce":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/handlers/announce.js","cog/jsonparse":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/jsonparse.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/signaller.js":[function(require,module,exports){
var detect = require('rtc-core/detect');
var extend = require('cog/extend');
var getable = require('cog/getable');
var cuid = require('cuid');
var mbus = require('mbus');
var prepare = require('./prepare');

/**
  ## `signaller(opts, bufferMessage) => mbus`

  Create a base level signaller which is capable of processing
  messages from an incoming source.  The signaller is capable of
  sending messages outbound using the `bufferMessage` function
  that is supplied to the signaller.

**/
module.exports = function(opts, bufferMessage) {
  // get the autoreply setting
  var autoreply = (opts || {}).autoreply;

  // create the signaller mbus
  var signaller = mbus('', (opts || {}).logger);

  // initialise the peers
  var peers = signaller.peers = getable({});

  // initialise the signaller attributes
  var attributes = signaller.attributes = {
    browser: detect.browser,
    browserVersion: detect.browserVersion,
    agent: 'unknown'
  };

  function createToMessage(header) {
    return function() {
      var args = header.concat([].slice.call(arguments));

      // inject the signaller.id
      args.splice(3, 0, signaller.id);
      bufferMessage(prepare(args));
    }
  }

  // initialise the signaller id
  signaller.id = (opts || {}).id || cuid();

  /**
    #### `isMaster(targetId) => Boolean`

    A simple function that indicates whether the local signaller is the master
    for it's relationship with peer signaller indicated by `targetId`.  Roles
    are determined at the point at which signalling peers discover each other,
    and are simply worked out by whichever peer has the lowest signaller id
    when lexigraphically sorted.

    For example, if we have two signaller peers that have discovered each
    others with the following ids:

    - `b11f4fd0-feb5-447c-80c8-c51d8c3cced2`
    - `8a07f82e-49a5-4b9b-a02e-43d911382be6`

    They would be assigned roles:

    - `b11f4fd0-feb5-447c-80c8-c51d8c3cced2`
    - `8a07f82e-49a5-4b9b-a02e-43d911382be6` (master)

  **/
  signaller.isMaster = function(targetId) {
    var peer = peers.get(targetId);

    return peer && peer.roleIdx !== 0;
  };

  /**
    #### `send(args*)`

    Prepare a message for sending, e.g.:

    ```js
    signaller.send('/foo', 'bar');
    ```

  **/
  signaller.send = function() {
    var args = [].slice.call(arguments);

    // inject the metadata
    args.splice(1, 0, signaller.id);

    // send the message
    bufferMessage(prepare(args));
  };


  /**
    #### `to(targetId)`

    Use the `to` function to send a message to the specified target peer.
    A large parge of negotiating a WebRTC peer connection involves direct
    communication between two parties which must be done by the signalling
    server.  The `to` function provides a simple way to provide a logical
    communication channel between the two parties:

    ```js
    var send = signaller.to('e95fa05b-9062-45c6-bfa2-5055bf6625f4').send;

    // create an offer on a local peer connection
    pc.createOffer(
      function(desc) {
        // set the local description using the offer sdp
        // if this occurs successfully send this to our peer
        pc.setLocalDescription(
          desc,
          function() {
            send('/sdp', desc);
          },
          handleFail
        );
      },
      handleFail
    );
    ```

  **/
  signaller.to = function(targetId) {
    return {
      send: createToMessage(['/to', targetId])
    };
  };

  /**
    ### Signaller Internals

    The following functions are designed for use by signallers that are built
    on top of this base signaller.
  **/

  /**
    #### `_announce()`

    The internal function that constructs the `/announce` message and triggers
    the `local:announce` event.

  **/
  signaller._announce = function() {
    signaller.send('/announce', attributes);
    signaller('local:announce', attributes);
  };

  /**
    #### `_process(data)`


  **/
  signaller._process = require('./process')(signaller);

  /**
    #### `_update`

    Internal function that updates core announce attributes with
    updated data.

**/
  signaller._update = function(data) {
    extend(attributes, data, { id: signaller.id });
  };

  // set the autoreply flag
  signaller.autoreply = autoreply === undefined || autoreply;

  return signaller;
};

},{"./prepare":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/prepare.js","./process":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/rtc-signal/process.js","cog/extend":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/extend.js","cog/getable":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/getable.js","cuid":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/cuid/dist/browser-cuid.js","mbus":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js","rtc-core/detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/detect.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/index.js":[function(require,module,exports){
var extend = require('cog/extend');

/**
  # rtc-switchboard-messenger

  A specialised version of
  [`messenger-ws`](https://github.com/DamonOehlman/messenger-ws) designed to
  connect to [`rtc-switchboard`](http://github.com/rtc-io/rtc-switchboard)
  instances.

**/
module.exports = function(switchboard, opts) {
  return require('messenger-ws')(switchboard, extend({
    endpoints: (opts || {}).endpoints || ['/']
  }, opts));
};

},{"cog/extend":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/extend.js","messenger-ws":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/index.js":[function(require,module,exports){
var WebSocket = require('ws');
var wsurl = require('wsurl');
var ps = require('pull-ws');
var defaults = require('cog/defaults');
var reTrailingSlash = /\/$/;
var DEFAULT_FAILCODES = [];

/**
  # messenger-ws

  This is a simple messaging implementation for sending and receiving data
  via websockets.

  Follows the [messenger-archetype](https://github.com/DamonOehlman/messenger-archetype)

  ## Example Usage

  <<< examples/simple.js

**/
module.exports = function(url, opts) {
  var timeout = (opts || {}).timeout || 1000;
  var failcodes = (opts || {}).failcodes || DEFAULT_FAILCODES;
  var endpoints = ((opts || {}).endpoints || ['/']).map(function(endpoint) {
    return url.replace(reTrailingSlash, '') + endpoint;
  });

  function connect(callback) {
    var queue = [].concat(endpoints);
    var isConnected = false;
    var socket;
    var failTimer;
    var successTimer;
    var removeListener;
    var source;

    function attemptNext() {
      // if we have already connected, do nothing
      // NOTE: workaround for websockets/ws#489
      if (isConnected) {
        return;
      }

      // if we have no more valid endpoints, then erorr out
      if (queue.length === 0) {
        return callback(new Error('Unable to connect to url: ' + url));
      }

      socket = new WebSocket(wsurl(queue.shift()));
      socket.addEventListener('message', connect);
      socket.addEventListener('error', handleError);
      socket.addEventListener('close', handleClose);
      socket.addEventListener('open', handleOpen);

      removeListener = socket.removeEventListener || socket.removeListener;
      failTimer = setTimeout(attemptNext, timeout);
    }

    function connect() {
      // if we are already connected, abort
      // NOTE: workaround for websockets/ws#489
      if (isConnected) {
        return;
      }

      // clear any monitors
      clearTimeout(failTimer);
      clearTimeout(successTimer);

      // remove the close and error listeners as messenger-ws has done
      // what it set out to do and that is create a connection
      // NOTE: issue websockets/ws#489 causes means this fails in ws
      removeListener.call(socket, 'open', handleOpen);
      removeListener.call(socket, 'close', handleClose);
      removeListener.call(socket, 'error', handleError);
      removeListener.call(socket, 'message', connect);

      // trigger the callback
      isConnected = true;
      callback(null, source, ps.sink(socket, opts));
    }

    function handleClose(evt) {
      var clean = evt.wasClean && (
        evt.code === undefined || failcodes.indexOf(evt.code) < 0
      );

      // if this was not a clean close, then handle error
      if (! clean) {
        return handleError();
      }

      clearTimeout(successTimer);
      clearTimeout(failTimer);
    }

    function handleError() {
      clearTimeout(successTimer);
      clearTimeout(failTimer);
      attemptNext();
    }

    function handleOpen() {
      // create the source immediately to buffer any data
      source = ps.source(socket, opts);

      // monitor data flowing from the socket
      successTimer = setTimeout(connect, 100);
    }

    attemptNext();
  }

  return connect;
};

},{"cog/defaults":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/defaults.js","pull-ws":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/index.js","ws":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/ws/lib/browser.js","wsurl":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/wsurl/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/index.js":[function(require,module,exports){
exports = module.exports = duplex;

exports.source = require('./source');
exports.sink = require('./sink');

function duplex (ws, opts) {
  return {
    source: exports.source(ws),
    sink: exports.sink(ws, opts)
  };
};

},{"./sink":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/sink.js","./source":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/source.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/node_modules/pull-core/index.js":[function(require,module,exports){
arguments[4]["/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-signaller/node_modules/pull-stream/node_modules/pull-core/index.js"][0].apply(exports,arguments)
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/ready.js":[function(require,module,exports){
module.exports = function(socket, callback) {
  var remove = socket && (socket.removeEventListener || socket.removeListener);

  function cleanup () {
    if (typeof remove == 'function') {
      remove.call(socket, 'open', handleOpen);
      remove.call(socket, 'error', handleErr);
    }
  }

  function handleOpen(evt) {
    cleanup(); callback();
  }

  function handleErr (evt) {
    cleanup(); callback(evt);
  }

  // if the socket is closing or closed, return end
  if (socket.readyState >= 2) {
    return callback(true);
  }

  // if open, trigger the callback
  if (socket.readyState === 1) {
    return callback();
  }

  socket.addEventListener('open', handleOpen);
  socket.addEventListener('error', handleErr);
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/sink.js":[function(require,module,exports){
(function (process){
var pull = require('pull-core');
var ready = require('./ready');

/**
  ### `sink(socket, opts?)`

  Create a pull-stream `Sink` that will write data to the `socket`.

  <<< examples/write.js

**/
module.exports = pull.Sink(function(read, socket, opts) {
  opts = opts || {}
  var closeOnEnd = opts.closeOnEnd !== false;
  var onClose = 'function' === typeof opts ? opts : opts.onClose;

  function next(end, data) {
    // if the stream has ended, simply return
    if (end) {
      if (closeOnEnd && socket.readyState <= 1) {
        if(onClose)
          socket.addEventListener('close', function (ev) {
            if(ev.wasClean) onClose()
            else {
              var err = new Error('ws error')
              err.event = ev
              onClose(err)
            }
          });

        socket.close();
      }

      return;
    }

    // socket ready?
    ready(socket, function(end) {
      if (end) {
        return read(end, function () {});
      }

      socket.send(data);
      process.nextTick(function() {
        read(null, next);
      });
    });
  }

  read(null, next);
});

}).call(this,require('_process'))

},{"./ready":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/ready.js","_process":"/Users/matt/code/webvr-camera-viewer/node_modules/browserify/node_modules/process/browser.js","pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/source.js":[function(require,module,exports){
var pull = require('pull-core');
var ready = require('./ready');

/**
  ### `source(socket)`

  Create a pull-stream `Source` that will read data from the `socket`.

  <<< examples/read.js

**/
module.exports = pull.Source(function(socket) {
  var buffer = [];
  var receiver;
  var ended;

  socket.addEventListener('message', function(evt) {
    if (receiver) {
      return receiver(null, evt.data);
    }

    buffer.push(evt.data);
  });

  socket.addEventListener('close', function(evt) {
    if (ended) return;
    if (receiver) {
      return receiver(ended = true);
    }
  });

  socket.addEventListener('error', function (evt) {
    if (ended) return;
    ended = evt;
    if (receiver) {
      receiver(ended);
    }
  });

  function read(abort, cb) {
    receiver = null;

    //if stream has already ended.
    if (ended)
      return cb(ended)

    // if ended, abort
    if (abort) {
      //this will callback when socket closes
      receiver = cb
      return socket.close()
    }

    ready(socket, function(end) {
      if (end) {
        return cb(ended = end);
      }

      // read from the socket
      if (ended && ended !== true) {
        return cb(ended);
      }
      else if (buffer.length > 0) {
        return cb(null, buffer.shift());
      }
      else if (ended) {
        return cb(true);
      }

      receiver = cb;
    });
  };

  return read;
});

},{"./ready":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/ready.js","pull-core":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/pull-ws/node_modules/pull-core/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/ws/lib/browser.js":[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-pluggable-signaller/node_modules/rtc-switchboard-messenger/node_modules/messenger-ws/node_modules/wsurl/index.js":[function(require,module,exports){
var reHttpUrl = /^http(.*)$/;

/**
  # wsurl

  Given a url (including protocol relative urls - i.e. `//`), generate an appropriate
  url for a WebSocket endpoint (`ws` or `wss`).

  ## Example Usage

  <<< examples/relative.js

**/

module.exports = function(url, opts) {
  var current = (opts || {}).current || (typeof location != 'undefined' && location.href);
  var currentProtocol = current && current.slice(0, current.indexOf(':'));
  var insecure = (opts || {}).insecure;
  var isRelative = url.slice(0, 2) == '//';
  var forceWS = (! currentProtocol) || currentProtocol === 'file:';

  if (isRelative) {
    return forceWS ?
      ((insecure ? 'ws:' : 'wss:') + url) :
      (currentProtocol.replace(reHttpUrl, 'ws$1') + ':' + url);
  }

  return url.replace(reHttpUrl, 'ws$1');
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/cleanup.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('rtc/cleanup');

var CANNOT_CLOSE_STATES = [
  'closed'
];

var EVENTS_DECOUPLE_BC = [
  'addstream',
  'datachannel',
  'icecandidate',
  'negotiationneeded',
  'removestream',
  'signalingstatechange'
];

var EVENTS_DECOUPLE_AC = [
  'iceconnectionstatechange'
];

/**
  ### rtc-tools/cleanup

  ```
  cleanup(pc)
  ```

  The `cleanup` function is used to ensure that a peer connection is properly
  closed and ready to be cleaned up by the browser.

**/
module.exports = function(pc) {
  // see if we can close the connection
  var currentState = pc.iceConnectionState;
  var canClose = CANNOT_CLOSE_STATES.indexOf(currentState) < 0;

  function decouple(events) {
    events.forEach(function(evtName) {
      if (pc['on' + evtName]) {
        pc['on' + evtName] = null;
      }
    });
  }

  // decouple "before close" events
  decouple(EVENTS_DECOUPLE_BC);

  if (canClose) {
    debug('attempting connection close, current state: '+ pc.iceConnectionState);
    pc.close();
  }

  // remove the event listeners
  // after a short delay giving the connection time to trigger
  // close and iceconnectionstatechange events
  setTimeout(function() {
    decouple(EVENTS_DECOUPLE_AC);
  }, 100);
};

},{"cog/logger":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/logger.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/couple.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var mbus = require('mbus');
var queue = require('rtc-taskqueue');
var cleanup = require('./cleanup');
var monitor = require('./monitor');
var throttle = require('cog/throttle');
var pluck = require('whisk/pluck');
var pluckCandidate = pluck('candidate', 'sdpMid', 'sdpMLineIndex');
var CLOSED_STATES = [ 'closed', 'failed' ];
var CHECKING_STATES = [ 'checking' ];

/**
  ### rtc-tools/couple

  #### couple(pc, targetId, signaller, opts?)

  Couple a WebRTC connection with another webrtc connection identified by
  `targetId` via the signaller.

  The following options can be provided in the `opts` argument:

  - `sdpfilter` (default: null)

    A simple function for filtering SDP as part of the peer
    connection handshake (see the Using Filters details below).

  ##### Example Usage

  ```js
  var couple = require('rtc/couple');

  couple(pc, '54879965-ce43-426e-a8ef-09ac1e39a16d', signaller);
  ```

  ##### Using Filters

  In certain instances you may wish to modify the raw SDP that is provided
  by the `createOffer` and `createAnswer` calls.  This can be done by passing
  a `sdpfilter` function (or array) in the options.  For example:

  ```js
  // run the sdp from through a local tweakSdp function.
  couple(pc, '54879965-ce43-426e-a8ef-09ac1e39a16d', signaller, {
    sdpfilter: tweakSdp
  });
  ```

**/
function couple(pc, targetId, signaller, opts) {
  var debugLabel = (opts || {}).debugLabel || 'rtc';
  var debug = require('cog/logger')(debugLabel + '/couple');

  // create a monitor for the connection
  var mon = monitor(pc, targetId, signaller, (opts || {}).logger);
  var emit = mbus('', mon);
  var reactive = (opts || {}).reactive;
  var endOfCandidates = true;

  // configure the time to wait between receiving a 'disconnect'
  // iceConnectionState and determining that we are closed
  var disconnectTimeout = (opts || {}).disconnectTimeout || 10000;
  var disconnectTimer;

  // initilaise the negotiation helpers
  var isMaster = signaller.isMaster(targetId);

  // initialise the processing queue (one at a time please)
  var q = queue(pc, opts);

  var createOrRequestOffer = throttle(function() {
    if (! isMaster) {
      return signaller.to(targetId).send('/negotiate');
    }

    q.createOffer();
  }, 100, { leading: false });

  var debounceOffer = throttle(q.createOffer, 100, { leading: false });

  function decouple() {
    debug('decoupling ' + signaller.id + ' from ' + targetId);

    // stop the monitor
//     mon.removeAllListeners();
    mon.stop();

    // cleanup the peerconnection
    cleanup(pc);

    // remove listeners
    signaller.removeListener('sdp', handleSdp);
    signaller.removeListener('candidate', handleCandidate);
    signaller.removeListener('negotiate', handleNegotiateRequest);

    // remove listeners (version >= 5)
    signaller.removeListener('message:sdp', handleSdp);
    signaller.removeListener('message:candidate', handleCandidate);
    signaller.removeListener('message:negotiate', handleNegotiateRequest);
  }

  function handleCandidate(data) {
    q.addIceCandidate(data);
  }

  function handleSdp(sdp, src) {
    emit('sdp.remote', sdp);

    // if the source is unknown or not a match, then don't process
    if ((! src) || (src.id !== targetId)) {
      return;
    }

    q.setRemoteDescription(sdp);
  }

  function handleConnectionClose() {
    debug('captured pc close, iceConnectionState = ' + pc.iceConnectionState);
    decouple();
  }

  function handleDisconnect() {
    debug('captured pc disconnect, monitoring connection status');

    // start the disconnect timer
    disconnectTimer = setTimeout(function() {
      debug('manually closing connection after disconnect timeout');
      cleanup(pc);
    }, disconnectTimeout);

    mon.on('statechange', handleDisconnectAbort);
  }

  function handleDisconnectAbort() {
    debug('connection state changed to: ' + pc.iceConnectionState);

    // if the state is checking, then do not reset the disconnect timer as
    // we are doing our own checking
    if (CHECKING_STATES.indexOf(pc.iceConnectionState) >= 0) {
      return;
    }

    resetDisconnectTimer();

    // if we have a closed or failed status, then close the connection
    if (CLOSED_STATES.indexOf(pc.iceConnectionState) >= 0) {
      return mon('closed');
    }

    mon.once('disconnect', handleDisconnect);
  }

  function handleLocalCandidate(evt) {
    var data = evt.candidate && pluckCandidate(evt.candidate);

    if (evt.candidate) {
      resetDisconnectTimer();
      emit('ice.local', data);
      signaller.to(targetId).send('/candidate', data);
      endOfCandidates = false;
    }
    else if (! endOfCandidates) {
      endOfCandidates = true;
      emit('ice.gathercomplete');
      signaller.to(targetId).send('/endofcandidates', {});
    }
  }

  function handleNegotiateRequest(src) {
    if (src.id === targetId) {
      emit('negotiate.request', src.id);
      debounceOffer();
    }
  }

  function resetDisconnectTimer() {
    mon.off('statechange', handleDisconnectAbort);

    // clear the disconnect timer
    debug('reset disconnect timer, state: ' + pc.iceConnectionState);
    clearTimeout(disconnectTimer);
  }

  // when regotiation is needed look for the peer
  if (reactive) {
    pc.onnegotiationneeded = function() {
      emit('negotiate.renegotiate');
      createOrRequestOffer();
    };
  }

  pc.onicecandidate = handleLocalCandidate;

  // when the task queue tells us we have sdp available, send that over the wire
  q.on('sdp.local', function(desc) {
    signaller.to(targetId).send('/sdp', desc);
  });

  // when we receive sdp, then
  signaller.on('sdp', handleSdp);
  signaller.on('candidate', handleCandidate);

  // listeners (signaller >= 5)
  signaller.on('message:sdp', handleSdp);
  signaller.on('message:candidate', handleCandidate);

  // if this is a master connection, listen for negotiate events
  if (isMaster) {
    signaller.on('negotiate', handleNegotiateRequest);
    signaller.on('message:negotiate', handleNegotiateRequest); // signaller >= 5
  }

  // when the connection closes, remove event handlers
  mon.once('closed', handleConnectionClose);
  mon.once('disconnected', handleDisconnect);

  // patch in the create offer functions
  mon.createOffer = createOrRequestOffer;

  return mon;
}

module.exports = couple;

},{"./cleanup":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/cleanup.js","./monitor":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/monitor.js","cog/logger":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/logger.js","cog/throttle":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/throttle.js","mbus":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js","rtc-taskqueue":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/index.js","whisk/pluck":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/pluck.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/detect.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ### rtc-tools/detect

  Provide the [rtc-core/detect](https://github.com/rtc-io/rtc-core#detect)
  functionality.
**/
module.exports = require('rtc-core/detect');

},{"rtc-core/detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/detect.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/generators.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('generators');
var detect = require('./detect');
var defaults = require('cog/defaults');

var mappings = {
  create: {
    dtls: function(c) {
      if (! detect.moz) {
        c.optional = (c.optional || []).concat({ DtlsSrtpKeyAgreement: true });
      }
    }
  }
};

/**
  ### rtc-tools/generators

  The generators package provides some utility methods for generating
  constraint objects and similar constructs.

  ```js
  var generators = require('rtc/generators');
  ```

**/

/**
  #### generators.config(config)

  Generate a configuration object suitable for passing into an W3C
  RTCPeerConnection constructor first argument, based on our custom config.

  In the event that you use short term authentication for TURN, and you want
  to generate new `iceServers` regularly, you can specify an iceServerGenerator
  that will be used prior to coupling. This generator should return a fully
  compliant W3C (RTCIceServer dictionary)[http://www.w3.org/TR/webrtc/#idl-def-RTCIceServer].

  If you pass in both a generator and iceServers, the iceServers _will be
  ignored and the generator used instead.
**/

exports.config = function(config) {
  var iceServerGenerator = (config || {}).iceServerGenerator;

  return defaults({}, config, {
    iceServers: typeof iceServerGenerator == 'function' ? iceServerGenerator() : []
  });
};

/**
  #### generators.connectionConstraints(flags, constraints)

  This is a helper function that will generate appropriate connection
  constraints for a new `RTCPeerConnection` object which is constructed
  in the following way:

  ```js
  var conn = new RTCPeerConnection(flags, constraints);
  ```

  In most cases the constraints object can be left empty, but when creating
  data channels some additional options are required.  This function
  can generate those additional options and intelligently combine any
  user defined constraints (in `constraints`) with shorthand flags that
  might be passed while using the `rtc.createConnection` helper.
**/
exports.connectionConstraints = function(flags, constraints) {
  var generated = {};
  var m = mappings.create;
  var out;

  // iterate through the flags and apply the create mappings
  Object.keys(flags || {}).forEach(function(key) {
    if (m[key]) {
      m[key](generated);
    }
  });

  // generate the connection constraints
  out = defaults({}, constraints, generated);
  debug('generated connection constraints: ', out);

  return out;
};

},{"./detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/detect.js","cog/defaults":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/defaults.js","cog/logger":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/logger.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/index.js":[function(require,module,exports){
/* jshint node: true */

'use strict';

/**
  # rtc-tools

  The `rtc-tools` module does most of the heavy lifting within the
  [rtc.io](http://rtc.io) suite.  Primarily it handles the logic of coupling
  a local `RTCPeerConnection` with it's remote counterpart via an
  [rtc-signaller](https://github.com/rtc-io/rtc-signaller) signalling
  channel.

  ## Getting Started

  If you decide that the `rtc-tools` module is a better fit for you than either
  [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect) or
  [rtc](https://github.com/rtc-io/rtc) then the code snippet below
  will provide you a guide on how to get started using it in conjunction with
  the [rtc-signaller](https://github.com/rtc-io/rtc-signaller) (version 5.0 and above)
  and [rtc-media](https://github.com/rtc-io/rtc-media) modules:

  <<< examples/getting-started.js

  This code definitely doesn't cover all the cases that you need to consider
  (i.e. peers leaving, etc) but it should demonstrate how to:

  1. Capture video and add it to a peer connection
  2. Couple a local peer connection with a remote peer connection
  3. Deal with the remote steam being discovered and how to render
     that to the local interface.

  ## Reference

**/

var gen = require('./generators');

// export detect
var detect = exports.detect = require('./detect');
var findPlugin = require('rtc-core/plugin');

// export cog logger for convenience
exports.logger = require('cog/logger');

// export peer connection
var RTCPeerConnection =
exports.RTCPeerConnection = detect('RTCPeerConnection');

// add the couple utility
exports.couple = require('./couple');

/**
  ### createConnection

  ```
  createConnection(opts?, constraints?) => RTCPeerConnection
  ```

  Create a new `RTCPeerConnection` auto generating default opts as required.

  ```js
  var conn;

  // this is ok
  conn = rtc.createConnection();

  // and so is this
  conn = rtc.createConnection({
    iceServers: []
  });
  ```
**/
exports.createConnection = function(opts, constraints) {
  var plugin = findPlugin((opts || {}).plugins);
  var PeerConnection = (opts || {}).RTCPeerConnection || RTCPeerConnection;

  // generate the config based on options provided
  var config = gen.config(opts);

  // generate appropriate connection constraints
  constraints = gen.connectionConstraints(opts, constraints);

  if (plugin && typeof plugin.createConnection == 'function') {
    return plugin.createConnection(config, constraints);
  }

  return new PeerConnection(config, constraints);
};

},{"./couple":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/couple.js","./detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/detect.js","./generators":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/generators.js","cog/logger":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/logger.js","rtc-core/plugin":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/plugin.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/monitor.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var mbus = require('mbus');

// define some state mappings to simplify the events we generate
var stateMappings = {
  completed: 'connected'
};

// define the events that we need to watch for peer connection
// state changes
var peerStateEvents = [
  'signalingstatechange',
  'iceconnectionstatechange',
];

/**
  ### rtc-tools/monitor

  ```
  monitor(pc, targetId, signaller, parentBus) => mbus
  ```

  The monitor is a useful tool for determining the state of `pc` (an
  `RTCPeerConnection`) instance in the context of your application. The
  monitor uses both the `iceConnectionState` information of the peer
  connection and also the various
  [signaller events](https://github.com/rtc-io/rtc-signaller#signaller-events)
  to determine when the connection has been `connected` and when it has
  been `disconnected`.

  A monitor created `mbus` is returned as the result of a
  [couple](https://github.com/rtc-io/rtc#rtccouple) between a local peer
  connection and it's remote counterpart.

**/
module.exports = function(pc, targetId, signaller, parentBus) {
  var monitor = mbus('', parentBus);
  var state;

  function checkState() {
    var newState = getMappedState(pc.iceConnectionState);

    // flag the we had a state change
    monitor('statechange', pc, newState);

    // if the active state has changed, then send the appopriate message
    if (state !== newState) {
      monitor(newState);
      state = newState;
    }
  }

  function handleClose() {
    monitor('closed');
  }

  pc.onclose = handleClose;
  peerStateEvents.forEach(function(evtName) {
    pc['on' + evtName] = checkState;
  });

  monitor.stop = function() {
    pc.onclose = null;
    peerStateEvents.forEach(function(evtName) {
      pc['on' + evtName] = null;
    });
  };

  monitor.checkState = checkState;

  // if we haven't been provided a valid peer connection, abort
  if (! pc) {
    return monitor;
  }

  // determine the initial is active state
  state = getMappedState(pc.iceConnectionState);

  return monitor;
};

/* internal helpers */

function getMappedState(state) {
  return stateMappings[state] || state;
}

},{"mbus":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/index.js":[function(require,module,exports){
var detect = require('rtc-core/detect');
var findPlugin = require('rtc-core/plugin');
var PriorityQueue = require('priorityqueuejs');
var pluck = require('whisk/pluck');
var pluckSessionDesc = pluck('sdp', 'type');

// some validation routines
var checkCandidate = require('rtc-validator/candidate');

// the sdp cleaner
var sdpclean = require('rtc-sdpclean');
var parseSdp = require('rtc-sdp');

var PRIORITY_LOW = 100;
var PRIORITY_WAIT = 1000;

// priority order (lower is better)
var DEFAULT_PRIORITIES = [
  'addIceCandidate',
  'setLocalDescription',
  'setRemoteDescription',
  'createAnswer',
  'createOffer'
];

// define event mappings
var METHOD_EVENTS = {
  setLocalDescription: 'setlocaldesc',
  setRemoteDescription: 'setremotedesc',
  createOffer: 'offer',
  createAnswer: 'answer'
};

var MEDIA_MAPPINGS = {
  data: 'application'
};

// define states in which we will attempt to finalize a connection on receiving a remote offer
var VALID_RESPONSE_STATES = ['have-remote-offer', 'have-local-pranswer'];

/**
  # rtc-taskqueue

  This is a package that assists with applying actions to an `RTCPeerConnection`
  in as reliable order as possible. It is primarily used by the coupling logic
  of the [`rtc-tools`](https://github.com/rtc-io/rtc-tools).

  ## Example Usage

  For the moment, refer to the simple coupling test as an example of how to use
  this package (see below):

  <<< test/couple.js

**/
module.exports = function(pc, opts) {
  opts = opts || {};
  // create the task queue
  var queue = new PriorityQueue(orderTasks);
  var tq = require('mbus')('', (opts || {}).logger);

  // initialise task importance
  var priorities = (opts || {}).priorities || DEFAULT_PRIORITIES;
  var queueInterval = (opts || {}).interval || 50;

  // check for plugin usage
  var plugin = findPlugin((opts || {}).plugins);

  // initialise state tracking
  var checkQueueTimer = 0;
  var defaultFail = tq.bind(tq, 'fail');

  // look for an sdpfilter function (allow slight mis-spellings)
  var sdpFilter = (opts || {}).sdpfilter || (opts || {}).sdpFilter;
  var alwaysParse = (opts.sdpParseMode === 'always');

  // initialise session description and icecandidate objects
  var RTCSessionDescription = (opts || {}).RTCSessionDescription ||
    detect('RTCSessionDescription');

  var RTCIceCandidate = (opts || {}).RTCIceCandidate ||
    detect('RTCIceCandidate');

  function abortQueue(err) {
    console.error(err);
  }

  function applyCandidate(task, next) {
    var data = task.args[0];
    // Allow selective filtering of ICE candidates
    if (opts && opts.filterCandidate && !opts.filterCandidate(data)) {
      tq('ice.remote.filtered', candidate);
      return next();
    }
    var candidate = data && data.candidate && createIceCandidate(data);

    function handleOk() {
      tq('ice.remote.applied', candidate);
      next();
    }

    function handleFail(err) {
      tq('ice.remote.invalid', candidate);
      next(err);
    }

    // we have a null candidate, we have finished gathering candidates
    if (! candidate) {
      return next();
    }

    pc.addIceCandidate(candidate, handleOk, handleFail);
  }

  function checkQueue() {
    // peek at the next item on the queue
    var next = (! queue.isEmpty()) && queue.peek();
    var ready = next && testReady(next);

    // reset the queue timer
    checkQueueTimer = 0;

    // if we don't have a task ready, then abort
    if (! ready) {
      // if we have a task and it has expired then dequeue it
      if (next && expired(next)) {
        tq('task.expire', next);
        queue.deq();
      }

      return (! queue.isEmpty()) && isNotClosed(pc) && triggerQueueCheck();
    }

    // properly dequeue task
    next = queue.deq();

    // process the task
    next.fn(next, function(err) {
      var fail = next.fail || defaultFail;
      var pass = next.pass;
      var taskName = next.name;

      // if errored, fail
      if (err) {
        console.error(taskName + ' task failed: ', err);
        return fail(err);
      }

      if (typeof pass == 'function') {
        pass.apply(next, [].slice.call(arguments, 1));
      }

      triggerQueueCheck();
    });
  }

  function cleansdp(desc) {
    // ensure we have clean sdp
    var sdpErrors = [];
    var sdp = desc && sdpclean(desc.sdp, { collector: sdpErrors });

    // if we don't have a match, log some info
    if (desc && sdp !== desc.sdp) {
      console.info('invalid lines removed from sdp: ', sdpErrors);
      desc.sdp = sdp;
    }

    // if a filter has been specified, then apply the filter
    if (typeof sdpFilter == 'function') {
      desc.sdp = sdpFilter(desc.sdp, pc);
    }

    return desc;
  }

  function completeConnection() {
    if (VALID_RESPONSE_STATES.indexOf(pc.signalingState) >= 0) {
      return tq.createAnswer();
    }
  }

  function createIceCandidate(data) {
    if (plugin && typeof plugin.createIceCandidate == 'function') {
      return plugin.createIceCandidate(data);
    }

    return new RTCIceCandidate(data);
  }

  function createSessionDescription(data) {
    if (plugin && typeof plugin.createSessionDescription == 'function') {
      return plugin.createSessionDescription(data);
    }

    return new RTCSessionDescription(data);
  }

  function emitSdp() {
    tq('sdp.local', pluckSessionDesc(this.args[0]));
  }

  function enqueue(name, handler, opts) {
    return function() {
      var args = [].slice.call(arguments);

      if (opts && typeof opts.processArgs == 'function') {
        args = args.map(opts.processArgs);
      }

      var priority = priorities.indexOf(name);

      queue.enq({
        args: args,
        name: name,
        fn: handler,
        priority: priority >= 0 ? priority : PRIORITY_LOW,

        // record the time at which the task was queued
        start: Date.now(),

        // initilaise any checks that need to be done prior
        // to the task executing
        checks: [ isNotClosed ].concat((opts || {}).checks || []),

        // initialise the pass and fail handlers
        pass: (opts || {}).pass,
        fail: (opts || {}).fail
      });

      triggerQueueCheck();
    };
  }

  function execMethod(task, next) {
    var fn = pc[task.name];
    var eventName = METHOD_EVENTS[task.name] || (task.name || '').toLowerCase();
    var cbArgs = [ success, fail ];
    var isOffer = task.name === 'createOffer';

    function fail(err) {
      tq.apply(tq, [ 'negotiate.error', task.name, err ].concat(task.args));
      next(err);
    }

    function success() {
      tq.apply(tq, [ ['negotiate', eventName, 'ok'], task.name ].concat(task.args));
      next.apply(null, [null].concat([].slice.call(arguments)));
    }

    if (! fn) {
      return next(new Error('cannot call "' + task.name + '" on RTCPeerConnection'));
    }

    // invoke the function
    tq.apply(tq, ['negotiate.' + eventName].concat(task.args));
    fn.apply(
      pc,
      task.args.concat(cbArgs).concat(isOffer ? generateConstraints() : [])
    );
  }

  function expired(task) {
    return (typeof task.ttl == 'number') && (task.start + task.ttl < Date.now());
  }

  function extractCandidateEventData(data) {
    // extract nested candidate data (like we will see in an event being passed to this function)
    while (data && data.candidate && data.candidate.candidate) {
      data = data.candidate;
    }

    return data;
  }

  function generateConstraints() {
    var allowedKeys = {
      offertoreceivevideo: 'OfferToReceiveVideo',
      offertoreceiveaudio: 'OfferToReceiveAudio',
      icerestart: 'IceRestart',
      voiceactivitydetection: 'VoiceActivityDetection'
    };

    var constraints = {
      OfferToReceiveVideo: true,
      OfferToReceiveAudio: true
    };

    // update known keys to match
    Object.keys(opts || {}).forEach(function(key) {
      if (allowedKeys[key.toLowerCase()]) {
        constraints[allowedKeys[key.toLowerCase()]] = opts[key];
      }
    });

    return { mandatory: constraints };
  }

  function hasLocalOrRemoteDesc(pc, task) {
    return pc.__hasDesc || (pc.__hasDesc = !!pc.remoteDescription);
  }

  function isNotNegotiating(pc) {
    return pc.signalingState !== 'have-local-offer';
  }

  function isNotClosed(pc) {
    return pc.signalingState !== 'closed';
  }

  function isStable(pc) {
    return pc.signalingState === 'stable';
  }

  function isValidCandidate(pc, data) {
    return data.__valid ||
      (data.__valid = checkCandidate(data.args[0]).length === 0);
  }

  function isConnReadyForCandidate(pc, data) {
    var sdpMid = data.args[0] && data.args[0].sdpMid;

    // remap media types as appropriate
    sdpMid = MEDIA_MAPPINGS[sdpMid] || sdpMid;

    if (sdpMid === '')
      return true;

    // Allow parsing of SDP always if required
    if (alwaysParse || !pc.__mediaTypes) {
      var sdp = parseSdp(pc.remoteDescription && pc.remoteDescription.sdp);
      // We only want to cache the SDP media types if we've received them, otherwise
      // bad things can happen
      var mediaTypes = sdp.getMediaTypes();
      if (mediaTypes && mediaTypes.length > 0) {
        pc.__mediaTypes = sdp.getMediaTypes();
      }
    }

    // the candidate is valid if we know about the media type
    return pc.__mediaTypes && pc.__mediaTypes.indexOf(sdpMid) >= 0;
  }

  function orderTasks(a, b) {
    // apply each of the checks for each task
    var tasks = [a,b];
    var readiness = tasks.map(testReady);
    var taskPriorities = tasks.map(function(task, idx) {
      var ready = readiness[idx];
      return ready ? task.priority : PRIORITY_WAIT;
    });

    return taskPriorities[1] - taskPriorities[0];
  }

  // check whether a task is ready (does it pass all the checks)
  function testReady(task) {
    return (task.checks || []).reduce(function(memo, check) {
      return memo && check(pc, task);
    }, true);
  }

  function triggerQueueCheck() {
    if (checkQueueTimer) return;
    checkQueueTimer = setTimeout(checkQueue, queueInterval);
  }

  // patch in the queue helper methods
  tq.addIceCandidate = enqueue('addIceCandidate', applyCandidate, {
    processArgs: extractCandidateEventData,
    checks: [hasLocalOrRemoteDesc, isValidCandidate, isConnReadyForCandidate ],

    // set ttl to 5s
    ttl: 5000
  });

  tq.setLocalDescription = enqueue('setLocalDescription', execMethod, {
    processArgs: cleansdp,
    pass: emitSdp
  });

  tq.setRemoteDescription = enqueue('setRemoteDescription', execMethod, {
    processArgs: createSessionDescription,
    pass: completeConnection
  });

  tq.createOffer = enqueue('createOffer', execMethod, {
    checks: [ isNotNegotiating ],
    pass: tq.setLocalDescription
  });

  tq.createAnswer = enqueue('createAnswer', execMethod, {
    pass: tq.setLocalDescription
  });

  return tq;
};

},{"mbus":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/mbus/index.js","priorityqueuejs":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/priorityqueuejs/index.js","rtc-core/detect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/detect.js","rtc-core/plugin":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-core/plugin.js","rtc-sdp":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-sdp/index.js","rtc-sdpclean":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-sdpclean/index.js","rtc-validator/candidate":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-validator/candidate.js","whisk/pluck":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/pluck.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/priorityqueuejs/index.js":[function(require,module,exports){
/**
 * Expose `PriorityQueue`.
 */
module.exports = PriorityQueue;

/**
 * Initializes a new empty `PriorityQueue` with the given `comparator(a, b)`
 * function, uses `.DEFAULT_COMPARATOR()` when no function is provided.
 *
 * The comparator function must return a positive number when `a > b`, 0 when
 * `a == b` and a negative number when `a < b`.
 *
 * @param {Function}
 * @return {PriorityQueue}
 * @api public
 */
function PriorityQueue(comparator) {
  this._comparator = comparator || PriorityQueue.DEFAULT_COMPARATOR;
  this._elements = [];
}

/**
 * Compares `a` and `b`, when `a > b` it returns a positive number, when
 * it returns 0 and when `a < b` it returns a negative number.
 *
 * @param {String|Number} a
 * @param {String|Number} b
 * @return {Number}
 * @api public
 */
PriorityQueue.DEFAULT_COMPARATOR = function(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else {
    a = a.toString();
    b = b.toString();

    if (a == b) return 0;

    return (a > b) ? 1 : -1;
  }
};

/**
 * Returns whether the priority queue is empty or not.
 *
 * @return {Boolean}
 * @api public
 */
PriorityQueue.prototype.isEmpty = function() {
  return this.size() === 0;
};

/**
 * Peeks at the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.peek = function() {
  if (this.isEmpty()) throw new Error('PriorityQueue is empty');

  return this._elements[0];
};

/**
 * Dequeues the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.deq = function() {
  var first = this.peek();
  var last = this._elements.pop();
  var size = this.size();

  if (size === 0) return first;

  this._elements[0] = last;
  var current = 0;

  while (current < size) {
    var largest = current;
    var left = (2 * current) + 1;
    var right = (2 * current) + 2;

    if (left < size && this._compare(left, largest) >= 0) {
      largest = left;
    }

    if (right < size && this._compare(right, largest) >= 0) {
      largest = right;
    }

    if (largest === current) break;

    this._swap(largest, current);
    current = largest;
  }

  return first;
};

/**
 * Enqueues the `element` at the priority queue and returns its new size.
 *
 * @param {Object} element
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.enq = function(element) {
  var size = this._elements.push(element);
  var current = size - 1;

  while (current > 0) {
    var parent = Math.floor((current - 1) / 2);

    if (this._compare(current, parent) <= 0) break;

    this._swap(parent, current);
    current = parent;
  }

  return size;
};

/**
 * Returns the size of the priority queue.
 *
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.size = function() {
  return this._elements.length;
};

/**
 *  Iterates over queue elements
 *
 *  @param {Function} fn
 */
PriorityQueue.prototype.forEach = function(fn) {
  return this._elements.forEach(fn);
};

/**
 * Compares the values at position `a` and `b` in the priority queue using its
 * comparator function.
 *
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @api private
 */
PriorityQueue.prototype._compare = function(a, b) {
  return this._comparator(this._elements[a], this._elements[b]);
};

/**
 * Swaps the values at position `a` and `b` in the priority queue.
 *
 * @param {Number} a
 * @param {Number} b
 * @api private
 */
PriorityQueue.prototype._swap = function(a, b) {
  var aux = this._elements[a];
  this._elements[a] = this._elements[b];
  this._elements[b] = aux;
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-sdp/index.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

var nub = require('whisk/nub');
var pluck = require('whisk/pluck');
var flatten = require('whisk/flatten');
var reLineBreak = /\r?\n/;
var reTrailingNewlines = /\r?\n$/;

// list sdp line types that are not "significant"
var nonHeaderLines = [ 'a', 'c', 'b', 'k' ];
var parsers = require('./parsers');

/**
  # rtc-sdp

  This is a utility module for intepreting and patching sdp.

  ## Usage

  The `rtc-sdp` main module exposes a single function that is capable of
  parsing lines of SDP, and providing an object allowing you to perform
  operations on those parsed lines:

  ```js
  var sdp = require('rtc-sdp')(lines);
  ```

  The currently supported operations are listed below:

**/
module.exports = function(sdp) {
  var ops = {};
  var parsed = [];
  var activeCollector;

  // initialise the lines
  var lines = sdp.split(reLineBreak).filter(Boolean).map(function(line) {
    return line.split('=');
  });

  var inputOrder = nub(lines.filter(function(line) {
    return line[0] && nonHeaderLines.indexOf(line[0]) < 0;
  }).map(pluck(0)));

  var findLine = ops.findLine = function(type, index) {
    var lineData = parsed.filter(function(line) {
      return line[0] === type;
    })[index || 0];

    return lineData && lineData[1];
  };

  // push into parsed sections
  lines.forEach(function(line) {
    var customParser = parsers[line[0]];

    if (customParser) {
      activeCollector = customParser(parsed, line);
    }
    else if (activeCollector) {
      activeCollector = activeCollector(line);
    }
    else {
      parsed.push(line);
    }
  });

  /**
    ### `sdp.addIceCandidate(data)`

    Modify the sdp to include candidates as denoted by the data.

**/
  ops.addIceCandidate = function(data) {
    var lineIndex = (data || {}).lineIndex || (data || {}).sdpMLineIndex;
    var mLine = typeof lineIndex != 'undefined' && findLine('m', lineIndex);
    var candidate = (data || {}).candidate;

    // if we have the mLine add the new candidate
    if (mLine && candidate) {
      mLine.childlines.push(candidate.replace(reTrailingNewlines, '').split('='));
    }
  };

  /**
    ### `sdp.getMediaTypes() => []`

    Retrieve the list of media types that have been defined in the sdp via
    `m=` lines.
  **/
  ops.getMediaTypes = function() {
    function getMediaType(data) {
      return data[1].def.split(/\s/)[0];
    }

    return parsed.filter(function(parts) {
      return parts[0] === 'm' && parts[1] && parts[1].def;
    }).map(getMediaType);
  };

  /**
    ### `sdp.toString()`

    Convert the SDP structure that is currently retained in memory, into a string
    that can be provided to a `setLocalDescription` (or `setRemoteDescription`)
    WebRTC call.

  **/
  ops.toString = function() {
    return parsed.map(function(line) {
      return typeof line[1].toArray == 'function' ? line[1].toArray() : [ line ];
    }).reduce(flatten).map(function(line) {
      return line.join('=');
    }).join('\n');
  };

  /**
    ## SDP Filtering / Munging Functions

    There are additional functions included in the module to assign with
    performing "single-shot" SDP filtering (or munging) operations:

  **/

  return ops;
};

},{"./parsers":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-sdp/parsers.js","whisk/flatten":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/flatten.js","whisk/nub":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/nub.js","whisk/pluck":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/pluck.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-sdp/parsers.js":[function(require,module,exports){
/* jshint node: true */
'use strict';

exports.m = function(parsed, line) {
  var media = {
    def: line[1],
    childlines: [],

    toArray: function() {
      return [
        ['m', media.def ]
      ].concat(media.childlines);
    }
  };

  function addChildLine(childLine) {
    media.childlines.push(childLine);
    return addChildLine;
  }

  parsed.push([ 'm', media ]);

  return addChildLine;
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-sdpclean/index.js":[function(require,module,exports){
var validators = [
  [ /^(a\=candidate.*)$/, require('rtc-validator/candidate') ]
];

var reSdpLineBreak = /(\r?\n|\\r\\n)/;

/**
  # rtc-sdpclean

  Remove invalid lines from your SDP.

  ## Why?

  This module removes the occasional "bad egg" that will slip into SDP when it
  is generated by the browser.  In particular these situations are catered for:

  - invalid ICE candidates

**/
module.exports = function(input, opts) {
  var lineBreak = detectLineBreak(input);
  var lines = input.split(lineBreak);
  var collector = (opts || {}).collector;

  // filter out invalid lines
  lines = lines.filter(function(line) {
    // iterate through the validators and use the one that matches
    var validator = validators.reduce(function(memo, data, idx) {
      return typeof memo != 'undefined' ? memo : (data[0].exec(line) && {
        line: line.replace(data[0], '$1'),
        fn: data[1]
      });
    }, undefined);

    // if we have a validator, ensure we have no errors
    var errors = validator ? validator.fn(validator.line) : [];

    // if we have errors and an error collector, then add to the collector
    if (collector) {
      errors.forEach(function(err) {
        collector.push(err);
      });
    }

    return errors.length === 0;
  });

  return lines.join(lineBreak);
};

function detectLineBreak(input) {
  var match = reSdpLineBreak.exec(input);

  return match && match[0];
}

},{"rtc-validator/candidate":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-validator/candidate.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-validator/candidate.js":[function(require,module,exports){
var debug = require('cog/logger')('rtc-validator');
var rePrefix = /^(?:a=)?candidate:/;

/*

validation rules as per:
http://tools.ietf.org/html/draft-ietf-mmusic-ice-sip-sdp-03#section-8.1

   candidate-attribute   = "candidate" ":" foundation SP component-id SP
                           transport SP
                           priority SP
                           connection-address SP     ;from RFC 4566
                           port         ;port from RFC 4566
                           SP cand-type
                           [SP rel-addr]
                           [SP rel-port]
                           *(SP extension-att-name SP
                                extension-att-value)

   foundation            = 1*32ice-char
   component-id          = 1*5DIGIT
   transport             = "UDP" / transport-extension
   transport-extension   = token              ; from RFC 3261
   priority              = 1*10DIGIT
   cand-type             = "typ" SP candidate-types
   candidate-types       = "host" / "srflx" / "prflx" / "relay" / token
   rel-addr              = "raddr" SP connection-address
   rel-port              = "rport" SP port
   extension-att-name    = token
   extension-att-value   = *VCHAR
   ice-char              = ALPHA / DIGIT / "+" / "/"
*/
var partValidation = [
  [ /.+/, 'invalid foundation component', 'foundation' ],
  [ /\d+/, 'invalid component id', 'component-id' ],
  [ /(UDP|TCP)/i, 'transport must be TCP or UDP', 'transport' ],
  [ /\d+/, 'numeric priority expected', 'priority' ],
  [ require('reu/ip'), 'invalid connection address', 'connection-address' ],
  [ /\d+/, 'invalid connection port', 'connection-port' ],
  [ /typ/, 'Expected "typ" identifier', 'type classifier' ],
  [ /.+/, 'Invalid candidate type specified', 'candidate-type' ]
];

/**
  ### `rtc-validator/candidate`

  Validate that an `RTCIceCandidate` (or plain old object with data, sdpMid,
  etc attributes) is a valid ice candidate.

  Specs reviewed as part of the validation implementation:

  - <http://tools.ietf.org/html/draft-ietf-mmusic-ice-sip-sdp-03#section-8.1>
  - <http://tools.ietf.org/html/rfc5245>

**/
module.exports = function(data) {
  var errors = [];
  var candidate = data && (data.candidate || data);
  var prefixMatch = candidate && rePrefix.exec(candidate);
  var parts = prefixMatch && candidate.slice(prefixMatch[0].length).split(/\s/);

  if (! candidate) {
    return [ new Error('empty candidate') ];
  }

  // check that the prefix matches expected
  if (! prefixMatch) {
    return [ new Error('candidate did not match expected sdp line format') ];
  }

  // perform the part validation
  errors = errors.concat(parts.map(validateParts)).filter(Boolean);

  return errors;
};

function validateParts(part, idx) {
  var validator = partValidation[idx];

  if (validator && (! validator[0].test(part))) {
    debug(validator[2] + ' part failed validation: ' + part);
    return new Error(validator[1]);
  }
}

},{"cog/logger":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/cog/logger.js","reu/ip":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-validator/node_modules/reu/ip.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/rtc-taskqueue/node_modules/rtc-validator/node_modules/reu/ip.js":[function(require,module,exports){
/**
  ### `reu/ip`

  A regular expression that will match both IPv4 and IPv6 addresses.  This is a modified
  regex (remove hostname matching) that was implemented by @Mikulas in
  [this stackoverflow answer](http://stackoverflow.com/a/9209720/96656).

**/
module.exports = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(?:(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){6})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:::(?:(?:(?:[0-9a-fA-F]{1,4})):){5})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){4})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,1}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){3})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,2}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:(?:[0-9a-fA-F]{1,4})):){2})(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,3}(?:(?:[0-9a-fA-F]{1,4})))?::(?:(?:[0-9a-fA-F]{1,4})):)(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,4}(?:(?:[0-9a-fA-F]{1,4})))?::)(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9]))\.){3}(?:(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])))))))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,5}(?:(?:[0-9a-fA-F]{1,4})))?::)(?:(?:[0-9a-fA-F]{1,4})))|(?:(?:(?:(?:(?:(?:[0-9a-fA-F]{1,4})):){0,6}(?:(?:[0-9a-fA-F]{1,4})))?::))))$/;

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/equality.js":[function(require,module,exports){
module.exports = function(a, b) {
  return arguments.length > 1 ? a === b : function(b) {
    return a === b;
  };
};

},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/flatten.js":[function(require,module,exports){
/**
  ## flatten

  Flatten an array using `[].reduce`

  <<< examples/flatten.js

**/

module.exports = function(a, b) {
  // if a is not already an array, make it one
  a = Array.isArray(a) ? a : [a];

  // concat b with a
  return a.concat(b);
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/nub-by.js":[function(require,module,exports){
module.exports = function(comparator) {
  return function(input) {
    var output = [];
    for (var ii = 0, count = input.length; ii < count; ii++) {
      var found = false;
      for (var jj = output.length; jj--; ) {
        found = found || comparator(input[ii], output[jj]);
      }

      if (found) {
        continue;
      }

      output[output.length] = input[ii];
    }

    return output;
  };
}
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/nub.js":[function(require,module,exports){
/**
  ## nub

  Return only the unique elements of the list.

  <<< examples/nub.js

**/

module.exports = require('./nub-by')(require('./equality'));
},{"./equality":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/equality.js","./nub-by":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/nub-by.js"}],"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/node_modules/rtc-tools/node_modules/whisk/pluck.js":[function(require,module,exports){
/**
  ## pluck

  Extract targeted properties from a source object. When a single property
  value is requested, then just that value is returned.

  In the case where multiple properties are requested (in a varargs calling
  style) a new object will be created with the requested properties copied
  across.

  __NOTE:__ In the second form extraction of nested properties is
  not supported.

  <<< examples/pluck.js

**/
module.exports = function() {
  var fields = [];

  function extractor(parts, maxIdx) {
    return function(item) {
      var partIdx = 0;
      var val = item;

      do {
        val = val && val[parts[partIdx++]];
      } while (val && partIdx <= maxIdx);

      return val;
    };
  }

  [].slice.call(arguments).forEach(function(path) {
    var parts = typeof path == 'number' ? [ path ] : (path || '').split('.');

    fields[fields.length] = {
      name: parts[0],
      parts: parts,
      maxIdx: parts.length - 1
    };
  });

  if (fields.length <= 1) {
    return extractor(fields[0].parts, fields[0].maxIdx);
  }
  else {
    return function(item) {
      var data = {};

      for (var ii = 0, len = fields.length; ii < len; ii++) {
        data[fields[ii].name] = extractor([fields[ii].parts[0]], 0)(item);
      }

      return data;
    };
  }
};
},{}],"/Users/matt/code/webvr-camera-viewer/node_modules/tween.js/index.js":[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

module.exports=TWEEN;
},{}],"/Users/matt/code/webvr-camera-viewer/src/app.js":[function(require,module,exports){
(function (global){
"use strict";

var $ = typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null;
var page = require("page");

// script loader
var toast = require("pyrsmk-toast");
var threeLoaded = false;

var view = require("./viewer.js");
var viewTpl = require("./templates/view.tpl.html");

var stream = require("./streamer.js");
var streamTpl = require("./templates/stream.tpl.html");

var mainTpl = require("./templates/main.tpl.html");

document.addEventListener("DOMContentLoaded", function () {
  page.base(window.location.pathname === "/" ? "" : window.location.pathname);
  page("/view/:id", loadThree, renderTpl(viewTpl), view);

  page("/stream", stream.create, function (ctx) {
    page.redirect("/stream/" + ctx.params.id);
  });
  page("/stream/:id", renderTpl(streamTpl), stream.join);

  page("/", renderTpl(mainTpl), home);
  // page('*', () => { console.error('Oops fall through!'); page('/') })
  page({ hashbang: true });
});

function renderTpl(tpl) {
  return function (ctx, next) {
    $("#app").html(tpl);
    next();
  };
}

// Only load three+friends when needed
function loadThree(ctx, next) {
  if (!threeLoaded) {
    threeLoaded = true;
    toast(["scripts/three.js", function () {
      return window.THREE;
    }], "scripts/webvr-polyfill.js", "scripts/VRControls.js", "scripts/VREffect.js", "scripts/webvr-manager.js", function () {
      next();
    });
  } else {
    next();
  }
}

function home() {
  var streamBtn = document.getElementById("stream");

  streamBtn.addEventListener("click", function (e) {
    page("/stream");
    e.preventDefault();
  });
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./streamer.js":"/Users/matt/code/webvr-camera-viewer/src/streamer.js","./templates/main.tpl.html":"/Users/matt/code/webvr-camera-viewer/src/templates/main.tpl.html","./templates/stream.tpl.html":"/Users/matt/code/webvr-camera-viewer/src/templates/stream.tpl.html","./templates/view.tpl.html":"/Users/matt/code/webvr-camera-viewer/src/templates/view.tpl.html","./viewer.js":"/Users/matt/code/webvr-camera-viewer/src/viewer.js","page":"/Users/matt/code/webvr-camera-viewer/node_modules/page/index.js","pyrsmk-toast":"/Users/matt/code/webvr-camera-viewer/node_modules/pyrsmk-toast/src/toast.js"}],"/Users/matt/code/webvr-camera-viewer/src/classes/LinkShare.js":[function(require,module,exports){
(function (global){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null;
var QRCode = typeof window !== "undefined" ? window.QRCode : typeof global !== "undefined" ? global.QRCode : null;

module.exports = (function () {
  function LinkShare(link) {
    _classCallCheck(this, LinkShare);

    this.link = link;
    this.element = $("<div></div>");
    this.qrcode = $("<div></div>");
    this.twitter = $("<div></div>");
    this.linkElement = $("<a>" + link + "</a>", { href: link });

    this.element.append(this.qrcode).append(this.linkElement).append(this.twitter);
  }

  _createClass(LinkShare, [{
    key: "appendTo",
    value: function appendTo(elem) {
      var _this = this;

      this.element.appendTo(elem);

      // generate a QRCode for easy sharing
      new QRCode(this.qrcode[0], { // eslint-disable-line
        text: this.link,
        width: 512,
        height: 512,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      window.twttr.ready(function () {
        window.twttr.widgets.createShareButton(_this.link, _this.twitter[0], {
          text: "Live on #WebVR:",
          hashtags: "cardboard",
          size: "large",
          count: "none"
        });
      });
    }
  }]);

  return LinkShare;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/matt/code/webvr-camera-viewer/src/classes/Screen.js":[function(require,module,exports){
(function (global){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Handles creation of new screen inside WebGL space
 */

var TWEEN = require('tween.js');

module.exports = (function () {
  function Screen(stream) {
    var _this = this;

    _classCallCheck(this, Screen);

    // neew to require here so it will have been loaded
    var THREE = typeof window !== 'undefined' ? window.THREE : typeof global !== 'undefined' ? global.THREE : null;

    this.id = stream.id; // stream ID
    this.stream = stream;

    // automatically remove stream from scene when ended
    this.stream.onended = function () {
      console.log('stream removed onended');
      _this.remove();
    };

    // set screen to have 16:9 aspect ratio with width === 1 meter
    this.width = 1;
    this.height = 9 / 16;

    this.screenDistance = 1; // distance in meters between screen and camera

    var eyeLevel = 1.8; // corresponds to height of camera

    this.theta = 0;

    this.video = document.createElement('video');
    this.video.width = this.width;
    this.video.height = this.height;
    this.video.autoplay = true;

    this.video.src = window.URL.createObjectURL(stream);

    this.geometry = new THREE.PlaneBufferGeometry(this.width, this.height);

    // translate geometry away from the origin to allow rotation
    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -this.screenDistance));

    this.videoTexture = new THREE.Texture(this.video);
    this.videoTexture.minFilter = THREE.NearestFilter;

    this.material = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = eyeLevel;
  }

  _createClass(Screen, [{
    key: 'add',
    value: function add(scene) {
      this.scene = scene;
      this.scene.add(this.mesh);
    }
  }, {
    key: 'remove',
    value: function remove() {
      if (this.scene) {
        this.scene.remove(this.mesh);
      }
    }
  }, {
    key: 'update',
    value: function update() {
      // update to most recent camera frame
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.videoTexture.needsUpdate = true;
      }
    }
  }, {
    key: 'rotate',
    value: function rotate(newTheta) {
      var self = this;

      var MOVE = 0.1;

      if (this.theta === newTheta) {
        return;
      }

      this.mesh.position.z += MOVE;

      var tween = new TWEEN.Tween({ theta: this.theta }).to({ theta: newTheta }, 1500).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function () {
        self.mesh.rotation.y = this.theta;
      }).onComplete(function () {
        self.mesh.position.z -= MOVE;
        self.theta = newTheta;
      }).start();
    }
  }]);

  return Screen;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"tween.js":"/Users/matt/code/webvr-camera-viewer/node_modules/tween.js/index.js"}],"/Users/matt/code/webvr-camera-viewer/src/classes/VideoControlPanel.js":[function(require,module,exports){
(function (global){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null;

function openVideoStream(options) {
  return new Promise(function (resolve, reject) {
    navigator.getUserMedia(options, resolve, reject);
  });
}

module.exports = (function () {
  function VideoControlPanel(device, rtcStream) {
    var _this = this;

    _classCallCheck(this, VideoControlPanel);

    this.element = $("<div class=\"video-control\"></div>");
    this.device = device;
    this.rtcStream = rtcStream;

    // create various HTML elements
    this.startButton = $("<button>Start Feed</button>");
    this.stopButton = $("<button>Stop Feed</button>");
    this.streamingStatusIndicator = $("<div class=\"streaming-indicator\" style=\"color:red;\">not streaming</div>");
    this.video = $("<video></video>");
    this.video[0].autoplay = true;

    this.startButton.on("click", function (e) {
      _this.startFeed();
    });

    this.stopButton.on("click", function (e) {
      _this.stopFeed();
    });

    this.element.append($("<div class=\"streaming-buttons\"></div>").append(this.startButton).append(this.stopButton)).append(this.streamingStatusIndicator).append(this.video);
  }

  _createClass(VideoControlPanel, [{
    key: "startFeed",

    // Start streaming a camera feed over WebRTC
    value: function startFeed() {
      var _this2 = this;

      if (!this.stream) {
        var options = undefined;
        if (this.device.id) {
          options = {
            video: {
              optional: [{
                sourceId: this.device.id
              }]
            }
          };
        } else {
          options = { video: true };
        }

        openVideoStream(options).then(function (stream) {
          _this2.stream = stream;
          _this2.video[0].src = window.URL.createObjectURL(stream);

          // add stream to the rtc Stream
          _this2.rtcStream.addStream(stream);
          _this2.streamingStatusIndicator.text("streaming!");
          _this2.streamingStatusIndicator.css("color", "green");
        });
      } else {
        this.rtcStream.addStream(this.stream);
        this.streamingStatusIndicator.text("streaming!");
        this.streamingStatusIndicator.css("color", "green");
      }
    }
  }, {
    key: "stopFeed",

    // Stop streaming a camera feed
    value: function stopFeed() {
      this.rtcStream.removeStream(this.stream);
      this.streamingStatusIndicator.text("not streaming");
      this.streamingStatusIndicator.css("color", "red");
    }
  }]);

  return VideoControlPanel;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/matt/code/webvr-camera-viewer/src/streamer.js":[function(require,module,exports){
(function (global){
"use strict";

var $ = typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null;
var quickconnect = require("rtc-quickconnect");
var freeice = require("freeice");

var LinkShare = require("./classes/LinkShare.js");
var VideoControlPanel = require("./classes/VideoControlPanel.js");

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

/*
 * Get an array of streams from various webcams. Only certain browsers support multiple streams
 */
function getVideoDevices() {
  return new Promise(function (resolve, reject) {

    if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
      window.MediaStreamTrack.getSources(function (sources) {
        // filter out non-video streams
        var videoSources = sources.filter(function (source) {
          return source.kind === "video";
        });
        console.log(videoSources);

        resolve(videoSources);
      });
    } else {
      resolve([{}]);
    }
  });
}

exports.create = function createStream(ctx, next) {
  var HASH_LENGTH = 5;
  var POSSIBLE = "abcdefghigklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  var id = "";

  for (var i = 0; i < HASH_LENGTH; i++) {
    id += POSSIBLE[Math.floor(Math.random() * POSSIBLE.length)];
  }

  ctx.params.id = id;
  next();
};

exports.join = function stream(ctx) {
  var room = ctx.params.id;
  var viewLink = window.location.href.replace("stream", "view");

  $("#roomId").text(room);

  var streamerLink = new LinkShare(window.location.href);
  var viewerLink = new LinkShare(viewLink);

  streamerLink.appendTo($("#stream-box"));
  viewerLink.appendTo($("#view-box"));

  if (navigator.getUserMedia) {
    (function () {
      var usersConnected = 0;
      $("#user-count").text(usersConnected);

      var rtcStream = quickconnect("https://switchboard.rtc.io/", {
        room: room,
        iceServers: freeice()
      }).reactive().on("call:started", function (id, pc, data) {
        console.log("started streaming!");
        usersConnected++;
        $("#user-count").text(usersConnected);
      }).on("call:ended", function (id) {
        usersConnected--;
        $("#user-count").text(usersConnected);
      });

      // get list of possible video devices to stream
      getVideoDevices().then(function (devices) {
        console.log(devices);
        devices.forEach(function (device) {
          var controls = new VideoControlPanel(device, rtcStream);
          controls.element.appendTo($("#app"));
        });
      });
    })();
  } else {
    console.error("no webcam");
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/LinkShare.js":"/Users/matt/code/webvr-camera-viewer/src/classes/LinkShare.js","./classes/VideoControlPanel.js":"/Users/matt/code/webvr-camera-viewer/src/classes/VideoControlPanel.js","freeice":"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/index.js","rtc-quickconnect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/index.js"}],"/Users/matt/code/webvr-camera-viewer/src/templates/main.tpl.html":[function(require,module,exports){
module.exports = "<h1>WebVR Camera Stream</h1><a href=# id=stream>stream</a>";

},{}],"/Users/matt/code/webvr-camera-viewer/src/templates/stream.tpl.html":[function(require,module,exports){
module.exports = "<h1>Room: <span id=roomId></span> <span class=subtitle>USERS CONNECTED: <span id=user-count></span></span></h1><div id=stream-box class=link-share><h2>Stream Link</h2></div><div id=view-box class=link-share><h2>View Link</h2></div>";

},{}],"/Users/matt/code/webvr-camera-viewer/src/templates/view.tpl.html":[function(require,module,exports){
module.exports = "<style>body {\n  padding: 0;\n  margin: 0;\n}\n#viewer {\n  background-color: #000;\n  color: #fff;\n  margin: 0px;\n  padding: 0;\n  overflow: hidden;\n}</style><div id=viewer></div>";

},{}],"/Users/matt/code/webvr-camera-viewer/src/viewer.js":[function(require,module,exports){
(function (global){
"use strict";

var $ = typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null;
var quickconnect = require("rtc-quickconnect");
var freeice = require("freeice");
var TWEEN = require("tween.js");

var Screen = require("./classes/Screen.js");

module.exports = function view(ctx) {
  var THREE = typeof window !== "undefined" ? window.THREE : typeof global !== "undefined" ? global.THREE : null;
  var WebVRManager = typeof window !== "undefined" ? window.WebVRManager : typeof global !== "undefined" ? global.WebVRManager : null;

  var room = ctx.params.id;

  // const width = 640
  // const height = 480
  var width = window.innerWidth;
  var height = window.innerHeight;

  /**
   * create RTC connection
   */
  // Array to Maintain connected screens
  var screens = [];

  var rtcStream = quickconnect("https://switchboard.rtc.io/", {
    room: room,
    iceServers: freeice()
  }).on("call:started", function (id, pc, data) {
    console.log("call started with", id, data);
  }).on("call:ended", function (id) {
    console.log("call ended with", id);
  });

  /**
   * Begin VR scene
   */

  // configure camera
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000);
  camera.position.y = 1.8; // set height in meters

  // create floor texture
  var floorTexture = THREE.ImageUtils.loadTexture("assets/grid.png");
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(100, 100);
  var floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide
  });
  var floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  var controls = new THREE.VRControls(camera, function (err) {
    console.log(err);
  });

  // create renderer
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement);

  // create VR effect
  var effect = new THREE.VREffect(renderer);
  effect.setSize(width, height);

  // create WebVR manager
  var manager = new WebVRManager(renderer, effect, { hideButton: false });

  rtcStream.on("stream:added", function (clientId, stream, data) {
    console.log("stream added from", clientId, stream);
    // only create a new screen for streaming connections
    if (stream.label !== "default") {
      var _screen = new Screen(stream);
      screens.push(_screen);
      _screen.add(scene);

      resetScreens(screens);
    }
  }).on("stream:removed", function (clientId, stream) {
    for (var i = 0; i < screens.length; i++) {
      if (screens[i].id === stream.id) {
        screens.splice(i, 1);
        break;
      }
    }

    resetScreens(screens);
  });

  function animate(time) {
    for (var i = 0; i < screens.length; i++) {
      screens[i].update();
    }

    controls.update();
    TWEEN.update(time);

    // renderer.render(scene, camera)
    manager.render(scene, camera);

    window.requestAnimationFrame(animate);
  }

  animate();

  // Reset the position sensor when 'z' pressed.
  function onKey(event) {
    switch (event.keyCode) {
      case 90:
        // z
        console.log("reseting sensor");
        controls.resetSensor();
        break;
    }
  }
  window.addEventListener("keydown", onKey, true);
  // Handle window resizes
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onWindowResize, false);
};

// Layout screen rotations
function resetScreens(screens) {
  screens.forEach(function (screen, i) {
    screens[i].rotate(i * Math.PI / 3);
  });
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/Screen.js":"/Users/matt/code/webvr-camera-viewer/src/classes/Screen.js","freeice":"/Users/matt/code/webvr-camera-viewer/node_modules/freeice/index.js","rtc-quickconnect":"/Users/matt/code/webvr-camera-viewer/node_modules/rtc-quickconnect/index.js","tween.js":"/Users/matt/code/webvr-camera-viewer/node_modules/tween.js/index.js"}]},{},["/Users/matt/code/webvr-camera-viewer/src/app.js"])


//# sourceMappingURL=app.js.map