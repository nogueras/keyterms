/*  * NOTICE  *  */
'use strict';

var log = require('../utils/logger').logger;

var mongoose = require('mongoose');
var Glossary = mongoose.model('Glossary');

exports.ensureAdmin = function(req, res, next) {
	// ensure authenticated user exists with admin role,
	// otherwise send 401 response status
	if (req.user && req.user.isAdmin) {
		return next();
	} else {
		log.warn('ensureAdmin threw 403');
		return res.sendStatus(403);
	}
};

exports.ensureGlossaryAdmin = function(req, res, next){
	//check the Glossary to see if the user is an admin
	if(req.glossary.admins.indexOf(req.user._id) > -1){
		return next();
	}
	else{
		log.warn('ensureGlossaryAdmin threw 403');
		return res.sendStatus(403);
	}
};

exports.ensureGlossaryQc = function(req, res, next){

	if(req.glossary.qcs.indexOf(req.user._id) > -1){
		return next();
	}
	else{
		log.warn('ensureGlossaryQc threw 403');
		return res.sendStatus(403);
	}
};

exports.ensureSysAdminOrGlossaryAdmin = function (req, res, next) {
	// Check if sys admin
	if (!!req.user && req.user.isAdmin) {
        return next();
    }
	// check if glossary admin
	else if (req.glossary.admins.indexOf(req.user._id) > -1) {
        return next();
    }
	else {
        return res.sendStatus(403);
    }
};

exports.ensureQcOfAny = function (req, res, next) {
	Glossary.find({_id: {$in: req.user.glossaries}}).select('name abbreviation qcs').exec()
	.then( function (glossaryDocs) {
		var isQC = false;
		var qcOf = [];

		for (let glossary of glossaryDocs) {

			if (glossary.qcs.indexOf(req.user._id) !== -1) {
				isQC = true;
				qcOf.push(glossary);
			}
		}

		if (isQC) {

			req.qcOf = qcOf;
			return next();
		}
		else {
			return res.sendStatus(403);
		}
	})
	.catch(next);
};
