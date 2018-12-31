/*  * NOTICE  *  */
'use strict';

var mongoose = require('mongoose');

var BaseSchema = require('./base-schema');
var noteSchema = require('./note').NoteSchema;

var enums = require('../../utils/enums');

/* eslint-disable key-spacing, comma-style */
var termSchema = BaseSchema.extendSchema({
	langCode: 				{type: String, trim: true, required: true, lowercase: true}
	, termText:				{type: String, trim: true, required: true}
	, isLabel: 				{type: Boolean, default: false}
	, preferenceOrder: 		{type: Number, default: 0}
	, modificationDate: 	{type: Date, default: Date.now}
	, status:				{type: String, enum: enums.statuses}
	, script:				{type: String}
	, isSrcScript:			{type: Boolean, default: false}
	, variety:				{type: String}
	, originalText:			{type: String}
	, indexText:			{type: String}
	, tokenization:			[{type: String}]
	, src:					{type: String, enum: enums.entrySources, default: () => 'user'}
	, notes:				[noteSchema]
});
/* eslint-enable key-spacing, comma-style */

//termSchema.set('autoIndex', true);

// Updates mod date per save
termSchema.pre('save', function (next) {
	this.modificationDate = Date.now();

	// Loop through all notes, if there's no 'created by' value steal it from the 'nominatedBy'
	this.notes.forEach(function (note) {
		note.createdBy = !!note.createdBy ? note.createdBy : note.nominatedBy;
	});
	next();
});

termSchema.methods.isRawEqual = function (raw) {
	return (this.termText !== raw.termText || this.langCode !== raw.langCode);
};

termSchema.statics.DELTA_FIELDS = ['termText', 'langCode', 'isLabel', 'variety'];

exports.termSchema = termSchema; // needed for Entry model
exports.Term = mongoose.model('Term', termSchema);
