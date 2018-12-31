/*  * NOTICE  *  */
var Promise = require('bluebird');
var elasticsearch = require('elasticsearch');
var escape = require('escape-html');
var config = require('../../config').elastic;
var log = require('./logger').logger;

/**
 * An ElasticSearch Index will be created for each Glossary.
 * They will all follow the naming convention of "kt_{{ glossary._id }}".
 *
 * An Index Template was loaded into ElasticSearch, which adds default settings for
 * any index named with the pattern "kt_*". This _template is called "glossary_index_template"
 * and can be retrieved by sending the following request to ElasticSearch: "GET _template/glossary_index_template"
 *
 * The combination of the Index naming convention and Index Template eliminate the need to create an Index
 * Once a Glossary is created. This will be done automatically once the first Entry is created within
 * the Glossary and the "Index this term" query is executed.
 *
 * Any future changes to the Index configuration will require deleting the Index (and copying all of it's
 * documents before deletion if necessary) as well as deleting the Index template (DELETE _template/glossary_index_template).
 * Then the Index Template can be re-created with the correct updates (PUT _template/glossary_index_template w/ body {}). Once
 * this is complete, Terms can be indexed freely (as the Index will be automatically created as discussed above).
 * NOTE: Any copied documents will need to be re-indexed AND simply updating the Index Template will NOT update the
 * configurations of any existing Indices (even if they match the pattern), therefore the Indices must be deleted
 * and re-crated.
 *
 */

var termIndexTemplate = {
	'template': 'kt_*',
	'order': 100,
	'mappings': {
		'term': {
			'_all': {
				'enabled': false
			},
			'_source': {
				'enabled': true
			},
			'dynamic': 'strict',
			'properties': {
				'termText': {
					'type': 'text',
					'analyzer': 'whitespace',
					'fields': {
						'search': {
							'type': 'text',
							'analyzer': 'simple'
						},
						'raw': {
							'type': 'string',
							'index': 'not_analyzed'
						}
					}
				},
				'langCode': {
					'type': 'keyword'
				},
				'mongoEntry': {
					'type': 'keyword',
					'index': false,
					'doc_values': true
				}
			}
		},
		'tag': {
			'_all': {
				'enabled': false
			},
			'_source': {
				'enabled': false
			},
			'dynamic': 'strict',
			'properties': {
				'tag': {
					'type': 'keyword'
				}
			}
		},
		'note': {
			'_all': {
				'enabled': false
			},
			'_source': {
				'enabled': false
			},
			'dynamic': 'strict',
			'properties': {
				'noteText': {
					'type': 'text',
					'analyzer': 'whitespace'
				},
				'noteType': {
					'type': 'keyword'
				}
			}
		}
	},
	'settings': {
		'number_of_replicas': 0,
		'number_of_shards': 1
	}
};

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html
var client = new elasticsearch.Client({
	host: config,
	defer: function () {
		var resolve, reject;
		var promise = new Promise( function () {
			resolve = arguments[0];
			reject = arguments[1];
		});
		return {
			resolve: resolve,
			reject: reject,
			promise: promise
		};
	}
	/**
	 * [ElasticSearch HTTPS/SSL Instructions]
	 *
	 * Uncomment the lines below:
	 *
	 * 		, ssl: {
	 * 			cert: fs.readFileSync('<path/to/cert>'),
	 * 			key: fs.readFileSync('<path/to/key>'),
	 * 			passphrase: 'passphrase of key',		// MAY NOT BE NEEDED
	 * 			ca: fs.readFileSync('<path/to/ca>'),
	 * 		}
	 */
});

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-ping
// client.ping()
exports.ping = function() {
	return client.ping();
};

var glossaryIndexTemplateName = 'glossary_index_template';
exports.termIndexTemplate = {
	exists: function () {
		return client.indices.getTemplate({name: glossaryIndexTemplateName})
		.then( function () {
			return true;
		})
		.catch( function (err) {
			if (err.message === 'Not Found') {
				return false;
			}

			// else throw the error
			throw err;
		});
	},
	set: function () {
		return client.indices.putTemplate({
			order: 100,
			name: glossaryIndexTemplateName,
			body: termIndexTemplate
		});
	}
};

exports.getIndices = function(){
	return client.indices.get({
		index: '_all'
	});
};
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-delete
// client.indices.delete()
exports.deleteGlossaryIndex = function (glossId) {
	return client.indices.delete({
		index: 'kt_' + glossId
	});
};

// TODO: write add/remove methods for Terms, Tags, and Notes
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-index
// client.index()
var indexTerms = function (entry, glossId) {
	var actions = [];

	entry.terms.forEach( function (term) {
		//Escape any html characters in the term text
		//var escapedTermText = escape(term.termText);

		// push action description first
		actions.push({ index: {
			_index: 'kt_' + glossId,
			_type: 'term',
			_id: term._id
			// NOTE: Running index on the same _id will "replace" the old document in the index
		}});

		// then push document (aka "body")
		actions.push({
			// Currently, termText is being added to the index, because the indexText removes all whitespaces
			// which causes issues with our current Elastic Index approach of using the whitespace tokenizer
			termText: term.termText,
			langCode: term.langCode,
			mongoEntry: entry._id
		});
	});

	return client.bulk({
		body: actions
	});
};

