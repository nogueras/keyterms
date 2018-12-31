/*  * NOTICE  *  */
var initDb = require('./initDb');

// ORDER MATTERS HERE
var glossary = require('./schemas/glossary');
var termModels = require('./schemas/term');
var tagModel = require('./schemas/tag');
// Place all Entry's dependencies above this comment
var entryModels = require('./schemas/entry');
var nominationModel = require('./schemas/nomination');
var userModel = require('./schemas/user');
//Put schemas above this line and interfaces below.

var interfaces = require('./interfaces/index');


// If adding a new schema don't forget to ensure that the collection exists in the initDB script.
var models = {
	Glossary: glossary.Glossary,
	Tag: tagModel.Tag,
	Term: termModels.Term,
	Note: entryModels.Note,
	Image: entryModels.Image,
	TermLink: entryModels.TermLink,
	Entry: entryModels.Entry,
	User: userModel,
	Nomination: nominationModel.Nomination
};

module.exports = {
	models: models,
	interfaces: interfaces,
	init: initDb
};

// https://scalegrid.io/blog/getting-started-with-mongodb-and-mongoose/
