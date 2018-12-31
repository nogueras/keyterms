/*  * NOTICE  *  */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

/* eslint-disable key-spacing, comma-style */
var tagSchema = new Schema({
	glossary: {type: Schema.Types.ObjectId, ref: 'Glossary', required: true},
    content: {type: String, required: true},
    entries: [{type: Schema.Types.ObjectId, ref: 'Entry'}]
});
/* eslint-enable key-spacing, comma-style */

tagSchema.methods.addEntryToTag = function (entryId) {
	if (this.entries.indexOf(entryId) !== -1) {
		return Promise.resolve(this);
	}

	// else
	this.entries.push(entryId);
	return this.save();
};

tagSchema.methods.removeEntryFromTag = function (entryId) {
	if (this.entries.indexOf(entryId) === -1) {
		return Promise.resolve(this);
	}
	this.entries.pull(entryId);
	return this.save();
};

tagSchema.methods.rename = function (newTag) {
	newTag = normalizeTag(newTag);
	this.content = newTag;
	return this.save();
};

tagSchema.methods.removeOrReplaceFromEntries = function (replacementDoc) {
	var thisTag = this;
	// slice is used to create a swallow copy of the array
	var theseEntries = this.entries.slice();
	var replacementId = (replacementDoc === undefined) ? null : replacementDoc._id;

	// get all the Entry docs that are tagged with this tag
	return mongoose.model('Entry').find({
		_id: { $in: thisTag.entries }
	})
	.exec()
	.then( function (entryDocs) {
		// Removes this tag from all Entries that are currently tagged with
		// this tag OR "replaces" this tag on all Entries, which are tagged
		// with this tag, with a new tag
		return Promise.map(entryDocs, function (entryDoc) {
			return entryDoc.removeOrReplaceTag(thisTag._id, replacementId);
		});
	})
	.then( function () {
		// removes all Entry references from this tag
		thisTag.entries = [];
		return thisTag.save();
	})
	.then( function (tagDoc) {
		// determines whether the operation was a replacement or a removal
		// IF REPLACEMENT: concats the tag.entries list of the replacement tag
		// 		with the tag.entries list of this tag and returns the replacement
		//		tag document (with the updated entries list)
		// IF REMOVAL: returns this tag document (with an empty entries list)
		if (!!replacementId) {
			// Set object is used to prevent duplicates
			var temp = new Set(replacementDoc.entries);
			theseEntries.forEach( function (entryRef) {
				temp.add(entryRef);
			});
			replacementDoc.entries = Array.from(temp);
			return replacementDoc.save();
		}
		else {
			return tagDoc;
		}
	});
};

tagSchema.statics.findOrCreateTag = function (tag, glossaryId) {
	var Tag = this;
    tag = normalizeTag(tag);
	return Tag.findOne({content: tag, glossary: glossaryId}).exec()
	.then( function (tagDoc) {
		if (tagDoc == null) {

			return Tag.create({content: tag, glossary: glossaryId});
		}else {
            return tagDoc;
        }
	});
};

var normalizeTag = function(tag) {
	//TAG normalize logic here. String trimming, etc

	//makes tag lowercase and removes leading and trailing whitespace
	tag = tag.toLocaleLowerCase().trim();

	//removes any leading or trailing punctuation
	tag = tag.replace(/(^[^a-zA-Z0-9]+)|([^a-zA-Z0-9]+$)/g, '');

	//replaces em-dashes with regular -
    tag = tag.replace(/\u2013|\u2014/g, "-");

	//removes whitespaces around hyphens
    tag = tag.replace(/(\s*\-\s*)+/, '-');

	//removes whitespaces aroung underscores
    tag = tag.replace(/(\s*\_\s*)+/, '_');

    //replaces consecutive whitespaces with one whitespace
	tag = tag.replace(/(\s{2})+/, ' ');

	//removes nonprintable, nonspacing characters
	tag = tag.replace(/([^ -~]+)/g, '');

    return tag;
};

exports.tagSchema = tagSchema;
exports.Tag = mongoose.model('Tag', tagSchema);
