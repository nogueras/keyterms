/*  * NOTICE  *  */
var mongoose = require('mongoose');

var enums = require('../../utils/enums');
var BaseSchema = require('./base-schema');

/* eslint-disable key-spacing, comma-style */
var noteSchema = BaseSchema.extendSchema({
	text: 					{type: String, trim: true, required: true}
	, type: 				{type: String, enum: enums.noteTypes}
});
/* eslint-enable key-spacing, comma-style */

//noteSchema.set('autoIndex', true);

exports.NoteSchema = noteSchema;
exports.Note = mongoose.model('Note', noteSchema);
