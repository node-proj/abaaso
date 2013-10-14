/**
 * Bootstraps framework
 *
 * @function bootstrap
 * @memberOf abaaso
 * @return {Undefined} undefined
 */
bootstrap = function () {
	var cleanup, fn, init;

	// Removes references to deleted DOM elements, avoiding memory leaks
	cleanup = function ( obj ) {
		observer.remove( obj );

		if ( utility.observers[obj.id] ) {
			delete utility.observers[obj.id];
		}

		array.each( array.cast( obj.childNodes ), function ( i ) {
			cleanup( i );
		} );
	};

	// Repeating function to call init()
	fn = function () {
		if ( regex.complete_loaded.test( document.readyState ) ) {
			init();

			return false;
		}
	};

	// Second phase
	init = function () {
		// Cache garbage collector (every minute)
		utility.repeat( function () {
			cache.clean();
		}, 60000, "cacheGarbageCollector");

		// Firing events to setup
		observer.fire( "abaaso", "init, ready" );
		observer.remove( "abaaso", "init, ready" );
	};

	// Creating error log
	utility.error.log = [];

	// Describing the Client
	if ( !server ) {
		abaaso.client.version = client.version = client.version();
		abaaso.client.mobile  = client.mobile  = client.mobile.call( this );
		abaaso.client.tablet  = client.tablet  = client.tablet.call( this );

		// IE9 and older is not supported
		if ( client.ie && client.version < 10 ) {
			throw new Error( label.error.upgrade );
		}
	}
	else {
		// XHR shim
		XMLHttpRequest = xhr();
	}

	// Caching functions
	has   = Object.prototype.hasOwnProperty;
	slice = Array.prototype.slice;

	// Setting events & garbage collection
	if ( !server ) {
		observer.add( global, "error", function ( e ) {
			observer.fire( "abaaso", "error", e );
		}, "error", global, "all");

		observer.add( global, "hashchange", function ()  {
			observer.fire( "abaaso", "beforeHash, hash, afterHash", location.hash );
		}, "hash", global, "all" );

		observer.add( global, "load", function ()  {
			observer.fire( "abaaso", "render" );
			observer.remove( "abaaso", "render" );
			observer.remove( this, "load" );
		} );

		// DOM 4+
		if ( typeof MutationObserver == "function" ) {
			utility.observers.body = new MutationObserver( function ( arg ) {
				array.each( arg, function ( record ) {
					// Added Elements
					array.each( array.cast( record.addedNodes ).filter( function ( obj ) {
						return obj.id !== undefined;
					} ), function( obj ) {
						utility.genId( obj, true );

						if ( !utility.observers[obj.id] ) {
							utility.observers[obj.id] = new MutationObserver( function ( arg ) {
								observer.fire( obj, "change", arg );
							} );

							utility.observers[obj.id].observe( obj, {attributes: true, attributeOldValue: true, childList: true, characterData: true, characterDataOldValue: true, subtree: true} );
						}
					} );

					// Removed Elements
					array.each( array.cast( record.removedNodes ), function ( obj ) {
						cleanup( obj );
					} );
				} );
			} );

			utility.observers.body.observe( document, {childList: true, subtree: true} );
		}
		// DOM 3 (slow!)
		else {
			observer.add( global, "DOMNodeRemoved", function ( e ) {
				var obj = utility.target( e );

				if ( obj.id && ( e.relatedNode instanceof Element ) ) {
					cleanup( obj );
				}
			}, "mutation", global, "all");
		}
	}

	// Creating a public facade for `state`
	utility.property( abaaso.state, "current",  {enumerable: true, get: state.getCurrent,  set: state.setCurrent} );
	utility.property( abaaso.state, "previous", {enumerable: true, get: state.getPrevious, set: state.setPrevious} );
	utility.property( abaaso.state, "header",   {enumerable: true, get: state.getHeader,   set: state.setHeader} );

	abaaso.ready = true;

	// Initializing
	if ( typeof exports != "undefined" || typeof define == "function" || regex.complete_loaded.test( document.readyState ) ) {
		init();
	}
	else if ( typeof document.addEventListener == "function" ) {
		document.addEventListener( "DOMContentLoaded" , function () {
			init();
		}, false );
	}
	else if ( typeof document.attachEvent == "function" ) {
		document.attachEvent( "onreadystatechange" , fn );
	}
	else {
		utility.repeat( fn );
	}
};
