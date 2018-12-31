/*  * NOTICE  *  */
var userPassStrategy = require('./user-pass-strategy');
var authentication = require('./authentication');
var authorization = require('./authorization');

module.exports = {
	strategies: {
		userPassStrategy: userPassStrategy
	},
	middleware: {
		authenticate: authentication,
		authorize: authorization
	}
};
