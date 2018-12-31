/*  * NOTICE  *  */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Appending the mongoose.Schema class to replace the deprecated mongoose-schema-extend module
Schema.prototype.extendSchema = function (obj, options) {
	var tmp = Object.assign({}, this.obj);
	return new Schema(Object.assign({}, tmp, obj), options);
};

/* eslint-disable key-spacing, comma-style */
var BaseSchema = mongoose.Schema({
	createdBy: 					{type: Schema.Types.ObjectId, ref: 'User'}
	, nominatedBy: 				{type: Schema.Types.ObjectId, ref: 'User'}
	, approvedBy: 				{type: Schema.Types.ObjectId, ref: 'User'}
	, creationDate: 			{type: Date, default: Date.now}
});
/* eslint-enable key-spacing */

module.exports = BaseSchema;
