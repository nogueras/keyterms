/*  * NOTICE  *  */
var mongoose = require('mongoose');

var elastic = require('../../utils/elasticSearch');

var Entry = mongoose.model('Entry');

// GET /api/browse/terms/:langCode
exports.browseTerms = function (req, res, next) {
	elastic.exploreGlossaryTerms(req.glossary._id.toString(), req.params.langCode)
	.then( function (resp) {
		res.json(resp.aggregations.entries.buckets);
	})
	.catch( function (err) {
		if(err.body.error.type == 'index_not_found_exception') {
			return res.json([]);
		}
		next();
	});
};

// GET?POST? /api/browse/terms/entries
exports.browseEntriesOfTerms = function (req, res, next) {
	var query = {
		glossary: req.glossary._id.toString(),
		_id: {$in: req.body}
	};

	Entry.findAndPopulateForGui(query)
	.then( function (e) {
		res.json(e);
	})
	.catch(next);
};
