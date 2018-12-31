/*  * NOTICE  *  */
var TestEnv = require('./env-setup').TestEnv;


describe("07-01 Testing Search API", function() {

    var env = new TestEnv();

    var request = env.request;
    var expect = env.expect;

    var mock = TestEnv.mock;

    var tag = '';
    var tagContent = '';
    var entry_id = '';
    var glossary_id = '';
    var tag_id = '';
    var term_id = '';
    var entry = '';
    var term = '';

    env.addSingleTerm();
    env.refreshIndex();

	it('should search for Entries by Tag', function(done) {

		tag = env.termDocs[0].tags[0];
		tagContent = 'tag1';
		request
		.get('/api/tags/search/' + tagContent)
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('array');
			expect(res.body.length).to.be(1);
			expect(res.body[0]).to.have.property('tags');
			expect(res.body[0].tags[0]).to.have.property('_id', tag.toString());
		})
		.end(function(err, res) {
			done(err);
		})
	});

	it('should find no Entries when Tag is not linked to any Entries', function(done) {
		done()
	});

	it('should find no Entries when Tag does not exist', function(done) {
		done();
	});

	// it('should search glossary for Entries by Term (get)', function(done) {
	// 	entry = env.termDocs[0];
	// 	term = entry.terms[0];
    //
	// 	request
	// 	.get('/api/search/glossary?langCode=eng&searchTerm=PANCAKES')
	// 	.expect(200)
	// 	.expect('Content-Type', /json/)
	// 	.expect(function(res) {
	// 		expect(res.body).to.be.an('array');
	// 		expect(res.body.length).to.be(1);
	// 		expect(res.body[0]).to.have.property('terms');
	// 		expect(res.body[0].terms[0]).to.have.property('termText', term.termText);
	// 	})
	// 	.end(function(err, res) {
	// 		done(err);
	// 	});
	// });
    //
	// it('should search glossary for Entries by Term (post)', function(done) {
    //
	// 	request
	// 	.post('/api/search/glossary')
	// 	.send({ langCode: term.langCode, searchTerm: term.termText })
	// 	.expect(200)
	// 	.expect('Content-Type', /json/)
	// 	.expect(function(res) {
	// 		expect(res.body).to.be.an('array');
	// 		expect(res.body.length).to.be(1);
	// 		expect(res.body[0]).to.have.property('terms');
	// 		expect(res.body[0].terms[0]).to.have.property('termText', term.termText);
	// 	})
	// 	.end(function(err, res) {
	// 		done(err);
	// 	})
	// });

	it('should find no Entries when Term is not linked to any Entries', function(done) {
		done()
	});

	it('should find no Entries when Term does not exist', function(done) {
		done();
	});

	// The difference between 'default' and 'glossary' search is well not documented
	it('should search default for Entries by Term (get)', function(done) {
        entry = env.termDocs[0];
		term = entry.terms[0];
		var gloss = {value: 'all'};

		request
		.get('/api/search/default?langCode=eng&searchTerm=PANCAKES&glossScope={value: \'all\'}')
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('array');
			expect(res.body.length).to.be(1);
			expect(res.body[0]).to.have.property('terms');
			expect(res.body[0].terms[0]).to.have.property('termText', term.termText);
			expect(res.body[0].terms[0]).to.have.property('highlightTermText', '<b class="search-hit">' + term.termText + '</b>');
			console.log("LOOK HERE ", res.body);
		})
		.end(function(err, res) {
			done(err);
		})
	});

	it('should search default for Entries by Term (post)', function(done) {

		var glossScope = {value: 'all'};
		request
		.post('/api/search/default')
		.send({ langCode: term.langCode, searchTerm: term.termText, glossScope: glossScope })
		.expect(200)
		.expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.be.an('array');
			expect(res.body.length).to.be(1);
			expect(res.body[0]).to.have.property('terms');
			expect(res.body[0].terms[0]).to.have.property('termText', term.termText);
			expect(res.body[0].terms[0]).to.have.property('highlightTermText', '<b class="search-hit">' + term.termText + '</b>');
		})
		.end(function(err, res) {
			done(err);
		})
	});

	it('should find no Entries when Term is not linked to any Entries', function(done) {
		done()
	});

	it('should find no Entries when Term does not exist', function(done) {
		done();
	});
});
