/*  * NOTICE  *  */
var Promise = require('bluebird');
var mongoose = require('mongoose');

var enums = require('../../utils/enums');
var LANG_CODES = require('../../utils/langCodes.json').languageCodes;

var BaseSchema = require('./base-schema');
var Schema = mongoose.Schema;
var noteSchema = mongoose.model('Note').schema;

/* eslint-disable key-spacing, comma-style, object-property-newline */
var deltaSchema = new Schema({
	terms: {
		add: [], del: [], modDel: [],
		mod: {type: Schema.Types.Mixed, default: {}}
	},
	termLinks: {
		add: [], del: []
	},
	tags: {
		add: [], del: []
	},
	notes: {
		add: [], del: []
	},
	entry: {type: Schema.Types.Mixed, default: {}}
}, { minimize: false });

var nominationSchema = BaseSchema.extendSchema({
	type:				{type: String, required: true, enum: enums.nominationTypes},
	originalEntry:		{type: Schema.Types.ObjectId, ref: 'Entry'},
	// TODO: re-evalute if the data field should be Type entrySchema although
	// TODO: it currently causes errors with creating Entries from this data
	data:				Schema.Types.Mixed,
	notes:				[noteSchema],
	delta:				deltaSchema,
	comments:			{type: String}
});
/* eslint-enable key-spacing, comma-style, object-property-newline */

nominationSchema.pre('save', function (next) {
	var self = this;

	if (this.type === 'mod' && !!this.originalEntry) {
		mongoose.model('Entry').findAndPopulateForGui({_id: self.originalEntry}, false)
		.then( function (current) {
			// findAndPopulateForGui returns potentially multiple Entries, therefore
			// use index 0, since the query will return in a array of length 1
			self.delta = current[0].calcDelta(self.data);
			next();
		});
	}
	else {
		next();
	}

	// next();
});

var buildEntryMap = function (items, getKey) {
	var map = {};

	items.forEach( function (item) {
		var key = getKey(item);
		map[key] = item;
	});

	return map;
};

var cleanDups = function (items, cmp) {
	items.forEach( function (item, index) {
		if (cmp(item)) {
			items.splice(index, 1);
		}
	});

	return items;
};

// validates the nomination's delta against the current version of the Entry
nominationSchema.methods.compareSnapshot = function () {
	var self = this;

	if (self.type === 'mod' && !!self.delta) {
		return mongoose.model('Entry').findAndPopulateForGui({_id: self.originalEntry})
		.then( function (entry) {
			entry = entry[0];

			var delta = self.delta;

			// build the maps to detect dupes
			var termMap = buildEntryMap(entry.terms, term => `${term.termText}.${term.langCode}`);
			var linkMap = buildEntryMap(entry.termLinks, link => `${link.lhs.termText}.${link.rhs.termText}.${link.relationType}`);
			var tagMap = buildEntryMap(entry.tags, tag => tag.content);

			// remove all the dupes from the delta object
			delta.terms.add = cleanDups(delta.terms.add, (t) => t._id in termMap);
			delta.termLinks.add = cleanDups(delta.termLinks.add, (l) => l._id in linkMap);
			delta.tags.add = cleanDups(delta.tags.add, (t) => t.content in tagMap);

			// mongooose/mongo will not store object if they are empty, therefore check for that
			if (!!delta.terms.mod) {
				// check for modDels
				delta.modDel = [];
				var deltaTermMap = buildEntryMap(delta.terms.del, t => t._id || t);
				Object.keys(delta.terms.mod).forEach( function (entryId) {
					var update = delta.terms.mod[entryId];
					var key = `${update.termText}.${update.langCode}`;
					if (key in deltaTermMap) {
						// this signifies the delta contains an update for a term that has since been deleted
						var modDel = {};
						modDel.original = entry.toObject();
						modDel.mod = update;
						delta.terms.mod[entryId] = undefined;
						delta.modDel.push(modDel);
					}
				});
			}

			// TODO: check for link target existence

			var nom = self.toObject();
			nom.delta = delta;
			return nom;
		});
	}
	else {
		return Promise.resolve(self);
	}
};

nominationSchema.methods.populateDelta = function () {
	return this.compareSnapshot()
	.then( function (nom) {

		// console.log(JSON.stringify(nom, null, 4));

		if (nom.type === 'mod' && !!nom.delta) {
			var delta = nom.delta;

			var linkIdMap = {};
			nom.data.terms.forEach( function (t) {
				linkIdMap[t._id || t.uuid] = t;
			});

			// populate links within the delta
			delta.termLinks.add.forEach( function (link) {
				link.lhs = Object.assign({}, linkIdMap[link.lhs]);
				var lhsCode = link.lhs.langCode;
				// console.log('lhsCode: ', lhsCode);
				link.lhs.langCode = LANG_CODES[lhsCode];
				// console.log('LANG_COE: ', LANG_CODES[lhsCode]);
				link.lhs.langCode.value = lhsCode;

				link.rhs = Object.assign({}, linkIdMap[link.rhs]);
				var rhsCode = link.rhs.langCode;
				// console.log('rhsCode: ', rhsCode);
				link.rhs.langCode = LANG_CODES[rhsCode];
				// console.log('LANG_COE: ', LANG_CODES[rhsCode]);
				link.rhs.langCode.value = rhsCode;
			});

			// populate term lang codes
			delta.terms.add.forEach( function (term) {
				var code = term.langCode;
				term.langCode = LANG_CODES[term.langCode];
				term.langCode.value = code;
			});

			delta.notes.add.forEach( function (note) {
				note.type = enums.noteTypesINFO[enums.noteTypes.indexOf(note.type)];
			});

			// populate viewScope & editScope
			delta.entry.viewScope = enums.viewScopeTypesINFO[enums.viewScopeTypes.indexOf(delta.entry.viewScope)];
			delta.entry.editScope = enums.editScopeTypesINFO[enums.editScopeTypes.indexOf(delta.entry.editScope)];
		}

		return nom;
	});
};

//nominationSchema.set('autoIndex', true);
exports.Nomination = mongoose.model('Nomination', nominationSchema);
