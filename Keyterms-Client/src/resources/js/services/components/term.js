/*  * NOTICE  *  */
app.factory('components.term', ['components.base', 'components.note', 'globals', function (Base, Note, globals) {
	var requiredFields = ['langCode', 'termText'];

	var Term = class Term extends Base.class {
		constructor(data, fromServer) {
			super(data);

			if (this.notes instanceof Array && this.notes.length > 0) {
				this.notes = this.notes.map(note => Note.create(note, fromServer));
			}

			// Term specific stuff
			if (!fromServer) {
				this.langCode = this.langCode.value;
			} else {
				// this will reduce to an array of only length 1
				this.langCode = globals.langCodeMap[this.langCode];
			}
		}

		static compare(t1, t2) {
			return t1.termText === t2.termText && t1.langCode === t2.langCode;
		}
	};

	var service = {};

	service.create = function (data, fromServer) {
		return new Term(data, fromServer);
	};

	service.getDefault = function () {
		return {
			langCode: {},
			termText: '',
			notes: []
		};
	};

	service.class = Term;
	service.compare = Term.compare;

	return service;
}]);
