/*  * NOTICE  *  */
app.factory('components.base', ['globals', 'user.service', function (globals, User) {

	var Base = class Base {
		constructor(data) {
			angular.extend(this, data);

			if (this.creationDate) {
				this.modificationDate = Date.now();
			} else {
				this.creationDate = Date.now();
			}

			if (this.createdBy) {
				this.nominatedBy = User.getUser()._id;
			} else {
				this.createdBy = User.getUser()._id;
			}
		}

		validate(reqFields = []) {
			// TODO: iterate through each field to determine if
			// all required fields are in the object
			return true;
		}
	};

	var service = {};

	service.class = Base;

	return service;
}]);
