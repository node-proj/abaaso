/**
 * Utilities
 *
 * @class utility
 * @namespace abaaso
 */
var utility = {
	// Collection of timers
	timer : {},

	// Collection of repeating functions
	repeating: {},

	/**
	 * Queries the DOM using CSS selectors and returns an Element or Array of Elements
	 *
	 * @method $
	 * @public
	 * @param  {String} arg Comma delimited string of CSS selectors
	 * @return {Mixed}      Element or Array of Elements
	 */
	$ : function ( arg ) {
		var result;

		if ( !arg ) {
			return;
		}

		arg = string.trim( arg );

		if ( arg.indexOf( "," ) === -1 ) {
			result = utility.dom( arg );
		}
		else {
			result = [];

			array.each( string.explode( arg ), function ( query ) {
				var obj = utility.dom( query );

				if ( obj instanceof Array ) {
					result = result.concat( obj );
				}
				else if ( obj ) {
					result.push( obj );
				}
			});
		}

		return result;
	},

	/**
	 * Aliases origin onto obj
	 *
	 * @method alias
	 * @public
	 * @param  {Object} obj    Object receiving aliasing
	 * @param  {Object} origin Object providing structure to obj
	 * @return {Object}        Object receiving aliasing
	 */
	alias : function ( obj, origin ) {
		var o = obj,
		    s = origin;

		utility.iterate( s, function ( v, k ) {
			var getter, setter;

			if ( !( v instanceof RegExp ) && typeof v === "function" ) {
				o[k] = v.bind( o[k] );
			}
			else if ( !(v instanceof RegExp ) && !(v instanceof Array ) && v instanceof Object ) {
				if ( o[k] === undefined ) {
					o[k] = {};
				}

				utility.alias( o[k], s[k] );
			}
			else {
				getter = function () {
					return s[k];
				};

				setter = function ( arg ) {
					s[k] = arg;
				};

				utility.property( o, k, {enumerable: true, get: getter, set: setter, value: s[k]} );
			}
		});

		return obj;
	},

	/**
	 * Clears deferred & repeating functions
	 *
	 * @method clearTimers
	 * @public
	 * @param  {String} id ID of timer( s )
	 * @return {Undefined} undefined
	 */
	clearTimers : function ( id ) {
		if ( id === undefined || id.isEmpty() ) {
			throw new Error( label.error.invalidArguments );
		}

		// deferred
		if ( utility.timer[id] !== undefined ) {
			clearTimeout( utility.timer[id] );
			delete utility.timer[id];
		}

		// repeating
		if ( utility.repeating[id] !== undefined ) {
			clearTimeout( utility.repeating[id] );
			delete utility.repeating[id];
		}
	},

	/**
	 * Clones an Object
	 *
	 * @method clone
	 * @public
	 * @param {Object}  obj Object to clone
	 * @return {Object}     Clone of obj
	 */
	clone : function ( obj ) {
		var clone;

		if ( obj instanceof Array ) {
			return obj.slice();
		}
		else if ( typeof obj === "boolean" ) {
			return Boolean( obj );
		}
		else if ( typeof obj === "function" ) {
			return obj;
		}
		else if ( typeof obj === "number" ) {
			return Number( obj );
		}
		else if ( typeof obj === "string" ) {
			return String( obj );
		}
		else if ( obj instanceof RegExp ) {
			return obj;
		}
		else if ( !server && !client.ie && obj instanceof Document ) {
			return xml.decode( xml.encode(obj) );
		}
		else if ( obj !== null && obj !== undefined && typeof obj.__proto__ !== "undefined" ) {
			return utility.extend( obj.__proto__, obj );
		}
		else if ( obj instanceof Object ) {
			// If JSON encoding fails due to recursion, the original Object is returned because it's assumed this is for decoration
			clone = json.encode( obj, true );

			if ( clone !== undefined ) {
				clone = json.decode( clone );

				// Decorating Functions that would be lost with JSON encoding/decoding
				utility.iterate( obj, function ( v, k ) {
					if ( typeof v === "function" ) {
						clone[k] = v;
					}
				});
			}
			else {
				clone = obj;
			}

			return clone;
		}
		else {
			return obj;
		}
	},

	/**
	 * Coerces a String to a Type
	 *
	 * @method coerce
	 * @public
	 * @param  {String} value String to coerce
	 * @return {Mixed}        Primitive version of the String
	 */
	coerce : function ( value ) {
		var tmp;

		if ( value === null || value === undefined ) {
			return undefined;
		}
		else if ( value === "true" ) {
			return true;
		}
		else if ( value === "false" ) {
			return false;
		}
		else if ( value === "null" ) {
			return null;
		}
		else if ( value === "undefined" ) {
			return undefined;
		}
		else if ( !isNaN( tmp = Number( value ) ) ) {
			return tmp;
		}
		else if ( regex.json_wrap.test( value ) ) {
			return json.decode( value, true ) || value;
		}
		else {
			return value;
		}
	},

	/**
	 * Recompiles a RegExp by reference
	 *
	 * This is ideal when you need to recompile a regex for use within a conditional statement
	 *
	 * @method compile
	 * @public
	 * @param  {Object} regex     RegExp
	 * @param  {String} pattern   Regular expression pattern
	 * @param  {String} modifiers Modifiers to apply to the pattern
	 * @return {Boolean}          true
	 */
	compile : function ( reg, pattern, modifiers ) {
		reg.compile( pattern, modifiers );

		return true;
	},

	/**
	 * Creates a CSS stylesheet in the View
	 *
	 * @method css
	 * @public
	 * @param  {String} content CSS to put in a style tag
	 * @param  {String} media   [Optional] Medias the stylesheet applies to
	 * @return {Object}         Element created or undefined
	 */
	css : function ( content, media ) {
		var ss, css;

		ss = element.create( "style", {type: "text/css", media: media || "print, screen"}, utility.$( "head" )[0] );

		if ( ss.styleSheet ) {
			ss.styleSheet.cssText = content;
		}
		else {
			css = document.createTextNode( content );
			ss.appendChild( css );
		}

		return ss;
	},

	/**
	 * Debounces a function
	 *
	 * @method debounce
	 * @public
	 * @param  {Function} fn    Function to execute
	 * @param  {Number}   ms    Time to wait to execute in milliseconds, default is 1000
	 * @param  {Mixed}    scope `this` context during execution, default is `global`
	 * @return {Undefined}      undefined
	 */
	debounce : function ( fn, ms, scope ) {
		if ( typeof fn !== "function" ) {
			throw new Error( label.error.invalidArguments );
		}

		ms    = ms    || 1000;
		scope = scope || global;

		return function debounced () {
			utility.defer( function () {
				fn.apply( scope, arguments );
			}, ms);
		};
	},

	/**
	 * Allows deep setting of properties without knowing
	 * if the structure is valid
	 *
	 * @method define
	 * @public
	 * @param  {String} args  Dot delimited string of the structure
	 * @param  {Mixed}  value Value to set
	 * @param  {Object} obj   Object receiving value
	 * @return {Object}       Object receiving value
	 */
	define : function ( args, value, obj ) {
		args    = args.split( "." );
		var p   = obj,
		    nth = args.length;

		if ( obj === undefined ) {
			obj = this;
		}

		if ( value === undefined ) {
			value = null;
		}

		array.each( args, function ( i, idx ) {
			var num = idx + 1 < nth && !isNaN( number.parse( args[idx + 1], 10 ) ),
			    val = value;

			if ( !isNaN( number.parse( i, 10 ) ) )  {
				i = number.parse( i, 10 );
			}
			
			// Creating or casting
			if ( p[i] === undefined ) {
				p[i] = num ? [] : {};
			}
			else if ( p[i] instanceof Object && num ) {
				p[i] = array.cast( p[i] );
			}
			else if ( p[i] instanceof Object ) {
				// Do nothing
			}
			else if ( p[i] instanceof Array && !num ) {
				p[i] = array.toObject( p[i] );
			}
			else {
				p[i] = {};
			}

			// Setting reference or value
			idx + 1 === nth ? p[i] = val : p = p[i];
		});

		return obj;
	},

	/**
	 * Defers the execution of Function by at least the supplied milliseconds
	 * Timing may vary under "heavy load" relative to the CPU & client JavaScript engine
	 *
	 * @method defer
	 * @public
	 * @param  {Function} fn     Function to defer execution of
	 * @param  {Number}   ms     Milliseconds to defer execution
	 * @param  {Number}   id     [Optional] ID of the deferred function
	 * @param  {Boolean}  repeat [Optional] Describes the execution, default is `false`
	 * @return {String}          ID of the timer
	 */
	defer : function ( fn, ms, id, repeat ) {
		var op;

		ms     = ms || 0;
		id     = id || utility.uuid( true );
		repeat = ( repeat === true );

		op = function () {
			utility.clearTimers( id );
			fn();
		};

		utility.clearTimers( id );
		utility[repeat ? "repeating" : "timer"][id] = setTimeout( op, ms );

		return id;
	},

	/**
	 * Queries DOM with fastest method
	 *
	 * @method dom
	 * @private
	 * @param  {String} arg DOM query
	 * @return {Mixed}      undefined, Element, or Array of Elements
	 */
	dom : function ( arg ) {
		var result;

		if ( !regex.selector_complex.test( arg ) ) {
			if ( regex.hash.test( arg ) ) {
				result = document.getElementById( arg.replace( regex.hash, "" ) ) || undefined;
			}
			else if ( regex.klass.test( arg ) ) {
				result = array.cast( document.getElementsByClassName( arg.replace( regex.klass, "" ) ) );
			}
			else {
				result = array.cast( document.getElementsByTagName( arg ) );
			}
		}
		else {
			result = array.cast( document.querySelectorAll( arg ) );
		}

		return result;
	},

	/**
	 * Encodes a UUID to a DOM friendly ID
	 *
	 * @method domId
	 * @public
	 * @param  {String} UUID
	 * @return {String} DOM friendly ID
	 */
	domId : function ( arg ) {
		return "a" + arg.replace( /-/g, "" ).slice( 1 );
	},

	/**
	 * Error handling, with history in .log
	 *
	 * @method error
	 * @public
	 * @param  {Mixed}   e       Error object or message to display
	 * @param  {Array}   args    Array of arguments from the callstack
	 * @param  {Mixed}   scope   Entity that was "this"
	 * @param  {Boolean} warning [Optional] Will display as console warning if true
	 * @return {Undefined}       undefined
	 */
	error : function ( e, args, scope, warning ) {
		warning = ( warning === true );
		var o   = {
			"arguments" : args !== undefined ? array.cast( args ) : [],
			message     : e.message || e,
			number      : e.number !== undefined ? ( e.number & 0xFFFF ) : undefined,
			scope       : scope,
			stack       : e.stack   || undefined,
			timestamp   : new Date().toUTCString(),
			type        : e.type    || "TypeError"
		};

		utility.log( o.stack || o.message, !warning ? "error" : "warn" );
		utility.error.log.push( o );
		observer.fire( abaaso, "error", o );

		return undefined;
	},

	/**
	 * Creates a "class" extending Object, with optional decoration
	 *
	 * @method extend
	 * @public
	 * @param  {Object} obj Object to extend
	 * @param  {Object} arg [Optional] Object for decoration
	 * @return {Object}     Decorated obj
	 */
	extend : function () {
		if ( typeof Object.create === "function" ) {
			return function ( obj, arg ) {
				var o;

				if ( obj === undefined ) {
					throw new Error( label.error.invalidArguments );
				}

				o = Object.create( obj );

				if ( arg instanceof Object ) {
					utility.merge( o, arg );
				}

				return o;
			};
		}
		else {
			return function ( obj, arg ) {
				function Extended () {}

				var o;

				if ( obj === undefined ) {
					throw new Error( label.error.invalidArguments );
				}

				Extended.prototype = obj;

				o = new Extended();

				if ( arg instanceof Object ) {
					utility.merge( o, arg );
				}

				return o;
			};
		}
	}(),

	/**
	 * Fibonacci calculator
	 *
	 * @method fib
	 * @public
	 * @param  {Number} i Number to calculate
	 * @return {Number}   Calculated number
	 */
	fib : function ( i ) {
		return i > 1 ? utility.fib( i - 1 ) + utility.fib( i - 2 ) : i;
	},

	/**
	 * Generates an ID value
	 *
	 * @method genId
	 * @public
	 * @param  {Mixed}   obj [Optional] Object to receive id
	 * @param  {Boolean} dom [Optional] Verify the ID is unique in the DOM, default is false
	 * @return {Mixed}       Object or id
	 */
	genId : function ( obj, dom ) {
		dom = ( dom === true );
		var id;

		if ( obj !== undefined && ( ( obj.id !== undefined && obj.id !== "" ) || ( obj instanceof Array ) || ( obj instanceof String || typeof obj === "string" ) ) ) {
			return obj;
		}

		if ( dom ) {
			do {
				id = utility.domId( utility.uuid( true) );
			}
			while ( utility.$( "#" + id ) !== undefined );
		}
		else {
			id = utility.domId( utility.uuid( true) );
		}

		if ( typeof obj === "object" ) {
			obj.id = id;

			return obj;
		}
		else {
			return id;
		}
	},

	/**
	 * Converts RGB to HEX
	 *
	 * @method hex
	 * @public
	 * @param  {String} color RGB as `rgb(255, 255, 255)` or `255, 255, 255`
	 * @return {String}       Color as HEX
	 */
	hex : function ( color ) {
		var digits, red, green, blue, result, i, nth;

		if ( color.charAt( 0 ) === "#" ) {
		    result = color;
		}
		else {
			digits = string.explode( color.replace( /.*\(|\)/g, "" ) );
			red    = number.parse( digits[0] || 0 );
			green  = number.parse( digits[1] || 0 );
			blue   = number.parse( digits[2] || 0 );
			result = ( blue | ( green << 8 ) | ( red << 16 ) ).toString( 16 );

			if ( result.length < 6 ) {
				nth = number.diff( result.length, 6 );
				i   = -1;

				while ( ++i < nth ) {
					result = "0" + result;
				}
			}

			result = "#" + result;
		}

		return result;
	},

	/**
	 * Iterates an Object and executes a function against the properties
	 *
	 * Iteration can be stopped by returning false from fn
	 *
	 * @method iterate
	 * @public
	 * @param  {Object}   obj Object to iterate
	 * @param  {Function} fn  Function to execute against properties
	 * @return {Object}       Object
	 */
	iterate : function () {
		if ( typeof Object.keys === "function" ) {
			return function ( obj, fn ) {
				if ( typeof fn !== "function" ) {
					throw new Error( label.error.invalidArguments );
				}

				array.each( Object.keys( obj ), function ( i ) {
					return fn.call( obj, obj[i], i );
				});

				return obj;
			};
		}
		else {
			return function ( obj, fn ) {
				var has = Object.prototype.hasOwnProperty,
				    i, result;

				if ( typeof fn !== "function" ) {
					throw new Error( label.error.invalidArguments );
				}

				for ( i in obj ) {
					if ( has.call( obj, i ) ) {
						result = fn.call( obj, obj[i], i );

						if ( result === false ) {
							break;
						}
					}
					else {
						break;
					}
				}

				return obj;
			};
		}
	}(),

	/**
	 * Renders a loading icon in a target element,
	 * with a class of "loading"
	 *
	 * @method loading
	 * @public
	 * @param  {Mixed} obj Element
	 * @return {Mixed}     Element
	 */
	loading : function ( obj ) {
		var l = abaaso.loading;

		if ( l.url === null || obj === undefined ) {
			throw new Error( label.error.invalidArguments );
		}

		// Setting loading image
		if ( l.image === undefined ) {
			l.image     = new Image();
			l.image.src = l.url;
		}

		// Clearing target element
		element.clear( obj );

		// Creating loading image in target element
		element.create( "img", {alt: label.common.loading, src: l.image.src}, element.create( "div", {"class": "loading"}, obj ) );

		return obj;
	},

	/**
	 * Writes argument to the console
	 *
	 * @method log
	 * @public
	 * @param  {String} arg    String to write to the console
	 * @param  {String} target [Optional] Target console, default is "log"
	 * @return {Undefined}     undefined
	 */
	log : function ( arg, target ) {
		var ts, msg;

		if ( typeof console !== "undefined" ) {
			ts  = typeof arg !== "object";
			msg = ts ? "[" + new Date().toLocaleTimeString() + "] " + arg : arg;
			console[target || "log"]( msg );
		}
	},

	/**
	 * Merges obj with arg
	 *
	 * @method merge
	 * @public
	 * @param  {Object} obj Object to decorate
	 * @param  {Object} arg Decoration
	 * @return {Object}     Decorated Object
	 */
	merge : function ( obj, arg ) {
		utility.iterate( arg, function ( v, k ) {
			if ( ( obj[k] instanceof Array ) && ( v instanceof Array ) ) {
				array.merge( obj[k], v );
			}
			else if ( ( obj[k] instanceof Object ) && ( v instanceof Object ) ) {
				utility.iterate( v, function ( x, y ) {
					obj[k][y] = utility.clone( x );
				});
			}
			else {
				obj[k] = utility.clone( v );
			}
		});

		return obj;
	},
	
	/**
	 * Registers a module on abaaso
	 *
	 * @method module
	 * @public
	 * @param  {String} arg Module name
	 * @param  {Object} obj Module structure
	 * @return {Object}     Module registered
	 */
	module : function ( arg, obj ) {
		if ( $[arg] !== undefined || !obj instanceof Object ) {
			throw new Error( label.error.invalidArguments );
		}
		
		$[arg] = obj;

		return $[arg];
	},

	/**
	 * Returns Object, or reference to Element
	 *
	 * @method object
	 * @private
	 * @param  {Mixed} obj Entity or $ query
	 * @return {Mixed}     Entity
	 */
	object : function ( obj ) {
		return typeof obj === "object" ? obj : ( obj.toString().charAt( 0 ) === "#" ? utility.$( obj ) : obj );
	},

	/**
	 * Parses a URI into an Object
	 *
	 * @method parse
	 * @public
	 * @param  {String} uri URI to parse
	 * @return {Object}     Parsed URI
	 */
	parse : function ( uri ) {
		var obj    = {},
		    parsed = {};

		if ( uri === undefined ) {
			uri = !server ? location.href : "";
		}

		if ( !server ) {
			obj = document.createElement( "a" );
			obj.href = uri;
		}
		else {
			obj = url.parse( uri );
		}

		if ( server ) {
			utility.iterate( obj, function ( v, k ) {
				if ( v === null ) {
					obj[k] = undefined;
				}
			});
		}

		parsed = {
			auth     : server ? null : regex.auth.exec( uri ),
			protocol : obj.protocol || "http:",
			hostname : obj.hostname || "localhost",
			port     : !string.isEmpty( obj.port ) ? number.parse( obj.port, 10 ) : "",
			pathname : obj.pathname,
			search   : obj.search   || "",
			hash     : obj.hash     || "",
			host     : obj.host     || "localhost"
		};

		// 'cause IE is ... IE; required for data.batch()
		if ( client.ie ) {
			if ( parsed.protocol === ":" ) {
				parsed.protocol = location.protocol;
			}

			if ( string.isEmpty( parsed.hostname ) ) {
				parsed.hostname = location.hostname;
			}

			if ( string.isEmpty( parsed.host ) ) {
				parsed.host = location.host;
			}

			if ( parsed.pathname.charAt( 0 ) !== "/" ) {
				parsed.pathname = "/" + parsed.pathname;
			}
		}

		parsed.auth  = obj.auth || ( parsed.auth === null ? "" : parsed.auth[1] );
		parsed.href  = obj.href || ( parsed.protocol + "//" + ( string.isEmpty( parsed.auth ) ? "" : parsed.auth + "@" ) + parsed.host + parsed.pathname + parsed.search + parsed.hash );
		parsed.path  = obj.path || parsed.pathname + parsed.search;
		parsed.query = utility.queryString( null, parsed.search );

		return parsed;
	},

	/**
	 * Sets a property on an Object, if defineProperty cannot be used the value will be set classically
	 *
	 * @method property
	 * @public
	 * @param  {Object} obj        Object to decorate
	 * @param  {String} prop       Name of property to set
	 * @param  {Object} descriptor Descriptor of the property
	 * @return {Object}            Object receiving the property
	 */
	property : function () {
		if ( ( server || ( !client.ie || client.version > 8 ) ) && typeof Object.defineProperty === "function" ) {
			return function ( obj, prop, descriptor ) {
				if ( !( descriptor instanceof Object ) ) {
					throw new Error( label.error.invalidArguments );
				}

				if ( descriptor.value !== undefined && descriptor.get !== undefined ) {
					delete descriptor.value;
				}

				Object.defineProperty( obj, prop, descriptor );
			};
		}
		else {
			return function ( obj, prop, descriptor ) {
				if ( !( descriptor instanceof Object ) ) {
					throw new Error( label.error.invalidArguments );
				}

				obj[prop] = descriptor.value;

				return obj;
			};
		}
	},

	/**
	 * Sets methods on a prototype object
	 *
	 * Allows hooks to be overwritten
	 *
	 * @method proto
	 * @private
	 * @param  {Object} obj  Object receiving prototype extension
	 * @param  {String} type Identifier of obj, determines what Arrays to apply
	 * @return {Object}      obj or undefined
	 */
	proto : function ( obj, type ) {
		utility.iterate( prototypes[type], function ( v, k ) {
			utility.property( obj.prototype, k, {value: v, configurable: true, writable: true} );
		});

		return obj;
	},

	/**
	 * Parses a query string & coerces values
	 *
	 * @method queryString
	 * @public
	 * @param  {String} arg     [Optional] Key to find in the querystring
	 * @param  {String} qstring [Optional] Query string to parse
	 * @return {Mixed}          Value or Object of key:value pairs
	 */
	queryString : function ( arg, qstring ) {
		var obj    = {},
		    result = qstring !== undefined ? ( qstring.indexOf( "?" ) > -1 ? qstring.replace( /.*\?/, "" ) : null) : ( server || string.isEmpty( location.search ) ? null : location.search.replace( "?", "" ) ),
		    item;

		if ( result !== null && !string.isEmpty( result ) ) {
			result = result.split( "&" );
			array.each( result, function (prop ) {
				item = prop.split( "=" );

				if ( string.isEmpty( item[0] ) ) {
					return;
				}

				if ( item[1] === undefined || string.isEmpty( item[1] ) ) {
					item[1] = "";
				}
				else if ( string.isNumber( item[1] )) {
					item[1] = Number(item[1] );
				}
				else if ( string.isBoolean( item[1] )) {
					item[1] = (item[1] === "true" );
				}

				if ( obj[item[0]] === undefined ) {
					obj[item[0]] = item[1];
				}
				else if ( !(obj[item[0]] instanceof Array) ) {
					obj[item[0]] = [obj[item[0]]];
					obj[item[0]].push( item[1] );
				}
				else {
					obj[item[0]].push( item[1] );
				}
			});
		}

		if ( arg !== null && arg !== undefined ) {
			obj = obj[arg];
		}

		return obj;
	},

	/**
	 * Returns an Array of parameters of a Function
	 *
	 * @method reflect
	 * @public
	 * @param  {Function} arg Function to reflect
	 * @return {Array}        Array of parameters
	 */
	reflect : function ( arg ) {
		if ( arg === undefined ) {
			arg = this || utility.$;
		}

		arg = arg.toString().match( regex.reflect )[1];

		return string.explode( arg );
	},

	/**
	 * Creates a recursive function
	 *
	 * Return false from the function to halt recursion
	 *
	 * @method repeat
	 * @public
	 * @param  {Function} fn  Function to execute repeatedly
	 * @param  {Number}   ms  Milliseconds to stagger the execution
	 * @param  {String}   id  [Optional] Timeout ID
	 * @param  {Boolean}  now Executes `fn` and then setup repetition, default is `true`
	 * @return {String}       Timeout ID
	 */
	repeat : function ( fn, ms, id, now ) {
		ms  = ms || 10;
		id  = id || utility.uuid( true );
		now = ( now !== false );

		// Could be valid to return false from initial execution
		if ( now && fn() === false ) {
			return;
		}

		// Creating repeating execution
		utility.defer( function () {
			var recursive = function ( fn, ms, id ) {
				var recursive = this;

				if ( fn() !== false ) {
					utility.repeating[id] = setTimeout( function () {
						recursive.call( recursive, fn, ms, id );
					}, ms );
				}
				else {
					delete utility.repeating[id];
				}
			};

			recursive.call( recursive, fn, ms, id );
		}, ms, id, true );

		return id;
	},

	/**
	 * Creates a script Element to load an external script
	 *
	 * @method script
	 * @public
	 * @param  {String} arg    URL to script
	 * @param  {Object} target [Optional] Element to receive the script
	 * @param  {String} pos    [Optional] Position to create the script at within the target
	 * @return {Object}        Script
	 */
	script : function ( arg, target, pos ) {
		return element.create( "script", {type: "application/javascript", src: arg}, target || utility.$( "head" )[0], pos );
	},

	/**
	 * Creates a link Element to load an external stylesheet
	 *
	 * @method stylesheet
	 * @public
	 * @param  {String} arg   URL to stylesheet
	 * @param  {String} media [Optional] Medias the stylesheet applies to
	 * @return {Objecct}      Stylesheet
	 */
	stylesheet : function ( arg, media ) {
		return element.create( "link", {rel: "stylesheet", type: "text/css", href: arg, media: media || "print, screen"}, utility.$( "head" )[0] );
	},

	/**
	 * Stops an Event from bubbling
	 *
	 * @method stop
	 * @public
	 * @param  {Object} e Event
	 * @return {Object}   Event
	 */
	stop : function ( e ) {
		if ( e.cancelBubble !== undefined ) {
			e.cancelBubble = true;
		}

		if ( typeof e.preventDefault === "function" ) {
			e.preventDefault();
		}

		if ( typeof e.stopPropagation === "function" ) {
			e.stopPropagation();
		}

		// Assumed to always be valid, even if it's not decorated on `e` ( I'm looking at you IE8 )
		e.returnValue = false;

		return e;
	},

	/**
	 * Returns the Event target
	 *
	 * @method target
	 * @public
	 * @param  {Object} e Event
	 * @return {Object}   Event target
	 */
	target : function ( e ) {
		return e.target || e.srcElement;
	},

	/**
	 * Transforms JSON to HTML and appends to Body or target Element
	 *
	 * @method tpl
	 * @public
	 * @param  {Object} data   JSON Object describing HTML
	 * @param  {Mixed}  target [Optional] Target Element or Element.id to receive the HTML
	 * @return {Object}        New Element created from the template
	 */
	tpl : function ( arg, target ) {
		var frag;

		if ( typeof arg !== "object" || (!(regex.object_undefined.test( typeof target ) ) && ( target = target.charAt( 0 ) === "#" ? utility.$( target ) : utility.$( target )[0] ) === undefined ) ) {
			throw new Error( label.error.invalidArguments );
		}

		if ( target === undefined ) {
			target = utility.$( "body" )[0];
		}

		frag  = document.createDocumentFragment();

		if ( arg instanceof Array ) {
			array.each( arg, function ( i ) {
				element.html(element.create( array.cast( i, true )[0], frag ), array.cast(i)[0] );
			});
		}
		else {
			utility.iterate( arg, function ( v, k ) {
				if ( typeof v === "string" ) {
					element.html( element.create( k, undefined, frag ), v );
				}
				else if ( ( v instanceof Array ) || ( v instanceof Object ) ) {
					utility.tpl( v, element.create( k, undefined, frag ) );
				}
			});
		}

		target.appendChild( frag );

		return array.last( target.childNodes );
	},

	/**
	 * Generates UUID Version 4
	 *
	 * @method uuid
	 * @public
	 * @param  {Boolean} safe [Optional] Strips - from UUID
	 * @return {String}       UUID
	 */
	uuid : function ( safe ) {
		var s = function () { return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 ); },
		    r = [8, 9, "a", "b"],
		    o;

		o = ( s() + s() + "-" + s() + "-4" + s().substr( 0, 3 ) + "-" + r[Math.floor( Math.random() * r.length )] + s().substr( 0, 3 ) + "-" + s() + s() + s() );

		if ( safe === true ) {
			o = o.replace( /-/g, "" );
		}

		return o;
	},

	/**
	 * Walks a structure and returns arg
	 *
	 * @method  walk
	 * @public
	 * @param  {Mixed}  obj  Object or Array
	 * @param  {String} arg  String describing the property to return
	 * @return {Mixed}       arg
	 */
	walk : function ( obj, arg ) {
		array.each( arg.replace( /\]$/, "" ).replace( /\]/g, "." ).split( /\.|\[/ ), function ( i ) {
			obj = obj[i];
		});

		return obj;
	},

	/**
	 * Accepts Deferreds or Promises as arguments or an Array
	 *
	 * @method when
	 * @public
	 * @return {Object} Deferred
	 */
	when : function () {
		var i     = 0,
		    defer = deferred.factory(),
		    args  = array.cast( arguments ),
		    nth;

		// Did we receive an Array? if so it overrides any other arguments
		if ( args[0] instanceof Array ) {
			args = args[0];
		}

		// How many instances to observe?
		nth = args.length;

		// None, end on next tick
		if ( nth === 0 ) {
			defer.resolve( null );
		}
		// Setup and wait
		else {
			array.each( args, function ( p ) {
				p.then( function () {
					if ( ++i === nth && !defer.isResolved()) {
						if ( args.length > 1 ) {
							defer.resolve( args.map( function ( obj ) {
								return obj.outcome || obj.promise.outcome;
							}));
						}
						else {
							defer.resolve( args[0].outcome || args[0].promise.outcome );
						}
					}
				}, function () {
					if ( !defer.isResolved() ) {
						if ( args.length > 1 ) {
							defer.reject( args.map( function ( obj ) {
								return obj.outcome || obj.promise.outcome;
							}));
						}
						else {
							defer.reject( args[0].outcome || args[0].promise.outcome );
						}
					}
				});
			});
		}

		return defer;
	}
};
