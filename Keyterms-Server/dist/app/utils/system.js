/*  * NOTICE  *  */
var git = require('git-rev-sync');
var fs = require('fs');
var path = require('path');
var elastic = require('./elasticSearch');
var log = require('./logger').logger;

var SCHEMA_VERSION = '3.1.0';

// returns the date when the current git commit was committed
var getLastCommitDate = function () {
	return new Date(git.date()).toISOString().slice(0, 10).replace(/-/g, '');
};

var storeVersion = function (version) {
	var fileName = path.join(__dirname, './serverInfo.json');
	var file = require('./serverInfo.json');

	file.keyTermsVersion = version;

	fs.writeFileSync(fileName, JSON.stringify(file, null, 4));
};

exports.getKeyTermsVersion = function () {
	try {
		var hash = git.short();
		var commitDate = getLastCommitDate();

		var versionStr = `3.${ commitDate }-${ hash }`;

		try {
			storeVersion(versionStr);
		} catch (e) {
			// do nothing - but don't interrupt execution
		}

		return versionStr;
	}
	catch (err) {
		// if git is not available, use the serverInfo.json file
		try {
			var file = require('./serverInfo.json');
		}
		catch (e) {
			if (e.message === "Cannot find module './serverInfo.json'") {
				return '3.x.x-UNKNOWN';
			}
		}

		return file.keyTermsVersion;
	}
};

exports.testElasticConnection = function () {
	var PING_INTERVAL = 1000 * 45;	// 45 seconds

	return elastic.ping()
	.then( function () {
		log.verbose('Verified ElasticSearch connection...');
	})
	.catch( function () {
		log.warn('Unable to connection to ElasticSearch...');
	})
	.then( function () {
		return setInterval( function () {
			elastic.ping()
			.catch( function () {
				log.warn('Unable to connection to ElasticSearch...');
			});
		}, PING_INTERVAL);
	});
};

exports.verifyIndexTemplate = function () {
	log.verbose('Verifying index template exists...');
	return elastic.termIndexTemplate.exists()
	.then( function (exists) {
		if (!exists) {
			log.warn('No index template found, attempting to create...');
			return elastic.termIndexTemplate.set();
		}

		return true;
	})
	.then( function (existed) {
		if (existed !== true) {
			log.verbose('Index template was successfully created');
		}

		return true;
	})
	.catch( function (err) {
		log.warn('Unable to create Index template');

		throw err;
	});
};

exports.SchemaVersion = SCHEMA_VERSION;
