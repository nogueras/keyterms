/*  * NOTICE  *  */
// Upload Configurations:
var fileTypeMap = {
	json: {
		formats: ['json'],
		hint: 'JSON'
	},
	xls: {
		formats: ['2D', 'simple'],
		hint: 'Excel'
	},
	xliff: {
		formats: ['v2.0', 'v1.2'],
		hint: 'XML Localization Interchange File Format'
	}
};
var fileTypes = Object.keys(fileTypeMap);

exports.formats = {
	fileTypeMap: fileTypeMap,
	fileTypes: fileTypes
};


// Include the Parsers of the various Extensions and Formats listed above
exports.xls = require('./xls');
var xml = require('./xml');		// includes all xml-based extensions
exports.xliff = xml.xliff;
exports.json = require('./json');
