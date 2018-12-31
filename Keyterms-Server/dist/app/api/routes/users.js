/*  * NOTICE  *  */
var mongoose = require('mongoose');

var log = require('../../utils/logger').logger;
var User = mongoose.model('User');

// POST /api/user/create
exports.create = function (req, res, next) {
	User.create(req.body)
	.then( function (user) {

		res.status(201).json(user);
	})
	.catch( function (err) {
		if (!!err.code && err.code === 11000) {
			log.error('That username already exists!');
			res.sendStatus(409);
		}
		else {
			err.status = 400;
			next(err);
		}
	});
};

exports.idParam = function (req, res, next, id) {
	User.findOne({_id: id}).exec()
	.then( function (user) {

		if (!user) { return res.sendStatus(404); }

		// update the req.params field
		req.userDoc = user;
		next();
	})
	.catch(next);
};

// GET /api/user/u/:id
exports.read = function (req, res, next) {
	req.userDoc.populate({
		path: 'glossaries',
		model: 'Glossary',
		select: 'name abbreviation admins qcs langList'
	}).execPopulate()
	.then( function (user) {
		res.json(user);
	})
	.catch(next);
};

// POST /api/user/u/:id
exports.update = function (req, res, next) {
	if ( (req.userDoc.isDeactivated !== req.body.isDeactivated) && (req.user._id.toString() === req.body._id) ) {
		// user is trying to deactivate themselves, prevent this
		return res.sendStatus(400);
	}

	Object.assign(req.userDoc, req.body);

	req.userDoc.save()
	.then( function (user) {
		res.json(user);
	})
	.catch( function (err) {
		if (!!err.code && err.code === 11000) {
			log.error('That username already exists!');
			res.sendStatus(409);
		}
		else {
			next(err);
		}
	});
};

// DELETE /api/user/u/:id
exports.delete = function (req, res, next) {
	req.userDoc.remove()
	.then( function () {
		res.sendStatus(204);
	})
	.catch(next);
};

// POST /api/user/defaultGlossary/:glossary
exports.updateDefaultGlossary = function (req, res, next) {
	var glossaryId = req.params.glossary === 'false' ? null : req.params.glossary;

	req.user.updateDefaultGlossary(glossaryId)
		.then(function (user) {
			return user.populate({
				path: 'glossaries',
				model: 'Glossary',
				select: 'name langList'
			}).execPopulate();
		})
		.then(function (user) {
			res.json(user);
		})
		.catch(function (err) {
			if (!!err.notAMember) {
				log.error(`User is not a member of target Glossary [${glossaryId}]`);
				res.sendStatus(400);
			}
			else {
				next(err);
			}
		});
};

// POST /api/user/activeGlossary/:glossary
exports.switchActiveGlossary = function (req, res, next) {
	req.user.switchActiveGlossary(req.params.glossary)
	.then(function(user){
        return user.populate({
            path: 'glossaries',
            model: 'Glossary',
            select: 'name langList'
        }).execPopulate();
	})
	.then( function (user) {
		res.json(user);
	})
	.catch( function (err) {
		if (!!err.notAMember) {
			log.error(`User is not a member of target Glossary [${req.params.glossary}]`);
			res.sendStatus(400);
		}
		else {
			next(err);
		}
	});
};

// POST /api/user/password-check/:id
exports.checkAndChangePassword = function (req, res, next) {
	req.userDoc.comparePassword(req.body.old)
	.then( function(isMatch) {
		if (isMatch) {
			req.userDoc.changePassword(req.body.new)
			.then( function () {
				res.sendStatus(200);
			});
		} else {
			res.sendStatus(400);
		}
	})
	.catch(next);
};

exports.listUsers = function (req, res, next) {
	User.find({}).exec()
	.then( function (users) {
		res.json(users);
	})
	.catch(next);
};
