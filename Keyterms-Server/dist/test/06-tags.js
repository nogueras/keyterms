/*  * NOTICE  *  */
var TestEnv = require('./env-setup').TestEnv;


//env.addTag();

describe("06-01 Testing Tag API", function(){

    var env = new TestEnv();

    var request = env.request;
    var expect = env.expect;

    var mock = TestEnv.mock;

    var tag1_id = '';
    var tag2 = '';
    var entry_id = '';
    var glossary_id = '';
    var testTag = '';

    env.addSingleTerm();

    it('should create a Tag', function(done) {

        glossary_id = env.glossary._id;
        testTag = 'thing';
        request
		.get('/api/tags/findOrCreate/' + testTag)
        .expect(200)
        .expect('Content-Type', /json/)
		.expect(function(res){
            tag1_id = res.body._id;
			// Test that all fields exist and are correct
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('content', testTag);
            expect(res.body).to.have.property('glossary', glossary_id.toString());
		})
		.end(function(err, res) {
            done(err);
        });
    });

    it('should read a Tag', function(done) {
        request
        .get('/api/tags/findOrCreate/' + testTag)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res){
            // Test that all fields exist and are correct
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id', tag1_id.toString());
            expect(res.body).to.have.property('content', testTag);
            expect(res.body).to.have.property('glossary', glossary_id.toString());
        })
        .end(function(err, res) {
            done(err);
        });
    })

    it("should read all Tags in current glossary", function(done){

        tag2 = env.termDocs[0].tags[0];

        request
        .get('/api/tags/glossaryTags')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res){

            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
            expect(res.body[0]._id).to.be(tag2.toString());
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should add an entry to a Tag', function(done) {

        entry_id = env.termDocs[0]._id;
		var addEntryRequest ={
			entryId: entry_id
		};

        request
		.post('/api/tags/addEntry/' + testTag)
		.send(addEntryRequest)
        .expect(200)
        .expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body.entries).to.contain(entry_id.toString());
		})
		.end(function(err, res) {
            done(err);
        });
    });

	it("should remove an entry from a Tag", function(done) {
	    var removeEntryRequest ={
		    entryId: entry_id
	    };

	    request
	    .post('/api/tags/removeEntry/' + testTag)
	    .send(removeEntryRequest)
        .expect(200)
        .expect('Content-Type', /json/)
	    .expect(function(res){
		    expect(res.body.entries).to.not.contain(entry_id.toString());
	    })
	    .end(function(err, res) {
            done(err);
        });
	});

	it('should rename a Tag', function(done) {
		request
		.post('/api/tags/rename/' + tag1_id)
		.send({ newTag: 'TEST TAG RENAMED' })
        .expect(200)
        .expect('Content-Type', /json/)
		.expect(function(res) {
			expect(res.body).to.have.property('content', 'test tag renamed');
		})
        .end(function(err, res) {
            done(err);
        });
	});

    it('should fail to rename a Tag to a name that already exists in this glossary', function(done) {

        //console.log("tag1_id: ", tag1_id);
        //console.log("tag2_id: ", tag2);

        request
        .post('/api/tags/rename/' + tag1_id)
        .send({ newTag: 'person' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
            expect(res.body).to.have.property('_id', tag1_id.toString() );
        })
        .end(function(err,res){
            done(err);
        })
    });

	it('should delete a Tag', function(done) {
		request
		.delete('/api/tags/del/' + tag1_id)
		.expect(204, done);
	});

    it('should fail to delete a non-existant Tag', function(done) {
        request
        .delete('/api/tags/del/garbage')
        .expect(404, done);
    });
});
