/*  * NOTICE  *  */
var winston = require('winston');
require('winston-daily-rotate-file');

// Winston log levels via winston documentation:
// error=0, warn=1, info=2, verbose=3, debug=4, silly=5

var logger;

if (process.env.NODE_ENV && process.env.NODE_ENV === 'TEST') {
	var logConfig = require('../../test/testConfig').logSetup;

	logger = new (winston.Logger)({
		transports: [
			new (winston.transports.File)(logConfig)
		]
	});
}
else {
	var config = require('../../config');

	if (config.enableLogFile) {
		logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)(config.logSetup),
				new (winston.transports.DailyRotateFile)(config.logFileSetup)
			]
		});
	}
	else {
		logger = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)(config.logSetup)
			]
		});
	}
}

if (process.env.NODE_ENV && process.env.NODE_ENV.match(/prod/i)) {
	logger.debug = function (){};
	logger.silly = function (){};
}

module.exports = {
	logger: logger,
	stream: {
		write: message => logger.info(message)
	}
};
