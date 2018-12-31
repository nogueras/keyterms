/*  * NOTICE  *  */
app.factory('components.note', ['components.base', 'globals', function (Base, globals) {
	var requiredFields = ['text', 'type'];

	var Note = class Note extends Base.class {
		constructor(data, fromServer) {
			super(data);

			// Note specific stuff
			if (!fromServer) {
				this.type = this.type.value;
				delete this.createdBy;
				console.log(this);
			} else {
				// this will reduce to an array of only length 1
				this.type = globals.noteTypeList.filter(t => t.value === this.type)[0];
			}
		}

		static compare(n1, n2) {
			return n1.text === n2.text && n1.type === n2.type;
		}
	};

	var service = {};

	service.create = function (data, fromServer) {
		return new Note(data, fromServer);
	};

	service.getDefault = function () {
		return {
			type: globals.noteTypeList[0],
			text: '',
			creationDate: Date.now(),
			createdBy: { fullName: 'You' }
		};
	};

	service.compare = Note.compare;

	return service;
}]);
