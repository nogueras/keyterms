/*  * NOTICE  *  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');
var log = require('../../utils/logger').logger;
var elastic = require('../../utils/elasticSearch');

/* eslint-disable key-spacing, comma-style */
var glossarySchema = mongoose.Schema({
    name: 					{type: String, required: true, unique: true, dropDups: true}
    , description: 			{type: String}
    , path: 				{type: String, default: '/'}
    , abbreviation: 		{type: String, required: true, unique: true, dropDups: true}
    , globalBlock: 			{type: Boolean, default: false}
    , isCommon:             {type: Boolean, default: false}
    , langList: 			[{type: String}]
	, lastModified: 		{type: Date, default: Date.now}
    , admins: 				[{type: Schema.Types.ObjectId, ref: 'User'}]
    , qcs: 					[{type: Schema.Types.ObjectId, ref: 'User'}]
    , entries: 				[{type: Schema.Types.ObjectId, ref: 'Entry'}]
    , nominations: 			[{type: Schema.Types.ObjectId, ref: 'Nomination'}]
});
/* eslint-enable key-spacing, comma-style */

//glossarySchema.set('autoIndex', true);

glossarySchema.pre('save', function (next) {
	this.lastModified = Date.now();
	next();
});

glossarySchema.pre('remove', function (next) {
	// Deletes the ElasticSearch Index bound to this Glossary
	elastic.deleteGlossaryIndex(this._id)
	.then(next)
	.catch( function (err) {
		// an error will be thrown if the index does not exist, however is this not an
		// error is this circumstance. Therefore catch exception and continue execution
        if (err.body) {
    		var error = err.body.error;
    		if (error.type === 'index_not_found_exception' || error.reason === 'no such index') {
    			next();
    		} else {
    			next(err);
    		}
        } else {
            next(err);
        }
	});
});

glossarySchema.methods.removeGlossary = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        log.debug('removing Glossary');
        self.entries.forEach(function (entry) {
            entry.remove();
        });
        self.remove().then(resolve).catch(reject);
    });
};

glossarySchema.methods.updateMetadata = function (body) {
	var glossary = this;
	var metaFields = ['name', 'abbreviation', 'path', 'description', 'globalBlock', 'langList'];

	metaFields.forEach( function (field) {
		glossary[field] = body[field];
	});

	return this.save();
};

glossarySchema.methods.addEntry = function (entryId) {
	this.entries.push(entryId);
	return this.save();
};

glossarySchema.methods.removeEntry = function (entryId) {
	this.entries.pull(entryId);
	return this.save()
	.catch( function (err) {
		log.error('Handling Error on bulk remove');
		log.error(err);
		return err;
	});
};

glossarySchema.methods.addNom = function (nomId) {
	this.nominations.push(nomId);
	return this.save();
};

glossarySchema.methods.removeNom = function (nomId) {
	this.nominations.pull(nomId);
	return this.save();
};

glossarySchema.methods.addQC = function (qc) {
    log.debug('adding QC');
    if (this.qcs.indexOf(qc) === -1) {
        this.qcs.push(qc);
        log.debug('Added QC');
        return this.save();
    }
    log.debug('QC already exists');
    return Promise.resolve(this);
};

glossarySchema.methods.addAdmin = function (admin) {
    log.debug('adding Admin');
    if (this.admins.indexOf(admin) === -1) {
        this.admins.push(admin);
        log.debug('Added admin');
        return this.save();
    }
    log.debug('Admin already in group');
    return Promise.resolve(this);
};


glossarySchema.methods.removeQC = function (qc) {
    log.debug('removing QC');
    this.qcs.pull(qc);
    return this.save();
};

glossarySchema.methods.removeAdmin = function (admin) {
    log.debug('removing Admin');
    this.admins.pull(admin);
    return this.save();
};


exports.glossarySchemea = glossarySchema;
exports.Glossary = mongoose.model('Glossary', glossarySchema);
