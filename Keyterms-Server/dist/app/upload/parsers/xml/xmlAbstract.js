/*  * NOTICE  *  */
var xml2js = require('xml2js');

var ImporterBase = require('../importerBase');
var inc = require('../includes');
var Promise = inc.Promise;
var log = inc.log;

// NOTE: Abstract Class
class xmlParser extends ImporterBase {
	constructor (req, base) {
		super(req.glossary, base);

		log.verbose('Initializing xml Parser...');

		this.ptype = 'xmlParser';
		this.xml2js = new xml2js.Parser();

		// This returns a Promise, this.file.then() will have access to the file's data
		this.file = ImporterBase.readInFile(req.filePath);
	}

	// callback returns a promise for signaling when the file has been parsed completely
	parseFile (callback) {
		if (!callback) {
			throw new Error(`callback param is required in ${this.ptype}.parseFile`);
		}

		var self = this;

		// this.fileRead is a Promise returned by ImporterBase.__readInFile
		return this.file.then( function (fileAsStr) {
			// Wraps xml2js.Parser().parseString in a Promise
			return new Promise( function (resolve, reject) {
				// Performs xml parsing of the file data stored in this._fileRead via xml2js.Parser
				self.xml2js.parseString(fileAsStr, function (err, parsedData) {
					if (err) { return reject(err); }

					// resolves the parsed xml
					return resolve(parsedData);
				});
			});
		})
		.then( function (data) {
			// do things with the parsed xml. This callback is expected to return a Promise
			return callback(data);
		})
		.then( function () {
			log.info(`${self.ptype} parsing complete`);
			return self.errors;
		});
	}

	parse () {
		// ensure to wait to parse until file has been read in via this._fileRead
		throw new Error(`${this.ptype} is meant to be an abstract class`);
	}
}

module.exports = xmlParser;
