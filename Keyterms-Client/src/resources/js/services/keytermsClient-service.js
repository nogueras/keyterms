/*  * NOTICE  *  */
/****
 *	The Keyterms Client service serves two functions: It stores all data returned by the KeyTerms API
 *	locally, for ease of access, AND it provides an interface to the KeyTerms API via the
 *	keytermsApi service. Adding, editing, and removing Keyterms components locally will also be
 *	reflected in the KeyTerm's database.
 *
 * 	NOTE: For development, this service will also be used to create fake data for testing
 *		purposes. This way everything is coming from one centralized location
***/

app.factory('keytermsClient.service', ['$q', 'globals', 'keytermsApi', 'components.tag', 'components.note', 'components.termlink', 'components.term', 'components.entry', function ($q, globals, Keyterms, Tag, Note, TermLink, Term, Entry) {

	/////// local (private) variables ///////

	// creates a hash of local data per page
	var createLocalData = function () {
        var temp = {
            'addterm': {},
            'approvals': {},
            'drafts': {},
            'edit': {},
            'export': {},
            'review': {},
            'search': {},
            'tags': {},
            'userterms': {},
            'viewterm': {}
        };

        return temp;
    };

	var localData = angular.merge({}, createLocalData());

	/////// public methods and variables ///////
	return {
		// utility function
		uuid: function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : r & 0x3 | 0x8;
				return v.toString(16);
			});
		},
		storeLocalValue: function (page, key, value) {
			localData[page][key] = value;
		},
		getLocalValue: function (page, key) {
			return localData[page][key];
		},
		deleteLocalValue: function (){
            localData = angular.merge({}, createLocalData());
		},
		getTerms: function () {
			return [];
		},
		getEntries: function () {
			return [];
		},
		add: function (type, component) {
			// do stuff
			console.log(type);
		},
		getGlossaryTags: function () {
			return Keyterms.requestTags().then(function (resp) {
				console.log(resp.data);
				return resp.data.map(t => Tag.create(t));
			});
		},
		tagEntry: function (tag, entryId) {
			return Keyterms.tagEntry(tag, entryId).then(function (result) {
				return result.data;
			});
		},
		searchByTag: function (tag) {
			return Keyterms.searchByTag(tag).then(function (res) {
				return res.data;
			});
		},
		searchTerms: function (term, langCode, glossScope) {
			return Keyterms.searchTerms(term, langCode, glossScope).then(function (res) {
				return res.data;
			});
		},
		createNomination: function (entry, id) {
			var nom = Entry.nominate(entry, id);

			return Keyterms.createNomination(nom).then(function (result) {
				return result.data;
			});
		},
		createEntry: function (entry) {
			var e = Entry.create(entry);

			return Keyterms.createEntry(e).then(function (result) {
				return result.data;
			});
		},
		updateEntry: function (entry) {
			var id = entry._id;
			if (entry.fromServer) { entry.fromServer = false; }
			var e = Entry.create(entry);
			console.log(e);

			return Keyterms.updateEntry(id, e).then(function (result) {
				return result.data;
			});
		},
		publishDraft: function (draft, isNom) {
			if (!draft.isDraft) { return $q.reject(new Error('Cannot publish a non-draft Entry')); }

			return Keyterms.publishEntry(draft._id, isNom).then( function (res) { return res.data; });
		},
		getUserEntries: function () {
			return Keyterms.getUserEntries().then(function (res) {
				return res.data;
			});
		},
		getDrafts: function () {
			return Keyterms.requestDrafts().then(function (res) {
				return res.data;
			});
		},
		getNominations: function () {
			return Keyterms.requestNominations().then(function (res) {
				return res.data;
			});
		},
		getNomination: function (id) {
			return Keyterms.requestNomination(id).then(function (res) {
				var nom = res.data;

				if(nom.type === 'add'){
					nom.originalEntry = Entry.create(nom.data, true);
				} else{
					nom.originalEntry = Entry.create(nom.originalEntry, true);
				}
				return nom;
				//return Entry.nominate(res.data, null, true);
			});
		},
		getEntry: function (id) {
			return Keyterms.requestEntry(id).then(function (res) {
				return Entry.create(res.data, true);
			});
		},
		deleteEntry: function (id) {
			return Keyterms.deleteEntry(id).then(function (res) {
				return res.data;
			});
		},
		rejectNomination: function (id) {
			return Keyterms.rejectNomination(id).then(function (res) {
				return res.data;
			});
		},
		approveNomination: function (id, data) {
			//TODO: prepare data object for submission

			// createdBy => object-> _id
			return Keyterms.approveNomination(id, data).then(function (res) {
				return res.data;
			});
		},
		browseTerms: function (langCode) {
			return Keyterms.browseTerms(langCode).then( function (res) {
				return res.data;
			});
		},
		browseTermEntries: function (entryIds) {
			return Keyterms.browseTermEntries(entryIds).then( function (res) {
				return res.data;
			});
		}
	};
}]);
