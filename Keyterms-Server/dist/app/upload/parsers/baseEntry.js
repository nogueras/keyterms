/*  * NOTICE  *  */
var SCHEMA_VERSION = require('../../utils/system').SchemaVersion;

var entryBase = {
	terms: [],
	termLinks: [],
	tags: [],
	notes: [],
	editScope: 'glossary',
	schemaVersion: SCHEMA_VERSION,
	type: 'term'
};

module.exports = entryBase;
