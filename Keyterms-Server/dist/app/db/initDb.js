/*  * NOTICE  *  */
var mongoose = require('mongoose');
var Promise = require('bluebird');

mongoose.Promise = require('bluebird');

var log = require('../utils/logger').logger;

var config = {};
if (/test/i.test(process.env.NODE_ENV)) {
	config = require('../../test/testConfig').db;
} else {
	config = require('../../config').db;
}

//var mongoUri = "mongodb://" + config.host + ":" + config.port + "/" + config.db;
var mongoUri = `mongodb://${config.secured ? config.user + ':' + config.pass + '@' : ''}${config.host}:${config.port}/${config.db}`;
//var conn = mongoose.createConnection(mongoUri);

var defaultOptions = {
	performCheck: true
};

var initDb = function (_options) {

	return new Promise( function (resolve, reject) {
		mongoose.connect(mongoUri);

		var options = _options || defaultOptions;

		mongoose.connection.once('open', function () {
			log.info('Mongo connection established to: ' + mongoUri);

			if (!options.performCheck) { return resolve(true); }

			var requiredCollections = ['entries', 'nominations', 'glossaries', 'sessions', 'terms', 'tags', 'users'];

			log.info('Checking for required collections');

			mongoose.connection.db.listCollections().toArray( function(err, collections) {
				if (err) {
					log.error('ERROR: Could not retrieve collection list from Mongo');
					process.exit();
				}

				collections = collections.map(c => c.name);
				var warnings = 0;
				for (let requiredColl of requiredCollections) {
					log.info('Verifying collection: ' + requiredColl);

					if (collections.indexOf(requiredColl) === -1) {
						log.warn('Was unable to locate collection: ' + requiredColl);
						warnings++;
						//process.exit();
					}
				}

				if (warnings > 0) { log.warn('If this is a fresh install, you can ignore collection warnings'); }

				// if for loop is exited, all collections exist
				log.info('All required collections verified');
				resolve(true);
			});
		});

		// Checks for initial mongo connection failure and prints a pretty error message
		mongoose.connection.on('error', function (err) {
			if (/failed to connect to server \[(.*)\] on first connect/.test(err.message)) {
				log.error(`Could not establish connection to mongo db [${ mongoUri }]. Exiting...`);
				process.exit();
			}
			else {
				console.log('Connection error...');
				reject(err);
			}
		});
	});
};

module.exports = initDb;
