/**
 * Channel factory
 *
 * @method channel
 * @memberOf abaaso
 * @return {Object} {@link abaaso.Channel}
 */
var channel = function () {
	return new Channel();
};

/**
 * Creates a new Channel
 *
 * @constructor
 * @memberOf abaaso
 */
function Channel () {
	this.queue = [];
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @private
 * @memberOf abaaso.Channel
 * @type {Function}
 */
Channel.prototype.constructor = Channel;

/**
 * Puts an item into the Channel
 *
 * @method put
 * @memberOf abaaso.Channel
 * @param  {Mixed} arg Item
 * @return {Object} {@link abaaso.Deferred}
 */
Channel.prototype.put = function ( arg ) {
	var defer = deferred();

	if ( this.queue.length === 0 ) {
		this.queue.push( arg );

		defer.resolve( ["continue", null] );
	}
	else {
		defer.resolve( ["pause", null] );
	}

	return defer;
};

/**
 * Takes an item from the Channel
 *
 * @method take
 * @memberOf abaaso.Channel
 * @return {Object} {@link abaaso.Deferred}
 */
Channel.prototype.take = function () {
	var defer = deferred();

	if ( this.queue.length === 0 ) {
		defer.resolve( ["pause", null] );
	}
	else {
		defer.resolve( ["continue", this.queue.pop()] );
	}

	return defer;
};