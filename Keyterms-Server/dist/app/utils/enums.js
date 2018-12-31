/*  * NOTICE  *  */
'use strict';

/* eslint-disable no-multi-spaces, standard/object-curly-even-spacing */

// Please note that the split command is acting on commas (','), not spaces.
// Therefore, there shouldn't be any spaces if not part of an enum.
// Why are we doing two variables each? Performance convenience; so validators need only to use the array.

//**********************************************************************************************************************
//exports.statuses = ',add,del,mod,usr,dft,dep'.split(',');

exports.statusesINFO = [
    { value: 'glossary',    name: 'Approved',       desc: 'glossary\'s entry'},
    { value: 'usr',         name: 'User',           desc: 'user\'s personal entry'},
    { value: 'dft',         name: 'Draft',          desc: 'user\'s personal entry in draft'},
    { value: 'dep',         name: 'Deprecated',     desc: 'deprecated entry, not to be used, kept for information'}
];
exports.statuses = exports.statusesINFO.map(status => status.value);

//**********************************************************************************************************************
exports.nominationTypeINFO = [
	{ value: 'add',     name: 'Add',            desc: 'entry is nominated for addition into component\'s list'},
	{ value: 'del',     name: 'Delete',         desc: 'entry is nominated for deletion'},
	{ value: 'mod',     name: 'Modification',   desc: 'proposed modification to an entry'}
];
exports.nominationTypes = exports.nominationTypeINFO.map(type => type.value);

//**********************************************************************************************************************
exports.entryTypesINFO = [
    { value: 'term',    	 name: 'Term',           	desc: 'generic term or collocation'},
    { value: 'attribute',    name: 'Attribute',          desc: 'an attribute of an entity'},
    { value: 'document',     name: 'Document',           desc: 'an entry that describes a document'},
    { value: 'event',   	 name: 'Event',          	desc: 'an entry that describes an event'},
    { value: 'location',     name: 'Location',       	desc: 'name of a place or landmark'},
    { value: 'organization', name: 'Organization',  	    desc: 'name of a company or group'},
    { value: 'passage',    	 name: 'Passage',       	    desc: 'multi-sentence entries'},
    { value: 'person',     	 name: 'Person',         	desc: 'name of a person'},
    { value: 'phrase',     	 name: 'Phrase',       	    desc: 'a short phrase, clause or sentence'}
];
exports.entryTypes = exports.entryTypesINFO.map(type => type.value);

//**********************************************************************************************************************
exports.noteTypesINFO = [
    { value: 'general', 	  name: 'General',        	  desc: 'general type of overview note'},
    { value: 'example', 	  name: 'Example',        	  desc: 'example of how the term is used'},
	{ value: 'etymology',     name: 'Etymology',          desc:  'historical derivation information'},
	{ value: 'form', name: 'Form', desc: 'type of word form, e.g. acronym, abbreviation, short form'},
	{ value: 'formality',     name: 'Formality',         desc: 'degree of formality, e.g. formal, academic, vernacular, vulgar'},
	{ value: 'function',      name: 'Function',          desc: 'function of the Entry or Term'},
    { value: 'meaning', 	  name: 'Meaning',        	  desc: 'definition'},
    { value: 'usage',   	  name: 'Usage',          	  desc: 'explanation of how the term is used'},
    { value: 'pos',     	  name: 'Part of Speech', 	  desc: 'part of speech'},
    { value: 'source',  	  name: 'Source',         	  desc: 'document, website, etc. where the information was obtained'},
	{ value: 'pronunciation', name: 'Pronunciation',      desc: 'phonetic or other sound-based representation'},
	{ value: 'routing',       name: 'Routing',            desc: 'where the term should be used'},
	{ value: 'status',        name: 'Status',             desc: 'is the term used, deprecated, active, etc.'}
];
exports.noteTypes = exports.noteTypesINFO.map(type => type.value);

//**********************************************************************************************************************
exports.orthTypesINFO = [
	{ value: 'abbr',    	   name: 'Abbreviation',   	     desc: 'abbreviation according to rules of language'},
	{ value: 'acronym', 	   name: 'Acronym',        	     desc: 'acronym or initialism'},
	{ value: 'inflect', 	   name: 'Inflected Form', 	     desc: 'inflected form, with suffix, prefix, infix or irregularity' },
	{ value: 'nick',		   name: 'Nickname', 		     desc: 'nick name or familiar name'},
	{ value: 'short',   	   name: 'Short Form',     	     desc: 'ahortened form of multi-token entries'},
	{ value: 'translat', 	   name: 'Translation', 	     desc: 'translation, meaning based' },
	{ value: 'translit', 	   name: 'Transliteration',      desc: 'transliteration, sound or spelling based' },
	{ value: 'dialectVariant', name: 'Dialectical Variant',  desc: 'dialect-specific variant' },
	{ value: 'orthoVariant',   name: 'Spelling Variant', desc: 'spelling variant'},
	{ value: 'synonym',       name: 'Synonym',               desc:'terms with approximatly the same meaning and usage'}
];
exports.orthTypes = exports.orthTypesINFO.map(status => status.value);

//**********************************************************************************************************************
exports.editScopeTypesINFO = [
	{ value: 'any', 	  name: 'Anyone', 				comparison: 10,		desc: 'Any KeyTerms user is allowed to make edits to this Entry'},
	{ value: 'glossary',  name: 'Glossary Members',	    comparison: 5,		desc: 'This Entry follows the KeyTerms default Glossary-based curation pattern'},
	{ value: 'me', 		  name: 'Just Me', 				comparison: 1,		desc: 'The author of this Entry is the only person whom is allowed to make edits'}
];
exports.editScopeTypes = exports.editScopeTypesINFO.map(type => type.value);

//**********************************************************************************************************************
exports.viewScopeTypesINFO = [
	{ value: 'any', 	  name: 'Anyone', 				comparison: 10,		desc: 'Any KeyTerms user is allowed view this Entry'},
	{ value: 'glossary',  name: 'Glossary Members',    	comparison: 5,		desc: 'Only members of this Entry\'s Glossary will be able to view it'},
	{ value: 'me', 	      name: 'Just Me', 				comparison: 1,		desc: 'This Entry is private to the author'}
];
exports.viewScopeTypes = exports.viewScopeTypesINFO.map(type => type.value);

//**********************************************************************************************************************
exports.entrySourcesINFO = [
	{ value: 'user', 		name: 'User', 				desc: 'A KeyTerms user manually entered this Entry'},
	{ value: 'ingest', 		name: 'Uploaded', 			desc: 'Entry is from an bulk ingest operation'},
	{ value: 'nlp', 		name: 'NLP Services', 		desc: 'Entry is a transliteration generated by NLP Services'}
];
exports.entrySources = exports.entrySourcesINFO.map(type => type.value);

//**********************************************************************************************************************
exports.supportedFileTypeINFO = [
	{value: 'json', name: 'JSON', desc: 'JSON file download' },
	{value: 'xlsx2D', name: 'Excel (2D)', desc: 'Excel file download'}
];
exports.supportedFileTypes = exports.supportedFileTypeINFO.map(type => type.value);

/* eslint-enable no-multi-spaces, standard/object-curly-even-spacing */
