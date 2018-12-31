/*  * NOTICE  *  */
var TestEnv = require('./env-setup').TestEnv;


describe('03-01 Testing APIs Nomination endpoints and operations', function () {

    var env = new TestEnv();

    var request = env.request;
    var expect = env.expect;

    var mock = TestEnv.mock;

    var rawEntryData = TestEnv.mockEntry;

    env.addSingleTerm();
    env.addNomination();
    env.addModNomination();

    var addId = '';
    var modId = '';
    var delId = '';
    var nomId = '';
    var entry1_id = '';
    var entry2_id = '';
    var glossaryId = '';
    var entryId = '';
    var originialEntry = '';

	it('should fail to insert an invalid Nomination', function(done) {
		request
		.post('/api/nomination/create')
		.send({ data: rawEntryData }) // no type
		.expect(400, done);
	});

	it('should insert a valid Add Nomination', function(done) {
		var addNomination = {
			type: 'add',
			data: rawEntryData
		};

		request
		.post('/api/nomination/create')
		.send(addNomination)
		.expect(201)
		.expect('Content-Type', /json/)
		.expect(function(res) {

			// Test that all fields exist and are correct
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('type', 'add');
			expect(res.body).to.have.property('data');
		})
		.end(function(err, res) {
			if (err) return done(err);

			addId = res.body._id;
			// Test that glossary contains nom
			request
			.get('/api/glossary/g/' + env.glossary._id)
			.expect(function(response) {
				expect(response.body).to.have.property('nominations');
				expect(response.body.nominations).to.be.greaterThan(0);
			})
			.end(function(error, response) {
				done(error);
			});
		});
	});

	it('should approve an Add Nomination', function(done) {
		request
		.post('/api/nomination/approve/' + addId)
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			entryId = res.body._id;
			// Test that all fields exist and are correct

			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('_id', entryId.toString());
		})
		.end(function(err, res) {
			done(err);
		});
	});

	it('should insert a valid Mod Nomination', function (done) {
		var modNomination = {};
		modNomination.type = 'mod';
		modNomination.originalEntry = entryId;
		modNomination.data = rawEntryData;
		modNomination.data.notes = [{ text: 'Test modification', type: 'general' }];

		request
		.post('/api/nomination/create')
		.send(modNomination)
		.expect(201)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			// Test that all fields exist and are correct
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('type', modNomination.type);
			expect(res.body).to.have.property('originalEntry', entryId);
			expect(res.body).to.have.property('data');
			expect(res.body).to.have.property('notes');
			expect(res.body.data.notes).to.not.be.empty();
		})
		.end(function(err, res) {
			modId = res.body._id;
			originialEntry = res.body.originalEntry;

			done(err);
		});
	});

	it('should insert a valid Delete Nomination', function (done) {
		var delIdination = {
			type: 'del',
			originalEntry: entryId
		};

		request
		.post('/api/nomination/create')
		.send(delIdination)
		.expect(201)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			// Test that all fields exist and are correct
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('type', delIdination.type);
			expect(res.body).to.have.property('originalEntry', entryId);
		})
		.end(function(err, res) {
			delId = res.body._id;

			done(err);
		});
	});

	it('should read an existing Nomination', function(done) {

		nomId = env.nomDocs[0]._id;

		request
		.get('/api/nomination/' + nomId)
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {

			// Test that all fields exist and are correct
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('_id', nomId.toString());
			expect(res.body).to.have.property('type', 'add');
			expect(res.body).to.have.property('data');
		})
		.end(function(err, res) {
			done(err);
		});
	});

	it('should fail to read a non-existant Nomination', function(done) {
		request
		.get('/api/nomination/' + glossaryId)
		.expect(404, done);
	});

	it('should fail to read a garbage id', function(done) {
		request
		.get('/api/nomination/garbage')
		.expect(400, done);
	});

	it('should read all Nominations currently in database', function(done) {
		request
		.get('/api/nominations')
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('array');
			expect(res.body.length).to.be.greaterThan(0);
			expect(res.body[0]._id).to.be(nomId.toString());
		})
		.end(function(err, res) {
			done(err);
		});
	});

	it('should approve a Mod Nomination', function(done) {

		request
		.post('/api/nomination/approve/' + modId)
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {

			// Test that all fields exist
			expect(res.body).to.be.an('object');
			expect(res.body).to.have.property('id', originialEntry.toString());
			expect(res.body).to.have.property('terms');
			expect(res.body).to.have.property('termLinks');
			expect(res.body).to.have.property('tags');
			expect(res.body).to.have.property('notes');

			// Test that fields are correct
			expect(res.body.terms).to.not.be.empty();
			expect(res.body.termLinks).to.not.be.empty();
			expect(res.body.tags.length).to.be(rawEntryData.tags.length);
			expect(res.body.notes.length).to.be(rawEntryData.notes.length);
			expect(res.body.notes[0].text).to.be(rawEntryData.notes[0].text);
		})
		.end(function(err, res) {
			done(err);
		});
	});

	it('should approve a Del Nomination', function(done) {
		request
		.post('/api/nomination/approve/' + delId)
		.expect(200)
		.end(function(err, res) {
			done(err);
		})
	});

	it('should fail to approve a non-existant Nomination', function(done) {
		request
		.post('/api/nomination/approve/' + glossaryId)
		.expect(404, done);
	});

	it('should fail to approve a garbage id', function(done) {
		request
		.post('/api/nomination/approve/garbage')
		.expect(400, done);
	});

	it('should reject a Nomination', function (done) {
		entry2_id = env.termDocs[0]._id;
		modId = env.modNomDocs[0]._id;
		request
		.post('/api/nomination/reject/' + modId)
		.expect(200)

		// Test that entry was unchanged
		.end(function(err, res) {
			if (err) return done(err);

			request
			.get('/api/entry/' + entry2_id)
			.expect(200)
			.expect(function(response) {
				expect(response.body).to.be.an('object');
				expect(response.body.terms.length).to.be.above(env.termDocs[0].tags.length - 1); // accounts for any NLP terms that may have been added after entry creation
				expect(response.body.termLinks).to.not.be.empty();
				expect(response.body.tags.length).to.be(env.termDocs[0].tags.length);
				expect(response.body.notes.length).to.be(env.termDocs[0].notes.length);
			})
			.end(function(error, response) {
				done(error);
			});
		});
	});

	it('should fail to reject a non-existant Nomination' , function(done) {
		request
		.post('/api/nomination/reject/' + glossaryId)
		.expect(404, done);
	});

	it('should fail to reject a garbage id', function(done) {
		request
		.post('/api/nomination/reject/garbage')
		.expect(400, done);
	});
});
