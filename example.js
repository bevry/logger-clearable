'use strict'

// create our clearable logger
const logger = require('./').create()
const method = 'log'

// log the date every second
const timer = setInterval(function () {
	if (method === 'log') {
		const date = new Date()
		const time = date.toISOString()
		logger.log(time)
	}
	else {
		// the above will actually call: logger.queue(() => time)
		// instead, we can use queue directly:
		// using queue direclty is more performant as
		// any setup for our particular message will happen only if that message will be written
		// this is applicable as logger won't bother writing messages that would be cleared instantly
		// e.g. logger.log('hello').log('world') would otherwise write 'hello' then have to clear it right away
		// instead, logger just skips writing 'hello' and will just write 'world'
		logger.queue(function () {
			const date = new Date()
			const time = date.toISOString()
			return time
		})
	}
}, 100)

// on ctrl+c close the timer and discard any upcoming logs
process.on('SIGINT', () => {
	// stop any more calls to logger
	clearInterval(timer)
	// discard any logger queued updated
	logger.discard()
	// and clear the log
	logger.clear()
})
