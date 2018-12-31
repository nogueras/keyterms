/*  * NOTICE  *  */
'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var log = require('../../utils/logger').logger;

var SALT_WORK_FACTOR = 10;

/* eslint-disable key-spacing, comma-style */
var UserSchema = new Schema({
    username:           {type: String, required: true, index: {unique: true}},
    password:           {type: String, required: true},
    email:              {type: String, required: true},
    fullName:           {type: String, required: true},
    isAdmin:            {type: Boolean, default: false},
    certOnly:           {type: Boolean, default: false},
    glossaries:         [{type: Schema.Types.ObjectId, ref: 'Glossary'}],
    currentGlossary:    {type: Schema.Types.ObjectId, ref: 'Glossary'},
    defaultGlossary:    {type: Schema.Types.ObjectId, ref: 'Glossary'},
    isDeactivated:   	{type: Boolean, default: false}
});
/* eslint-enable key-spacing, comma-style */

var transformUser = function (doc, ret) {
    delete ret.password;
    delete ret.certOnly;

    return ret;
};

// Prevents password from being sent to client via JSON response
UserSchema.set('toJSON', {
    transform: transformUser
});

UserSchema.set('toObject', {
    transform: transformUser
});

UserSchema.pre('validate', function (next) {
    if (!this.password) {
        this.password = new mongoose.Types.ObjectId();
        this.certOnly = true;
    }

    next();
});

UserSchema.pre('save', function (next) {
    var user = this;

// only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) { return next(); }

// generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) { return next(err); }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) { return next(err); }

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
    var self = this;
    return new Promise(function (resolve, reject) {
        bcrypt.compare(candidatePassword, self.password, function (err, isMatch) {
            if (err) {
                log.error(err);
                reject(err);
            }
            else {
                resolve(isMatch);
            }
        });
    });
};

UserSchema.methods.changePassword = function (newPassword) {
    this.password = newPassword;
    return this.save();
};

UserSchema.methods.updateDefaultGlossary = function (targetGlossary) {
	if (this.glossaries.indexOf(targetGlossary) === -1 && targetGlossary !== null) {
		var err = new Error('User is not a member of the target Glossary');
		err.notAMember = true;
		return Promise.reject(err);
	}

	this.defaultGlossary = targetGlossary;
	return this.save()
		.then(function (user) {
			return user.populate({
				path: 'glossaries',
				model: 'Glossary',
				select: 'name abbreviation admins qcs langList'
			}).execPopulate();
		});
};

UserSchema.methods.switchActiveGlossary = function (targetGlossary) {
    if (this.glossaries.indexOf(targetGlossary) === -1) {
        var err = new Error('User is not a member of the target Glossary');
        err.notAMember = true;
        return Promise.reject(err);
    }

    this.currentGlossary = targetGlossary;
    return this.save()
    .then(function (user) {
        return user.populate({
            path: 'glossaries',
            model: 'Glossary',
            select: 'name abbreviation admins qcs langList'
        }).execPopulate();
    });
};

UserSchema.methods.joinGlossary = function (glossaryId) {
    var index = this.glossaries.indexOf(glossaryId);

    if (index !== -1) { return Promise.resolve(this); }

    this.glossaries.push(glossaryId);

    return this.save();
};

UserSchema.methods.leaveGlossary = function (glossaryId) {
    var index = this.glossaries.indexOf(glossaryId);

    if (index === -1) { return Promise.resolve(this); }

    this.glossaries.pull(glossaryId);
    return this.save();
};

module.exports = mongoose.model('User', UserSchema);
