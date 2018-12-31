/*  * NOTICE  *  */
app.factory('components.tag', ['components.base', 'keytermsApi', function (Base, Keyterms) {
	Base = Base.class;

	var requiredFields = ['text'];

	var Tag = class Tag extends Base {
		constructor(data) {
			super(data);

			// Tag specific stuff
		}

		rename(newTag) {
			return Keyterms.renameTag(this._id, newTag).then(function (res) {
				console.log(res);
				if (res.status === 200) {
					this._id = res.data._id;
					this.content = res.data.content;
					this.entries = res.data.entries.slice();
					return res.data;
				}
			});
		}

		del() {
			return Keyterms.deleteTag(this._id).then(function (res) {
				console.log(res);
				return res.data;
			});
		}

		static compare(t1, t2) {
			if (typeof t1 === 'object' && typeof t2 === 'object') {
				return t1.text === t2.text;
			} else if (typeof t1 === 'string' && typeof t2 === 'string') {
				return t1 === t2;
			} else {
				throw new Error('Bad Tag Comparison');
			}
		}
	};

	var service = {};

	service.create = function (data, fromServer) {
		return new Tag(data, fromServer);
	};

	service.compare = Tag.compare;

	return service;
}]);