var deindexTerms = function (terms, glossId) {
	var actions = [];

	terms.forEach(function (term) {
		// Push an action to delete the index for each requested term
		actions.push({
			delete: {
				_index: 'kt_' + glossId,
				_type: 'term',
				_id: term
			}
		});
	});
	return client.bulk({
		body: actions
	});
};

/* eslint-disable no-unused-vars */
var indexTags = function (entry, glossId) {
	// TODO: write this function
};

var indexNotes = function (entry, glossId) {
	// TODO: write this function
};
/* eslint-enable no-unused-vars */

// NOTE: Running index on the same _id will "replace" the old document in the index
exports.indexEntry = function (entry, glossId, delTerms) {
	// resolve the embedded docs within the entry via doc.populate
	return entry.populate('terms')
	// .execPopulate() is to .populate()'s as .exec() is to queries (.find(), etc)
	.execPopulate()
	.then( function (entry) {
		var promiseArray = [indexTerms(entry, glossId)];
		if (!!delTerms && delTerms.length > 0 ) {
			promiseArray.push(deindexTerms(delTerms, glossId));
		}

		return Promise.all(promiseArray);
	})
	.then( function (resp) {

		log.debug(`Successfully indexed Entry ${entry._id} into Elastic`);
		return resp;
	})
	.catch( function (err) {
		log.warn('Error thrown during Elastic indexing');
		throw err;
	});

};

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-delete
// client.delete()
exports.deindexEntry = function (entry, glossId) {
	var body = [];

	entry.terms.forEach( function (term) {
		body.push( { delete: {
			_index: 'kt_' + glossId,
			_type: 'term',
			_id: term
		}});
	});

	return client.bulk({
		body: body
	})
	.then( function (resp) {
		if (resp.errors) {
            log.warn('Elastic threw an error during Entry deindex attempt...');
        }
		return entry;
	});
};

var createQueryBody = function (searchTerm, langCode, exact) {
	// exact boolean flag, convert undefined to false
	exact = exact === undefined ? false : exact;

	// This object will be added to the query, additional attributes
	// may be added to increase the accuracy of the search
	var termQuery = {
		multi_match: {
			query: searchTerm,
			fields: ['termText^2', 'termText.search']
		}
	};

	// Default search "body" (without the term query)
	// attributes may be added or manipulated below
	var body = {
		size: 100,
		query: {
			bool: {
				must: [{
					match: {
						langCode: langCode
					}
				}]
			}
		},
		highlight: {
			pre_tags: ['{{{em}}}'],
			post_tags: ['{{{/em}}}'],
			fields: {
				'termText': {}
			}
		},
		sort: ['_score']

	};

	// If langCode = 'und' aka if langCode is Any (language)
	if (langCode === 'und') {
        body.query.bool.must = [];
    }
	// Change the search operator based on the exact boolean
	if (exact) {
		// default operator is OR
		termQuery.multi_match.operator = 'and';
	}
	// If exact boolean is false, allow for "fuzziness". Fuzziness allows for a few "errors"
	// between the searched term and the resulting terms. This disables exact string matching
	else {
		// default fuzziness is 0
		// auto configures the fuzziness allowed based on the length of the term(s)
		// https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#fuzziness
		termQuery.multi_match.fuzziness = 'auto';
	}

	// Append the term query to the must selection of the search body
	body.query.bool.must.push(termQuery);

	return body;
};

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
// client.search()
exports.searchGlossaryIndex = function (searchTerm, langCode, glossId, exact) {

	//client.indices.refresh({index : ''});
	var queryBody = createQueryBody(searchTerm, langCode, exact);

	// execute the search query
	return client.search({
		index: 'kt_' + glossId,
		type: 'term',
		body: queryBody
	})
	.then( function (resp) {
		log.debug('Elastic index was queried...');
		// console.log("Resp: ",resp);

		return resp.hits.hits;
	})
	.catch( function (err) {
		log.warn('Error was thrown during Elastic search execution...');

		throw err;
	});
};

exports.searchDefault = function (searchTerm, langCode, exact) {
	// execute the search query
	return client.search({
		index: 'kt_*',
		type: 'term',
		body: createQueryBody(searchTerm, langCode, exact)
	})
	.then( function (resp) {
		log.debug('Elastic index was queried...');
		//console.log(resp);

		return resp.hits.hits;
	})
	.catch( function (err) {
		log.warn('Error was thrown during Elastic search execution...');

		throw err;
	});
};

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-msearch
// client.msearch()
/* eslint-disable no-unused-vars */
exports.searchAllTerms = function (tokens) {
	// TODO: write this function
};
/* eslint-enable no-unused-vars */

exports.exploreGlossaryTerms = function (glossId, langCode) {
	var aggregateQuery = {
		size: 0,
		aggs: {
			'entries': {
				terms: {
					field: 'termText.raw',
					size: 10000,
					order: {'_term': 'asc'}
				},
				aggs: {
					'mongoIds': {
						terms: {field: 'mongoEntry'}
					}
				}
			}
		}
	};

	// If we've got a non-any (und) langCode search for
	if(langCode !== 'und') {
		aggregateQuery.query = {
			match: {
				langCode: langCode // todo: this is gonna be wrong for 'und'
			}
		}
	}

	return client.search({
		index: 'kt_' + glossId,
		type: 'term',
		body: aggregateQuery
	})
		.catch(function (err) {
			log.warn('Error was thrown during Elastic search execution [`exploreGlossaryTerms`]...');

			throw err;
		});
};

exports.manualRefresh = function (glossId) {
	return client.indices.refresh({index: glossId});
};
