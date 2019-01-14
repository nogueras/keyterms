/*  * NOTICE  *  */
var User = require('mongoose').model('User');
var log = require('../utils/logger').logger;
var Strategy = require('passport-local').Strategy;

var validateUser = function (username, done, next) {
	User.findOne({'username': username})
	.then( function (user) {
		if (user == null) {

			return done(null, 'no user');
		}
		else if (user.isDeactivated) {
			return done(null, 'user is disabled');
		}

		return user;
	})
	.catch( function (err) {
		log.error(err);
		done(err);
	})
	.then( function (user) {

		if (!!user) {
			next(user);
		}
	});
};

exports.stratCB = new Strategy(function (username, password, done) {
    log.debug('Inside Strategy callback');

	var next = function (user) {
		log.debug('checking password for ' + user.username);
		user.comparePassword(password)
		.then(function (isValidPassword) {
			if (isValidPassword) {
				log.debug('Password correct for ' + user.username);
				user.populate({
					path: 'glossaries',
					model: 'Glossary',
					select: 'name langList'
				}).execPopulate()
				.then(function (_user) {
					done(null, _user);
				});
			}
			else {
				log.debug('Password incorrect');
				done(null, false);
			}
		})
		.catch(function (err) {
			log.error(err);
			done(err);
		});
	};

	validateUser(username, done, next);
});

exports.serializeUser = function (user, done) {
    log.debug('serializing user: ' + user.username);
    done(null, user.username);
};

exports.deserializeUser = function (req, username, done) {
    log.debug('deserializingUser: ' + username);

    var next = function (user) {
		log.debug('Successfully deserialized: ' + user.username);
		done(null, user);
    };

	validateUser(username, done, next);
};

exports.changePassword = function(req, res, next){
    log.debug('Changing user password');
    this.req.user.changePassword(req.body.newPassword)
        .then(res.sendStatus(200)).catch(next);
};
