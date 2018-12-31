/*  * NOTICE  *  */
app.factory('term-highlight.service', ['$rootScope', function ($rootScope) {
	var terms = {};

	var service = {};

	var onMouseEnter = function (index) {
		return function () {
			terms[index].forEach(function (e) {
				if (!!e) { e.addClass('term-highlight'); }
			});
		}
	};

	var onMouseLeave = function (index) {
		return function () {
			terms[index].forEach(function (e) {
				if (!!e) { e.removeClass('term-highlight'); }
			});
		}
	};

	// prevent "memory leaks" when changing pages
	$rootScope.$on('$routeChangeSuccess', function () {
		terms = {};
	});

	service.register = function (index, elem) {
		if (!angular.isElement(elem)) { throw new Error('elem is required to be a html element'); }

		if (!terms[index]) {
			terms[index] = [];
		}

		// bind event handlers?
		elem.on('mouseenter', onMouseEnter(index));
		elem.on('mouseleave', onMouseLeave(index));

		terms[index].push(elem);

		return terms[index].length - 1;	// return index of the item within the elements array
	};

	service.unregister = function (index, subIndex) {
		if (!terms[index]) { return false; }

		terms[index][subIndex].off('mouseenter mouseleave');
		terms[index][subIndex] = null;

		if (terms[index].length < 1) { terms[index] = undefined; }
	};

	return service;
}]);
