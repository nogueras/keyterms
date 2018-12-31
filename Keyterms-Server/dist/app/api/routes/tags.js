/*  * NOTICE  *  */
'use strict';

var mongoose = require('mongoose');
var log = require('../../utils/logger').logger;
var Tag = mongoose.model('Tag');
var Entry = mongoose.model('Entry');
var $Entry = require('../../db').interfaces.$Entry;

// GET /api/tags/glossaryTag/:content
exports.read = function (req, res, next) {
	Tag.findOne({glossary: req.glossary._id, content: decodeURIComponent(req.params.content)}).lean().exec()
	.then( function (tag) {
		res.json(tag);
	})
	.catch(next);
};

// This is mounted as both Middleware and an Endpoint Handler
// GET /api/tags/findOrCreate/:tag
exports.findOrCreateEP = function(req, res, next) {
    log.debug('find or create tagID');
    Tag.findOrCreateTag(req.params.tag, req.glossary._id)
	.then( function (tagDoc) {
        if (tagDoc) {

        	return res.json(tagDoc);
		}
		else {
			// bad method
			return res.sendStatus(400);
		}
    }).catch(next);
};

exports.findOrCreateParam = function(req, res, next) {
	log.debug('find or create tagID');
	Tag.findOrCreateTag(decodeURIComponent(req.params.tag), req.glossary._id)
	.then( function (tagDoc) {
		req.ktTag = tagDoc;
		return next();
	}).catch(next);
};

exports.validateEntry = function (req, res, next) {
	return $Entry.validateParam(req, res, next, req.body.entryId);
};

// POST /api/tags/addEntry/:tag
exports.addEntryToTag = function(req, res, next) {
	log.debug('Adding entry to tag');
	req.ktTag.addEntryToTag(req.body.entryId)
	.then( function (tag) {
	 	return Entry.findOne({_id: req.body.entryId}).exec()
		.then(function (taggedEntry) {
			if (taggedEntry.tags.indexOf(req.ktTag._id) !== -1) {
				return tag;
			}

			taggedEntry.tags.push(req.ktTag._id);
			return taggedEntry.save();
		})
		.then( function () {
			res.json(tag);
		});

	}).catch(next);
};

// POST /api/tags/removeEntry/:tag
exports.removeEntryFromTag = function(req, res, next) {
    log.debug('removing entry from tagID');
	req.ktTag.removeEntryFromTag(req.body.entryId)
	.then( function (tag) {
		res.json(tag);
	}).catch(next);
};

exports.getAllTags = function(req, res, next) {
    log.debug('Get all Tags');
    Tag.find({entries: {$ne: []}}).then(function(tags) {
        res.json(tags);
    }).catch(next);
};

// GET /api/tags/glossaryTags
exports.getGlossaryTags = function(req, res, next) {
    log.debug('Get Glossary Tags');

	Tag.find({glossary: req.glossary._id, entries: {$ne: []}}).exec() //$ne:[] causes no results to return
 	//Tag.find({glossary: req.glossary._id}).exec()
	.then( function (tagDocs) {

		res.json(tagDocs);
	}).catch(next);
};

// GET /api/tags/search/:tag
exports.searchByTag = function (req, res, next) {
	log.debug('Executing search by Tag');

	//Tag.findOne({content: req.params.tag, glossary: req.glossary._id})
	Tag.populate(req.ktTag, {
		path: 'entries',
		model: 'Entry',
		populate: [
			{
				path: 'terms',
				model: 'Term',
				populate: {
					path: 'createdBy',
					model: 'User',
					select: 'username email fullName'
				}
			},
			{
				path: 'createdBy',
				model: 'User',
				select: 'username email fullName'
			},
			{
				path: 'nominatedBy',
				model: 'User',
				select: 'username email fullName'
			},
			{
				path: 'approvedBy',
				model: 'User',
				select: 'username email fullName'
			},
			{
				path: 'notes.createdBy',
				model: 'User',
				select: 'username email fullName'
			},
			{
				path: 'tags',
				model: 'Tag',
				select: 'content'
			},
			{
				path: 'glossary',
				model: 'Glossary',
				select: 'name abbreviation'
			}
		]
	})
	.then( function (doc) {
		res.json(doc.entries);
	}).catch(next);
};

// GET /api/tags/autocomplete/:text
exports.autocomplete = function (req, res, next) {
	Tag.find({ glossary: req.glossary._id, content: {$regex: req.params.text, $options: 'i'} })
	.then( function (tags) {
		res.json(tags);
	}).catch(next);
};

exports.idParam = function (req, res, next, tagId) {
	Tag.findOne({_id: tagId}).exec()
	.then( function (doc) {
		req.ktTag = doc;
		next();
	}).catch(next);
};

// POST /api/tags/rename/:id
exports.renameTag = function (req, res, next) {
	if (!req.body.newTag || typeof req.body.newTag !== 'string') {
		return next(new Error('Invalid Post Request: Missing field newTag'));
	}

	// Check if the tag's name already exists
	Tag.count({content: req.body.newTag, glossary: req.glossary._id}).exec()
	.then( function (count) {
		if (count === 0) {

			// proceed with new tag name
			return req.ktTag.rename(req.body.newTag);
		}
		else {

			// re-assign all entries with the existing tag instance
			// that matches the new tag name that was submitted
			return Tag.findOne({content: req.body.newTag, glossary: req.glossary._id}).exec()
			.then( function (doc) {
				return req.ktTag.removeOrReplaceFromEntries(doc);
			});
		}
	})
	.then( function (doc) {
		res.json(doc);
	}).catch(next);
};

// DELETE /api/tags/del/:id
exports.deleteTag = function (req, res, next) {
	req.ktTag.removeOrReplaceFromEntries()
	.then( function (doc) {
		return doc.remove();
	})
	.then( function () {
		res.sendStatus(204);
	}).catch(next);
};
