/**
 * Element methods
 *
 * @namespace abaaso.element
 */
var element = {
	/**
	 * Gets or sets an Element attribute
	 *
	 * @method attr
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj   Element
	 * @param  {string} name  Attribute name
	 * @param  {mixed}  value Attribute value
	 * @return {object}       Element
	 */
	attr : function ( obj, key, value ) {
		var target, result;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			if ( value === undefined ) {
				result = obj.getAttributeNS( obj.namespaceURI, key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				}
				else {
					result = utility.coerce( result );
				}
			}
			else {
				obj.setAttributeNS( obj.namespaceURI, key, value );
			}
		}
		else {
			if ( typeof value === "string" ) {
				value = string.trim( value );
			}

			if ( regex.checked_disabled.test( key ) && value === undefined ) {
				return utility.coerce( obj[key] );
			}
			else if ( regex.checked_disabled.test( key ) && value !== undefined ) {
				obj[key] = value;
			}
			else if ( obj.nodeName === "SELECT" && key === "selected" && value === undefined) {
				return utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0] || utility.dom( "#" + obj.id + " option" )[0];
			}
			else if ( obj.nodeName === "SELECT" && key === "selected" && value !== undefined ) {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0];

				if ( target !== undefined ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}

				target = utility.dom( "#" + obj.id + " option[value=\"" + value + "\"]" )[0];
				target.selected = true;
				target.setAttribute( "selected", "selected" );
			}
			else if ( value === undefined ) {
				result = obj.getAttribute( key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				}
				else {
					result = utility.coerce( result );
				}

				return result;
			}
			else {
				obj.setAttribute( key, value );
			}
		}

		return obj;
	},

	/**
	 * Clears an object's innerHTML, or resets it's state
	 *
	 * @method clear
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {object}    Element
	 */
	clear : function ( obj ) {
		if ( typeof obj.reset === "function" ) {
			obj.reset();
		}
		else if ( obj.value !== undefined ) {
			element.update( obj, {innerHTML: "", value: ""} );
		}
		else {
			element.update( obj, {innerHTML: ""} );
		}

		return obj;
	},

	/**
	 * Creates an Element in document.body or a target Element.
	 * An id is generated if not specified with args.
	 *
	 * @method create
	 * @memberOf abaaso.element
	 * @param  {string} type   Type of Element to create, or HTML String
	 * @param  {object} args   [Optional] Properties to set
	 * @param  {mixed}  target [Optional] Target Element
	 * @param  {mixed}  pos    [Optional] "first", "last" or Object describing how to add the new Element, e.g. {before: referenceElement}
	 * @return {mixed}         Element that was created, or an Array if `type` is a String of multiple Elements (frag)
	 */
	create : function ( type, args, target, pos ) {
		var svg  = false,
		    frag = false,
		    obj, uid, result;

		// Removing potential HTML template formatting
		type = type.replace( /\t|\n|\r/g, "" );

		if ( target !== undefined ) {
			svg = ( target.namespaceURI !== undefined && regex.svg.test( target.namespaceURI ) );
		}
		else {
			target = document.body;
		}
		
		if ( args instanceof Object && args.id !== undefined && utility.dom( "#" + args.id ) === undefined ) {
			uid = args.id;
			delete args.id;
		}
		else if ( !svg ) {
			uid = utility.genId( undefined, true );
		}

		// String injection, create a frag and apply it
		if ( regex.html.test( type ) ) {
			frag   = true;
			obj    = element.frag( type );
			result = obj.childNodes.length === 1 ? obj.childNodes[0] : array.cast( obj.childNodes );
		}
		// Original syntax
		else {
			if ( !svg && !regex.svg.test( type ) ) {
				obj = document.createElement( type );
			}
			else {
				obj = document.createElementNS( "http://www.w3.org/2000/svg", type );
			}

			if ( uid !== undefined ) {
				obj.id = uid;
			}

			if ( args instanceof Object ) {
				element.update( obj, args );
			}
		}

		if ( pos === undefined || pos === "last" ) {
			target.appendChild( obj );
		}
		else if ( pos === "first" ) {
			element.prependChild( target, obj );
		}
		else if ( pos === "after" ) {
			pos = {};
			pos.after = target;
			target    = target.parentNode;
			target.insertBefore( obj, pos.after.nextSibling );
		}
		else if ( pos.after !== undefined ) {
			target.insertBefore( obj, pos.after.nextSibling );
		}
		else if ( pos === "before" ) {
			pos = {};
			pos.before = target;
			target     = target.parentNode;
			target.insertBefore( obj, pos.before );
		}
		else if ( pos.before !== undefined ) {
			target.insertBefore( obj, pos.before );
		}
		else {
			target.appendChild( obj );
		}

		return !frag ? obj : result;
	},

	/**
	 * Gets or sets a CSS style attribute on an Element
	 *
	 * @method css
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj   Element
	 * @param  {string} key   CSS to put in a style tag
	 * @param  {string} value [Optional] Value to set
	 * @return {object}       Element
	 */
	css : function ( obj, key, value ) {
		key = string.toCamelCase( key );

		if ( value !== undefined ) {
			obj.style[key] = value;
			return obj;
		}
		else {
			return obj.style[key];
		}
	},

	/**
	 * Data attribute facade acting as a getter (with coercion) & setter
	 *
	 * @method data
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj   Element
	 * @param  {string} key   Data key
	 * @param  {mixed}  value Boolean, Number or String to set
	 * @return {mixed}        undefined, Element or value
	 */
	data : function ( obj, key, value ) {
		if ( value !== undefined ) {
			obj.setAttribute( "data-" + key, regex.json_wrap.test( value ) ? json.encode( value ) : value );
			return obj;
		}
		else {
			return utility.coerce( obj.getAttribute( "data-" + key ) );
		}
	},

	/**
	 * Destroys an Element
	 *
	 * @method destroy
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {undefined} undefined
	 */
	destroy : function ( obj ) {
		observer.remove( obj );

		if ( obj.parentNode !== null ) {
			obj.parentNode.removeChild( obj );
		}

		return undefined;
	},

	/**
	 * Disables an Element
	 *
	 * @method disable
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {object}    Element
	 */
	disable : function ( obj ) {
		if ( typeof obj.disabled === "boolean" && !obj.disabled ) {
			obj.disabled = true;
		}

		return obj;
	},

	/**
	 * Dispatches a DOM Event from an Element
	 *
	 * `data` will appear as `Event.detail`
	 *
	 * @method dispatch
	 * @memberOf abaaso.element
	 * @param  {object}  obj        Element which dispatches the Event
	 * @param  {string}  type       Type of Event to dispatch
	 * @param  {object}  data       Data to include with the Event
	 * @param  {boolean} bubbles    [Optional] Determines if the Event bubbles, defaults to `true`
	 * @param  {boolean} cancelable [Optional] Determines if the Event can be canceled, defaults to `true`
	 * @return {object}             Element which dispatches the Event
	 */
	dispatch : function ( obj, type, data, bubbles, cancelable ) {
		var ev = new CustomEvent( type );

		bubbles    = ( bubbles    !== false );
		cancelable = ( cancelable !== false );

		ev.initCustomEvent( type, bubbles, cancelable, data || {} );
		obj.dispatchEvent( ev );

		return obj;
	},

	/**
	 * Enables an Element
	 *
	 * @method enable
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {object}    Element
	 */
	enable : function ( obj ) {
		if ( typeof obj.disabled === "boolean" && obj.disabled ) {
			obj.disabled = false;
		}

		return obj;
	},

	/**
	 * Finds descendant childNodes of Element matched by arg
	 *
	 * @method find
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj Element to search
	 * @param  {string} arg Comma delimited string of descendant selectors
	 * @return {mixed}      Array of Elements or undefined
	 */
	find : function ( obj, arg ) {
		var result = [];

		utility.genId( obj, true );

		array.each( string.explode( arg ), function ( i ) {
			result = result.concat( utility.dom( "#" + obj.id + " " + i ) );
		});

		return result;
	},

	/**
	 * Creates a document fragment
	 *
	 * @method frag
	 * @memberOf abaaso.element
	 * @param  {string} arg [Optional] innerHTML
	 * @return {object}     Document fragment
	 */
	frag : function ( arg ) {
		var obj = document.createDocumentFragment();

		if ( arg ) {
			array.each( array.cast( element.create( "div", {innerHTML: arg}, obj ).childNodes ), function ( i ) {
				obj.appendChild( i );
			});

			obj.removeChild( obj.childNodes[0] );
		}

		return obj;
	},

	/**
	 * Determines if Element has descendants matching arg
	 *
	 * @method has
	 * @memberOf abaaso.element
	 * @param  {mixed}   obj Element or Array of Elements or $ queries
	 * @param  {string}  arg Type of Element to find
	 * @return {boolean}     True if 1 or more Elements are found
	 */
	has : function ( obj, arg ) {
		var result = element.find( obj, arg );

		return ( !isNaN( result.length ) && result.length > 0 );
	},

	/**
	 * Determines if obj has a specific CSS class
	 *
	 * @method hasClass
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {mixed}     Element, Array of Elements or undefined
	 */
	hasClass : function ( obj, klass ) {
		return obj.classList.contains( klass );
	},

	/**
	 * Returns a Boolean indidcating if the Object is hidden
	 *
	 * @method hidden
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {boolean}   `true` if hidden
	 */
	hidden : function ( obj ) {
		return obj.style.display === "none" || ( typeof obj.hidden === "boolean" && obj.hidden );
	},

	/**
	 * Gets or sets an Elements innerHTML
	 *
	 * @method html
	 * @memberOf abaaso.element
	 * @param  {object} obj Element
	 * @param  {string} arg [Optional] innerHTML value
	 * @return {object}     Element
	 */
	html : function ( obj, arg ) {
		if ( arg === undefined ) {
			return obj.innerHTML;
		}
		else {
			 obj.innerHTML = arg;
			 return obj;
		}
	},

	/**
	 * Determines if Element is equal to arg, supports nodeNames & CSS2+ selectors
	 *
	 * @method is
	 * @memberOf abaaso.element
	 * @param  {mixed}   obj Element
	 * @param  {string}  arg Property to query
	 * @return {boolean}     True if a match
	 */
	is : function ( obj, arg ) {
		if ( regex.selector_is.test( arg ) ) {
			utility.id( obj );
			return ( element.find( obj.parentNode, obj.nodeName.toLowerCase() + arg ).filter( function ( i ) {
				return ( i.id === obj.id );
			}).length === 1 );
		}
		else {
			return new RegExp( arg, "i" ).test( obj.nodeName );
		}
	},

	/**
	 * Tests if Element value or text is alpha-numeric
	 *
	 * @method isAlphaNum
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isAlphaNum : function ( obj ) {
		return obj.nodeName === "FORM" ? false : validate.test( {alphanum  : obj.value || element.text( obj )} ).pass;
	},

	/**
	 * Tests if Element value or text is a boolean
	 *
	 * @method isBoolean
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isBoolean : function ( obj ) {
		return obj.nodeName === "FORM" ? false : validate.test( {"boolean" : obj.value || element.text( obj )} ).pass;
	},

	/**
	 * Tests if Element value or text is checked
	 *
	 * @method isChecked
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isChecked : function ( obj ) {
		return obj.nodeName !== "INPUT" ? false : element.attr( obj, "checked" );
	},

	/**
	 * Tests if Element value or text is a date
	 *
	 * @method isDate
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isDate : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isDate( obj.value   || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is disabled
	 *
	 * @method isDisabled
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isDisabled: function ( obj ) {
		return obj.nodeName !== "INPUT" ? false : element.attr( obj, "disabled" );
	},

	/**
	 * Tests if Element value or text is a domain
	 *
	 * @method isDomain
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isDomain : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isDomain( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is an email address
	 *
	 * @method isEmail
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isEmail  : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isEmail( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is empty
	 *
	 * @method isEmpty
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isEmpty  : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isEmpty( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is an IP address
	 *
	 * @method isIP
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isIP : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isIP( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is an integer
	 *
	 * @method isInt
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isInt : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isInt( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is numeric
	 *
	 * @method isNumber
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isNumber : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isNumber( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is a phone number
	 *
	 * @method isPhone
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isPhone : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isPhone( obj.value || element.text( obj ) );
	},

	/**
	 * Tests if Element value or text is a URL
	 *
	 * @method isUrl
	 * @memberOf abaaso.element
	 * @param  {object}  obj Element to test
	 * @return {boolean}     Result of test
	 */
	isUrl : function ( obj ) {
		return obj.nodeName === "FORM" ? false : string.isUrl( obj.value || element.text( obj ) );
	},

	/**
	 * Adds or removes a CSS class
	 *
	 * @method klass
	 * @memberOf abaaso.element
	 * @param  {mixed}   obj Element
	 * @param  {string}  arg Class to add or remove ( can be a wildcard )
	 * @param  {boolean} add Boolean to add or remove, defaults to true
	 * @return {object}      Element
	 */
	klass : function ( obj, arg, add ) {
		add = ( add !== false );
		arg = string.explode( arg, " " );

		if ( add ) {
			array.each( arg, function ( i ) {
				obj.classList.add( i );
			});
		}
		else {
			array.each( arg, function ( i ) {
				if ( i !== "*" ) {
					obj.classList.remove( i );
				}
				else {
					array.each( obj.classList, function ( x ) {
						this.remove( x );
					});

					return false;
				}
			});
		}

		return obj;
	},

	/**
	 * Finds the position of an Element
	 *
	 * @method position
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {array}     Coordinates [left, top, right, bottom]
	 */
	position : function ( obj ) {
		obj = obj || document.body;
		var left, top, right, bottom, height, width;

		left   = top = 0;
		width  = obj.offsetWidth;
		height = obj.offsetHeight;

		if ( obj.offsetParent ) {
			top    = obj.offsetTop;
			left   = obj.offsetLeft;

			while ( obj = obj.offsetParent ) {
				left += obj.offsetLeft;
				top  += obj.offsetTop;
			}

			right  = document.body.offsetWidth  - ( left + width );
			bottom = document.body.offsetHeight - ( top  + height );
		}
		else {
			right  = width;
			bottom = height;
		}

		return [left, top, right, bottom];
	},

	/**
	 * Prepends an Element to an Element
	 *
	 * @method prependChild
	 * @memberOf abaaso.element
	 * @param  {object} obj   Element
	 * @param  {object} child Child Element
	 * @return {object}       Element
	 */
	prependChild : function ( obj, child ) {
		return obj.childNodes.length === 0 ? obj.appendChild( child ) : obj.insertBefore( child, obj.childNodes[0] );
	},

	/**
	 * Removes an Element attribute
	 *
	 * @method removeAttr
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj Element
	 * @param  {string} key Attribute name
	 * @return {object}     Element
	 */
	removeAttr : function ( obj, key ) {
		var target;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			obj.removeAttributeNS( obj.namespaceURI, key );
		}
		else {
			if ( obj.nodeName === "SELECT" && key === "selected") {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0];

				if ( target !== undefined ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}
			}
			else {
				obj.removeAttribute( key );
			}
		}

		return obj;
	},

	/**
	 * Scrolls to the position of an Element
	 *
	 * @method scrollTo
	 * @memberOf abaaso.element
	 * @param  {object} obj Element to scroll to
	 * @param  {number} ms  [Optional] Milliseconds to scroll, default is 250, min is 100
	 * @return {object} {@link abaaso.Deferred}
	 */
	scrollTo : function ( obj, ms ) {
		return client.scroll( array.remove( element.position( obj ), 2, 3 ), ms );
	},

	/**
	 * Serializes the elements of an Element
	 *
	 * @method serialize
	 * @memberOf abaaso.element
	 * @param  {object}  obj    Element
	 * @param  {boolean} string [Optional] true if you want a query string, default is false ( JSON )
	 * @param  {boolean} encode [Optional] true if you want to URI encode the value, default is true
	 * @return {mixed}          String or Object
	 */
	serialize : function ( obj, string, encode ) {
		string       = ( string === true );
		encode       = ( encode !== false );
		var children = [],
		    registry = {},
		    result;

		children = obj.nodeName === "FORM" ? ( obj.elements !== undefined ? array.cast( obj.elements ) : obj.find( "button, input, select, textarea" ) ) : [obj];

		array.each( children, function ( i ) {
			if ( i.nodeName === "FORM" ) {
				utility.merge( registry, json.decode( element.serialize( i ) ) );
			}
			else if ( registry[i.name] === undefined ) {
				registry[i.name] = element.val( i );
			}
		});

		if ( !string ) {
			result = json.encode( registry );
		}
		else {
			result = "";

			utility.iterate( registry, function ( v, k ) {
				encode ? result += "&" + encodeURIComponent( k ) + "=" + encodeURIComponent( v ) : result += "&" + k + "=" + v;
			});

			result = result.replace( regex.and, "?" );
		}

		return result;
	},

	/**
	 * Returns the size of the Object
	 *
	 * @method size
	 * @memberOf abaaso.element
	 * @param  {mixed} obj Element
	 * @return {object}    Size {height: n, width:n}
	 */
	size : function ( obj ) {
		return {
			height : obj.offsetHeight + number.parse( obj.style.paddingTop  || 0 ) + number.parse( obj.style.paddingBottom || 0 ) + number.parse( obj.style.borderTop  || 0 ) + number.parse( obj.style.borderBottom || 0 ),
			width  : obj.offsetWidth  + number.parse( obj.style.paddingLeft || 0 ) + number.parse( obj.style.paddingRight  || 0 ) + number.parse( obj.style.borderLeft || 0 ) + number.parse( obj.style.borderRight  || 0 )
		};
	},

	/**
	 * Getter / setter for an Element's text
	 *
	 * @method text
	 * @memberOf abaaso.element
	 * @param  {object} obj Element
	 * @param  {string} arg [Optional] Value to set
	 * @return {object}     Element
	 */
	text : function ( obj, arg ) {
		var key     = obj.textContent !== undefined ? "textContent" : "innerText",
		    payload = {},
		    set     = false;

		if ( typeof arg !== "undefined" ) {
			set          = true;
			payload[key] = arg;
		}

		return set ? element.update( obj, payload ) : obj[key];
	},

	/**
	 * Toggles a CSS class
	 *
	 * @method toggleClass
	 * @memberOf abaaso.element
	 * @param  {object} obj Element, or $ query
	 * @param  {string} arg CSS class to toggle
	 * @return {object}     Element
	 */
	toggleClass : function ( obj, arg ) {
		obj.classList.toggle( arg );

		return obj;
	},

	/**
	 * Updates an Element
	 *
	 * @method update
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj  Element
	 * @param  {object} args Properties to set
	 * @return {object}      Element
	 */
	update : function ( obj, args ) {
		args = args || {};

		utility.iterate( args, function ( v, k ) {
			if ( regex.element_update.test( k ) ) {
				obj[k] = v;
			}
			else if ( k === "class" ) {
				!string.isEmpty( v ) ? element.klass( obj, v ) : element.klass( obj, "*", false );
			}
			else if ( k.indexOf( "data-" ) === 0 ) {
				element.data( obj, k.replace( "data-", "" ), v );
			}
			else if ( k === "id" ) {
				var o = observer.listeners;

				if ( o[obj.id] !== undefined ) {
					o[k] = o[obj.id];
					delete o[obj.id];
				}
			}
			else {
				element.attr ( obj, k, v );
			}
		});

		return obj;
	},

	/**
	 * Gets or sets the value of Element
	 *
	 * @method val
	 * @memberOf abaaso.element
	 * @param  {mixed}  obj   Element
	 * @param  {mixed}  value [Optional] Value to set
	 * @return {object}       Element
	 */
	val : function ( obj, value ) {
		var event = "input",
		    output;

		if ( value === undefined ) {
			if ( regex.radio_checkbox.test( obj.type ) ) {
				if ( string.isEmpty( obj.name ) ) {
					throw new Error( label.error.expectedProperty );
				}

				array.each( utility.dom( "input[name='" + obj.name + "']" ), function ( i ) {
					if ( i.checked ) {
						output = i.value;
						return false;
					}
				});
			}
			else if ( regex.select.test( obj.type ) ) {
				output = obj.options[obj.selectedIndex].value;
			}
			else if ( obj.value ) {
				output = obj.value;
			}
			else {
				output = element.text( obj );
			}

			if ( output !== undefined ) {
				output = utility.coerce( output );
			}

			if ( typeof output === "string" ) {
				output = string.trim( output );
			}
		}
		else {
			value = value.toString();

			if ( regex.radio_checkbox.test( obj.type ) ) {
				event = "click";

				array.each( utility.dom( "input[name='" + obj.name + "']" ), function ( i ) {
					if ( i.value === value ) {
						i.checked = true;
						output = i;
						return false;
					}
				});
			}
			else if ( regex.select.test( obj.type ) ) {
				event = "change";

				array.each( element.find( obj, "> *" ), function ( i ) {
					if ( i.value === value ) {
						i.selected = true;
						output = i;
						return false;
					}
				});
			}
			else {
				obj.value !== undefined ? obj.value = value : element.text( obj, value );
			}

			element.dispatch( obj, event );

			output = obj;
		}

		return output;
	},

	/**
	 * Validates the contents of Element
	 *
	 * @method validate
	 * @memberOf abaaso.element
	 * @param  {object} obj Element to test
	 * @return {object}     Result of test
	 */
	validate : function ( obj ) {
		return obj.nodeName === "FORM" ? validate.test( obj ) : !string.isEmpty( obj.value || element.text( obj ) );
	}
};
