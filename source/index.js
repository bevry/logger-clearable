'use strict'

const readline = require('readline')

/**
 * This is the callback used to add a log message to the queue, it should return a string, or null if no update is needed
 * @callback logCallback
 * @returns {string?}
 * @public
 */

/**
 * @typedef {Object} Options
 * @property {stream.Writable} [stream] where to write the clearable logs to, defaults to `process.stdout`
 * @public
 */

/**
 * Create a new Logger instance, which you will write your clearable logs to
 * @class
 * @constructor
 * @param {Options} [opts]
 * @public
 */
class Logger {
	constructor ({ stream = process.stdout } = {}) {
		this.message = null
		this.timer = null
		this.stream = stream
	}

	/**
	Creates and returns a new instance of the current class
	@param {...*} args - the arguments to be forwarded along to the constructor
	@return {Logger}
	@static
	@public
	*/
	static create (...args) {
		return new this(...args)
	}

	/**
	 * Queue a log message via a callback
	 * @param {logCallback} log
	 * @returns {Logger}
	 * @chainable
	 * @public
	 */
	queue (log) {
		this.discard()
		this.timer = setImmediate(() => {
			const message = log()
			if (message != null) {
				this.clear()
				this.message = message.endsWith('\n') ? message : (message + '\n')
				this.stream.write(this.message)
			}
		})
		return this
	}

	/**
	 * Add a message to the queue
	 * @param {string} message
	 * @returns {Logger}
	 * @chainable
	 * @public
	 */
	log (message) {
		this.queue(() => message)
		return this
	}

	/**
	 * Clear the logger
	 * @returns {Logger}
	 * @chainable
	 * @public
	 */
	clear () {
		if (this.message) {
			const lines = (this.message || '').split('\n').length
			const dy = (lines - 1) * -1
			readline.moveCursor(this.stream, 0, dy)
			readline.clearScreenDown(this.stream)
			readline.clearLine(this.stream, 0)
			this.message = null
		}
		return this
	}

	/**
	 * Discard any queued logs
	 * @returns {Logger}
	 * @chainable
	 * @public
	 */
	discard () {
		if (this.timer) {
			clearImmediate(this.timer)
			this.timer = null
		}
		return this
	}
}

module.exports = Logger
