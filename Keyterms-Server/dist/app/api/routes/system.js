/*  * NOTICE  *  */
var mongoose = require('mongoose');
var Promise = require('bluebird');

var enums = require('../../utils/enums');
var sys = require('../../utils/system');

var log = require('../../utils/logger').logger;

// Redirects the path "/api/api" to the docs page
exports.legacyApi = (req, res) => res.redirect('/docs');

// GET /api/status
exports.status = function (req, res, next) {
	Promise.all([
		getVersion(),
		mongoose.model('Entry').count(),
		sys.getKeyTermsVersion()
	])
	.then( function (data) {
		res.json({
			keyTermsVersion: data[2],					// corresponds to the currently running git commit
			APIVersion: '0.1.0',						// corresponds to the currently running db/api schema
			mongoDbVersion: data[0],
			mode: process.env.NODE_ENV || 'DEVELOPMENT',
			keyTermsEntries: data[1]
		});
	}).catch(next);
};

// (http://stackoverflow.com/questions/15311305/how-to-get-mongodb-version-from-mongoose)
// mongoose.mongo.Admin is a native Mongo instance, therefore does not use Promise hooks
// therefore this function is promisified to maintain async handling consistency
var getVersion = function () {
	return new Promise( function (resolve, reject) {
		var admin = new mongoose.mongo.Admin(mongoose.connection.db);
		admin.buildInfo( function (err, info) {
			if (!err) {
				resolve(info.version);
			} else {
				log.error('Error in Mongo getVersion call - /api/routes/system.js');
				reject(err);
			}
		});
	});
};

// GET /api/version  - Dynamically renders JSON
// representation of the Entry schema object (with references expanded)
exports.schema = function (req, res) {
	var entrySchema = mongoose.model('Entry').schema;

	var versionMap = createSchemaMapping(entrySchema.paths);

	res.json(versionMap);
};

// Recursive function for building a JSON representation of our collection schemas
// Note (8/1/2016): This function is not perfect, could use another pass
var createSchemaMapping = function (paths) {
	if (!paths) {
		return 'UNKNOWN';
	}

	var versionMap = {};

	Object.keys(paths).forEach( function (key) {
		if (key.slice(0, 2) === '__') {
			// skip native mongoose elements
			return;
		}

		var field = paths[key];
		var value = field.instance;

		if (field.enumValues && field.enumValues.length > 0) {
			value = 'Enum - (' + field.enumValues.join(', ') + ')';
			value = value.replace('(,', '(<empty_string>,');
		}
		else if (field.instance === 'ObjectID') {
			if (field.options.ref) {
                value += " (References:  '" + field.options.ref + "')";
            }
			else if (field.options.auto) {
				value += ' (Key - Auto Indexed)';
			}
		}
		else if (field.instance === 'Boolean') {
			if (field.options.default) {
				value += ' (Default: ' + field.options.default + ')';
			}
		}
		else if (field.instance === 'Array') {
			var subPath = field.options.type[0].paths;
			if (field.caster.instance) {
				// if Array of a base type
				value = [field.caster.instance];
			}
			else if (!subPath) {
				// if Array of a nested object (not a defined schema)
				value = [{}];
				Object.keys(field.options.type[0]).forEach( innerKey => {
					value[0][innerKey] = 'String';
				});
			}
			else {
				// must be Array of a schema objects
				value = [createSchemaMapping(subPath)];
			}
		}
		else if (value === {}) {
			value = 'BROKEN';
		}
		versionMap[key] = value;
	});

	return versionMap;
};

// GET /api/enums - returns list of enums objects for various enum fields defined in the db schemas
exports.enums = function (req, res) {
	res.json({
		'objectsStatuses': enums.statusesINFO, 		// status field for all KeyTerms objects
		'entryTypes': enums.entryTypesINFO,			// type field for Entry objects
		'noteTypes': enums.noteTypesINFO,			// type field for Note objects
		'orthographyTypes': enums.orthTypesINFO,	// orthographyType for Term objects
		'nominationTypes': enums.nominationTypeINFO,
		'viewScopeTypes': enums.viewScopeTypesINFO,
		'editScopeTypes': enums.editScopeTypesINFO,
		'supportedFileTypes': enums.supportedFileTypeINFO
	});
};
