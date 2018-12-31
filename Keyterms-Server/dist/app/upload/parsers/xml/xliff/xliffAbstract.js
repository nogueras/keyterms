/*  * NOTICE  *  */
var inc = require('../../includes');
var log = inc.log;

var xmlParser = require('../xmlAbstract');

try {
	var langCodes = require('../../../../utils/langCodes.json');
}
catch (e) {
	log.error('Failed to load langCodes');
	throw e;
}

// build map for mapping ISO codes
// built here to save memory when a XliffParser is initialized
langCodes = langCodes.languageCodes;
var ISO6391 = {};
Object.keys(langCodes).forEach(code => {
	var isoCode = langCodes[code].ISO6391;
	if (isoCode) {
		ISO6391[isoCode] = code;
	}
});

// NOTE: Abstract Class
class xliffParser extends xmlParser {
	constructor (req, base) {
		super(req, base);

		log.verbose('Initializing xliff Parser...');

		this.ptype = 'xliffParser';
	}

	// converts a ISO-6391 language code to a KeyTerm's language code
	static mapISO (code) {
		return ISO6391[code.slice(0, 2)];
	}

	// Inherited from xmlParser
	// parseFile () {}
	// parse () {}
}

module.exports = xliffParser;
