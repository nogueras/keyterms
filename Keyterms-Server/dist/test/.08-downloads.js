/*  * NOTICE  *  */
// WIP

var app = require('../app/app.js');
var testConfig = require('./testConfig');
var request = require('supertest').agent(app);
var expect = require('expect.js');

var mongoose = require('mongoose');
var Entry = mongoose.model('Entry');
var Glossary = mongoose.model('Glossary');
var Tag = mongoose.model('Tag');
var Term = mongoose.model('Term');

var common = require('common');
var entries = common.entries;

var entry = {}
var tag = { content: 'tag1' };
var term = { termText: 'test crud 1', langCode: 'eng' };

var entry_id = '';
var glossary_id = '';
var tag_id = '';
var term_id = '';

describe('08-01 Testing APIs downloads endpoints', function() {

    /**
     * Before hook: create test data, login to test user account.
     */
    before(function(done) {

        // Find starter glossary
        Glossary.findOne().then(function(response) {
            glossary_id = response._id;
            entry.glossary = glossary_id;
            tag.glossary = glossary_id;

            // Insert tag
            return Tag.create(tag).then(function(response) {
                tag_id = response._id;
            });

        // Insert term
        }).then(function(response) {
            return Term.create(term).then(function(response) {
                term_id = response._id;
            });

        // Insert entry
        }).then(function(response) {
            entry.tags = [tag_id];
            entry.terms = [term_id];
            return Entry.create(entry).then(function(response) {
                entry_id = response._id;
            });

        // Update tag with entry
        }).then(function(response) {
            return Tag.update({ _id: tag_id }, { $set: { entries: entry_id }});

        // Update glossary with entry
        }).then(function(response) {
            return Glossary.update({ _id: glossary_id }, { $set: { entries: entry_id }});

        // Login
        }).then(function(response) {
            request
            .post('/login')
            .send(testConfig.testUser)
            .expect(200, done);
        });
    });

    /**
     * After hook: undo important changes to the database
     */
    after(function(done) {

        // clear out entry, tag, and term collections
        mongoose.connection.db.dropCollection('entries', function(err, response) {
            mongoose.connection.db.dropCollection('tags', function(err, response) {
                mongoose.connection.db.dropCollection('terms', function(err, response) {
                    // reset glossary
                    Glossary.update({ _id: glossary_id}, { $unset: { "entries": [] }}).then(function(response) {
                        done();
                    });
                });
            });
        });
    });

    it('should download all Entries in Glossary', function(done) {
        request
        .get('/api/download/glossary?file=false')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(1);
            expect(res.body[0]).to.be.an(Entry);
            expect(res.body[0]).to.have.property('_id', entry_id.toString());
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should download Glossary search results', function(done) {
        request
        .get('/api/download/query?file=false&langCode=eng&searchTerm=test+crud+1')
        .expect(200)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(1);
            expect(res.body[0]).to.be.an(Entry);
            expect(res.body[0]).to.have.property('_id', entry_id.toString());
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should download Glossary search results with inexact match', function(done) {
        request
        .get('/api/download/query?file=false&langCode=eng&searchTerm=test')
        .expect(200)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(1);
            expect(res.body[0]).to.be.an(Entry);
            expect(res.body[0]).to.have.property('_id', entry_id.toString());
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should return 0 entries when the limit is 0', function(done) {
        request
        .get('/api/download/query?file=false&limit=0&langCode=eng&searchTerm=test+crud+1')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(0);
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should not find any entries for Terms that don\'t exist', function(done) {
        request
        .get('/api/download/query?file=false&langCode=eng&searchTerm=hello+world')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(0);
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should download selected Entries', function(done) {
        request
        .get('/api/download/selected?file=false&entries=' + entry_id)
        .expect(200)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(1);
            expect(res.body[0]).to.have.property('_id', entry_id.toString());
        })
        .end(function(err, res) {
            done(err);
        });
    });

    it('should not find any Entries from invalid ids', function(done) {
        request
        .get('/api/download/selected?file=false&entries=' + glossary_id)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function(res) {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be(0);
        })
        .end(function(err, res) {
            done(err);
        });
    });
});
