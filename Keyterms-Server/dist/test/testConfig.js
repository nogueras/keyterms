/*  * NOTICE  *  */
"use strict";
var path = require('path');

var config = require('../config').server;
var db = require('../config').db;
var env = process.env.NODE_ENV || 'TEST';
process.env.NODE_ENV = env;
var testConfig = {};

// Node automatically rejects self signed certs
// turns this feature off in development mode
if (/prod/i.test(env))
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Database (Mongo) configurations
// Use configured Mongo connection, but use KeyTermsTest db instead
testConfig.db = db;
testConfig.db.db = 'KeyTermsTest';

testConfig.logSetup = {
	level: 'silly',
	label: 'testLog',
	colorize: false,
	timestamp: false,
	filename: path.join(__dirname, '../logs/unittest.log'),
	json: false,
	handleExceptions: false,
	options: { flags: 'w' }
};

testConfig.testUser = {
	username: 'starkidpotter',
	password: 'alohomora'
};

testConfig.server = {
	protocol: "http" + (config.useHTTPS ? "s" : ""),
	host: "localhost",
	port: (env.match(/prod/i) ?
		(config.useHTTPS ? config.prod.https : config.prod.http) :
		(config.useHTTPS ? config.dev.https : config.dev.http))
};

testConfig.server.url = testConfig.server.protocol + "://" + testConfig.server.host + ":" + testConfig.server.port;

module.exports = testConfig;
