/*  * NOTICE  *  */
var TestEnv = require('./env-setup').TestEnv;

var testConfig = TestEnv.config;

/**
 *`01-01 Testing server response from ${testConfig.server.protocol}://${testConfig.server.host} on port ${testConfig.server.port}`
 */
describe(`01-01 Testing server response from ${testConfig.server.url}$`, function () {
    var env = new TestEnv();

    var request = env.request;
    var expect = env.expect;

    it('should get the name of the server if it is running', function(done) {
		request
		.get('/api')
		.expect(302)
		.expect('Content-Type', 'text/plain; charset=utf-8', done);
	});

	it('should get server status information', function(done) {
		request
		.get('/api/status')
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {

			// Test that all fields exist
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('mode');
			expect(res.body).to.have.property('mongoDbVersion');
			expect(res.body).to.have.property('keyTermsVersion');
			expect(res.body).to.have.property('keyTermsEntries');

			// Test that fields are correct
			expect(res.body.mode).to.match(/test/i);
			expect(res.body.mongoDbVersion).to.not.be.empty();
			expect(res.body.keyTermsVersion).to.not.be.empty();
			expect(res.body.keyTermsEntries).to.be.above(-1);
		})
		.end(function(err, res) {
	        done(err);
	    });
	});

	it('should get the entry schema', function(done) {
		request
		.get('/api/schema')
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('_id');
			expect(res.body).to.have.property('glossary');
			expect(res.body).to.have.property('createdBy');
			expect(res.body).to.have.property('terms');
			expect(res.body).to.have.property('termLinks');
			expect(res.body).to.have.property('tags');
		})
		.end(function(err, res) {
	        done(err);
	    });
	});

	it('should get system enums', function(done) {
		request
		.get('/api/enums')
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('objectsStatuses');
			expect(res.body).to.have.property('entryTypes');
			expect(res.body).to.have.property('noteTypes');
			expect(res.body).to.have.property('orthographyTypes');
			expect(res.body).to.have.property('nominationTypes');
			expect(res.body).to.have.property('viewScopeTypes');
			expect(res.body).to.have.property('editScopeTypes');
		})
		.end(function(err, res) {
	        done(err);
	    });
	});

	it('should get langcodes', function(done) {
		request
		.get('/api/langcodes')
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('languageCodes');
			expect(res.body.languageCodes).to.have.property('eng');
		})
		.end(function(err, res) {
	        done(err);
	    });
	});

	// it('should log into a test user account', function(done) {
	// 	request
	// 	.post('/login')
	// 	.send(users.user0)
	// 	.expect(200)
	// 	.expect('Content-Type', /json/)
	// 	.expect(function(res) {
	// 		expect(res.body).to.be.an('object');
	// 		expect(res.body).to.have.property('username', users.user0.username);
	// 		expect(res.body).to.have.property('email', users.user0.email);
	// 		expect(res.body).to.have.property('fullName', users.user0.fullName);
	// 		expect(res.body).to.have.property('isAdmin', users.user0.isAdmin);
	// 	})
	// 	.end(function(err, res) {
	//         done(err);
	//     });
	// });
});
