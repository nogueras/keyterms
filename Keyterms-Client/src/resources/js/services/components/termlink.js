/*  * NOTICE  *  */
app.factory('components.termlink', ['components.base', 'globals', function (Base, globals) {
	var requiredFields = ['langCode', 'termText'];

	var TermLink = class TermLink extends Base.class {
		constructor(data, fromServer) {
			super(data);

			// TermLink specific stuff
			if (!fromServer) {
				this.relationType = this.relationType.value;
			} else {
				// this will reduce to an array of only length 1
				this.relationType = globals.orthoTypes.filter(t => t.value === this.relationType)[0];
			}
		}

		static compare(l1, l2) {
			if (!!l1.__lhs_id && !!l2.__lhs_id && !!l1.__rhs_id && !!l2.__rhs_id) {
				return l1.__lhs_id === l2.__lhs_id && l1.__rhs_id === l2.__rhs_id && l1.relationType === l2.relationType;
			} else {
				return l1.lhs === l2.lhs && l1.rhs === l2.rhs && l1.relationType === l2.relationType;
			}
		}
	};

	var service = {};

	service.create = function (data, fromServer) {
		return new TermLink(data, fromServer);
	};

	service.getDefault = function () {
		return {
			lhs: 'Drag source term',
			rhs: 'Drag target term',
			relationType: ''
		};
	};

	service.compare = TermLink.compare;

	return service;
}]);
