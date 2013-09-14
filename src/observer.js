/** @namespace abaaso.observer */
var observer = {
	/**
	 * Collection of listeners
	 *
	 * @memberOf abaaso.observer
	 * @type {object}
	 */
	listeners  : {},

	/**
	 * Array copy of listeners for observer.fire()
	 *
	 * @memberOf abaaso.observer
	 * @type {object}
	 */
	alisteners : {},

	/**
	 * Event listeners
	 *
	 * @memberOf abaaso.observer
	 * @type {object}
	 */
	elisteners : {},

	/**
	 * Tracks count of listeners per event across all states
	 *
	 * @memberOf abaaso.observer
	 * @type {object}
	 */
	clisteners : {},

	/**
	 * Boolean indicating if events are logged to the console
	 *
	 * @memberOf abaaso.observer
	 * @type {boolean}
	 */
	log : false,

	/**
	 * Queue of events to fire
	 *
	 * @memberOf abaaso.observer
	 * @type {array}
	 */
	queue : [],

	/**
	 * If `true`, events are queued
	 *
	 * @memberOf abaaso.observer
	 * @type {boolean}
	 */
	silent : false,

	/**
	 * If `true`, events are ignored
	 *
	 * @memberOf abaaso.observer
	 * @type {boolean}
	 */
	ignore : false,

	/**
	 * Adds a handler to an event
	 *
	 * @method add
	 * @memberOf abaaso.observer
	 * @param  {mixed}    obj   Primitive
	 * @param  {string}   event Event, or Events being fired ( comma delimited supported )
	 * @param  {function} fn    Event handler
	 * @param  {string}   id    [Optional / Recommended] The id for the listener
	 * @param  {string}   scope [Optional / Recommended] The id of the object or element to be set as 'this'
	 * @param  {string}   st    [Optional] Application state, default is current
	 * @return {mixed}          Primitive
	 */
	add : function ( obj, event, fn, id, scope, st ) {
		scope = scope || obj;
		st    = st    || state.getCurrent();

		if ( event !== undefined ) {
			event = string.explode( event );
		}

		id = id || utility.genId();

		var instance = null,
		    l        = observer.listeners,
		    a        = observer.alisteners,
		    ev       = observer.elisteners,
		    cl       = observer.clisteners,
		    gr       = regex.observer_globals,
		    ar       = regex.observer_allowed,
		    o        = observer.id( obj ),
		    add, reg;

		if ( o === undefined || event === null || event === undefined || typeof fn !== "function" ) {
			throw new Error( label.error.invalidArguments );
		}

		if ( l[o] === undefined ) {
			l[o]  = {};
			a[o]  = {};
			cl[o] = {};
		}

		array.each( event, function ( i ) {
			var eid = o + "_" + i;

			if ( l[o][i] === undefined ) {
				l[o][i]  = {};
				a[o][i]  = {};
				cl[o][i] = 0;
			}

			if ( l[o][i][st] === undefined ) {
				l[o][i][st] = {};
				a[o][i][st] = [];
			}

			instance = ( gr.test( o ) || (!/\//g.test( o ) && o !== "abaaso" ) ) ? obj : null;

			// Setting up event listener if valid
			if ( instance !== null && instance !== undefined && i.toLowerCase() !== "afterjsonp" && ev[eid] === undefined && ( gr.test( o ) || typeof instance.listeners === "function" ) ) {
				add = ( typeof instance.addEventListener === "function" );
				reg = ( typeof instance.attachEvent === "object" || add );

				if ( reg ) {
					// Registering event listener
					ev[eid] = function ( e ) {
						if ( !ar.test( e.type ) ) {
							utility.stop( e );
						}

						observer.fire( obj, i, e );
					};

					// Hooking event listener
					instance[add ? "addEventListener" : "attachEvent"]( ( add ? "" : "on" ) + i, ev[eid], false );
				}
			}

			l[o][i][st][id] = {fn: fn, scope: scope};
			observer.sync( o, i, st );
			cl[o][i]++;
		});

		return obj;
	},

	/**
	 * Decorates `obj` with `observer` methods
	 *
	 * @method decorate
	 * @memberOf abaaso.observer
	 * @param  {object} obj Object to decorate
	 * @return {object}     Object to decorate
	 */
	decorate : function ( obj ) {
		var methods = [
			["fire",      function () { return observer.fire.apply( observer, [this].concat( array.cast( arguments ) ) ); }],
			["listeners", function ( event ) { return observer.list(this, event ); }],
			["on",        function ( event, listener, id, scope, standby ) { return observer.add( this, event, listener, id, scope, standby ); }],
			["once",      function ( event, listener, id, scope, standby ) { return observer.once( this, event, listener, id, scope, standby ); }],
			["un",        function ( event, id ) { return observer.remove( this, event, id ); }]
		];

		array.each( methods, function ( i ) {
			utility.property( obj, i[0], {value: i[1], configurable: true, enumerable: true, writable: true} );
		});

		return obj;
	},

	/**
	 * Discard observer events
	 *
	 * @method discard
	 * @memberOf abaaso.observer
	 * @param  {boolean} arg [Optional] Boolean indicating if events will be ignored
	 * @return {boolean}     Current setting
	 */
	discard : function ( arg ) {
		return arg === undefined ? observer.ignore : ( observer.ignore = ( arg === true ) );
	},

	/**
	 * Fires an event
	 *
	 * @method fire
	 * @memberOf abaaso.observer
	 * @param  {mixed}  obj   Primitive
	 * @param  {string} event Event, or Events being fired ( comma delimited supported )
	 * @return {mixed}        Primitive
	 */
	fire : function ( obj, event ) {
		var quit = false,
		    a    = array.remove( array.cast( arguments ), 0, 1 ),
		    o, s, log, list;

		if ( observer.ignore ) {
			return obj;
		}

		o = observer.id( obj );

		if ( o === undefined || event === undefined ) {
			throw new Error( label.error.invalidArguments );
		}

		if ( observer.silent ) {
			observer.queue.push( {obj: obj, event: event} );
		}
		else {
			s   = state.getCurrent();
			log = abaaso.logging;

			array.each( string.explode( event ), function ( e ) {
				if ( log ) {
					utility.log(o + " firing " + e );
				}

				list = observer.list( obj, e, observer.alisteners );

				if ( list.all !== undefined ) {
					array.each( list.all, function ( i ) {
						var result = i.fn.apply( i.scope, a );

						if ( result === false ) {
							quit = true;

							return result;
						}
					});
				}

				if ( !quit && s !== "all" && list[s] !== undefined ) {
					array.each( list[s], function ( i ) {
						return i.fn.apply( i.scope, a );
					});
				}
			});
		}

		return obj;
	},

	/**
	 * Gets the Observer id of arg
	 *
	 * @method id
	 * @memberOf abaaso.observer
	 * @param  {mixed}  Object or String
	 * @return {string} Observer id
	 */
	id : function ( arg ) {
		var id;

		if ( arg === global ) {
			id = "window";
		}
		else if ( !server && arg === document ) {
			id = "document";
		}
		else if ( !server && arg === document.body ) {
			id = "body";
		}
		else {
			utility.genId( arg );
			id = arg.id || ( typeof arg.toString === "function" ? arg.toString() : arg );
		}

		return id;
	},

	/**
	 * Gets the listeners for an event
	 *
	 * @method list
	 * @memberOf abaaso.observer
	 * @param  {mixed}  obj    Primitive
	 * @param  {string} event  Event being queried
	 * @param  {object} target [Optional] Listeners collection to access, default is `observer.listeners`
	 * @return {mixed}         Primitive
	 */
	list : function ( obj, event, target ) {
		var l = target || observer.listeners,
		    o = observer.id( obj ),
		    r;

		if ( l[o] === undefined && event === undefined ) {
			r = {};
		}
		else if ( l[o] !== undefined && ( event === undefined || string.isEmpty( event ) ) ) {
			r = l[o];
		}
		else if ( l[o] !== undefined && l[o][event] !== undefined ) {
			r = l[o][event];
		}
		else {
			r = {};
		}

		return r;
	},

	/**
	 * Adds a listener for a single execution
	 *
	 * @method once
	 * @memberOf abaaso.observer
	 * @param  {mixed}    obj   Primitive
	 * @param  {string}   event Event being fired
	 * @param  {function} fn    Event handler
	 * @param  {string}   id    [Optional / Recommended] The id for the listener
	 * @param  {string}   scope [Optional / Recommended] The id of the object or element to be set as 'this'
	 * @param  {string}   st    [Optional] Application state, default is current
	 * @return {mixed}          Primitive
	 */
	once : function ( obj, event, fn, id, scope, st ) {
		var uuid = id || utility.genId();

		scope = scope || obj;
		st    = st    || state.getCurrent();

		if ( obj === undefined || event === null || event === undefined || typeof fn !== "function" ) {
			throw new Error( label.error.invalidArguments );
		}

		observer.add( obj, event, function () {
			fn.apply( scope, arguments );
			observer.remove( obj, event, uuid, st );
		}, uuid, scope, st);

		return obj;
	},

	/**
	 * Pauses observer events, and queues them
	 *
	 * @method pause
	 * @memberOf abaaso.observer
	 * @param  {boolean} arg Boolean indicating if events will be queued
	 * @return {boolean}     Current setting
	 */
	pause : function ( arg ) {
		if ( arg === true ) {
			observer.silent = arg;
		}
		else if ( arg === false ) {
			observer.silent = arg;

			array.each( observer.queue, function ( i ) {
				observer.fire( i.obj, i.event );
			});

			observer.queue = [];
		}

		return arg;
	},

	/**
	 * Removes listeners
	 *
	 * @method remove
	 * @memberOf abaaso.observer
	 * @param  {mixed}  obj   Primitive
	 * @param  {string} event [Optional] Event, or Events being fired ( comma delimited supported )
	 * @param  {string} id    [Optional] Listener id
	 * @param  {string} st    [Optional] Application state, default is current
	 * @return {mixed}        Primitive
	 */
	remove : function ( obj, event, id, st ) {
		st = st || state.getCurrent();

		var l   = observer.listeners,
		    a   = observer.alisteners,
		    ev  = observer.elisteners,
		    cl  = observer.clisteners,
		    o   = observer.id( obj ),
		    add = ( typeof obj.addEventListener === "function" ),
		    reg = ( typeof obj.attachEvent === "object" || add ),
		    fn;

		/**
		 * Removes DOM event hook
		 *
		 * @method fn
		 * @private
		 * @param  {mixed}  event String or null
		 * @param  {number} i     Amount of listeners being removed
		 * @return {undefined}    undefined
		 */
		fn = function ( event, i ) {
			var unhook = ( typeof i === "number" && ( cl[o][event] = ( cl[o][event] - i ) ) === 0 );

			if ( unhook && reg ) {
				obj[add ? "removeEventListener" : "detachEvent"]( ( add ? "" : "on" ) + event, ev[o + "_" + event], false );
				delete ev[o + "_" + event];
			}
		};

		if ( l[o] === undefined ) {
			return obj;
		}

		if ( event === undefined || event === null ) {
			if ( regex.observer_globals.test( o ) || typeof o.listeners === "function" ) {
				utility.iterate( ev, function ( v, k ) {
					if ( k.indexOf( o + "_" ) === 0) {
						fn( k.replace( /.*_/, "" ), 1 );
					}
				});
			}

			delete l[o];
			delete a[o];
			delete cl[o];
		}
		else {
			array.each( string.explode( event ), function ( e ) {
				var sync = false;

				if ( l[o][e] === undefined ) {
					return;
				}

				if ( id === undefined ) {
					if ( regex.observer_globals.test( o ) || typeof o.listeners === "function" ) {
						fn( e, array.keys( l[o][e][st] ).length );
					}

					l[o][e][st] = {};
					sync = true;
				}
				else if ( l[o][e][st][id] !== undefined ) {
					fn( e, 1 );
					delete l[o][e][st][id];
					sync = true;
				}

				if ( sync ) {
					observer.sync( o, e, st );
				}
			});
		}

		return obj;
	},

	/**
	 * Returns the sum of active listeners for one or all Objects
	 *
	 * @method sum
	 * @memberOf abaaso.observer
	 * @param  {mixed} obj [Optional] Entity
	 * @return {object}    Object with total listeners per event
	 */
	sum : function ( obj ) {
		return obj ? observer.clisteners[observer.id( obj )] : array.keys( observer.clisteners ).length;
	},

	/**
	 * Syncs `alisteners` with `listeners`
	 *
	 * @method sync
	 * @memberOf abaaso.observer
	 * @param  {string} obj   Object ID
	 * @param  {string} event Event
	 * @param  {string} st    Application state
	 * @return {undefined}    undefined
	 */
	sync : function ( obj, event, st ) {
		observer.alisteners[obj][event][st] = array.cast( observer.listeners[obj][event][st] );
	}
};
