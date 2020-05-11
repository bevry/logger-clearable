'use strict'

const Logger = require('./')
const { equal } = require('assert-helpers')
const kava = require('kava')
const { PassThrough } = require('stream')

kava.suite('logger-clearable', function (suite, test) {
	suite('options', function (suite, test) {
		test('defaults', function () {
			const logger = new Logger()
			equal(logger.stream, process.stdout, 'stdout is the default')
		})
		test('ovewrite strean', function () {
			const logger = new Logger({ stream: process.stderr })
			equal(logger.stream, process.stderr, 'stderr became the stream')
		})
	})
	test('works', function (complete) {
		const stream = new PassThrough()
		let data = ''

		stream.on('data', (chunk) => {
			data += chunk.toString()
		})
		stream.on('end', function () {
			equal(
				data,
				['b', 'c', 'd']
					.map((log) => log + '\n')
					.join('\u001b[1A\u001b[0J\u001b[2K')
			)
			complete()
		})

		const logger = new Logger({ stream })

		logger.log('a')
		logger.log('b')

		setTimeout(() => {
			logger.log('c')
		}, 100)
		setTimeout(() => {
			logger.log('d')
		}, 200)

		setTimeout(() => {
			stream.end()
		}, 300)
	})
})
