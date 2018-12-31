/*  * NOTICE  *  */
app.controller('browse-ctrl', ['$scope', '$window', '$document', '$timeout', '$filter', 'keytermsClient.service', 'initData', 'globals',
function ($scope, $window, $document, $timeout, $filter, KeytermsClientInt, initData, globals) {
	$scope.pageName = 'Browse Terms';
	$scope.langCodeList = globals.langCodeList.map(lc => globals.langCodeMap[lc]);
	$scope.selectedLanguage = 'und';
	var STEP_INTERVAL = 30;
	var masterList;

	var stepBy3 = arr => $filter('stepBy')(arr, 3);

	var consumeSearchResults = function () {
		console.log('initData: ', initData);
		initData.forEach(term => {

			term.entryIds = Array.from(new Set(term.mongoIds.buckets.map(b => b.key)));
			return term.entryIds;
		});

		masterList = initData;

		$scope.loadingEvtFired = false;
		$scope.initialLoad = true;

		$scope.displayList = stepBy3(masterList.slice(0, STEP_INTERVAL * 2));
	};

	consumeSearchResults();



	// new-terms-icon
	// $scope.loadedTerms = [stepBy3(masterList.slice(0, STEP_INTERVAL * 2))];

	var windowElem = angular.element($window);

	$scope.$on('$viewContentLoaded', function () {
		console.log('content Loaded');

		// listen to window scroll event AFTER route content has loaded
		windowElem.bind('scroll', function (evt) {
			if ($window.scrollY >= ( $document[0].body.offsetHeight - 1000 ) ) {
				if ($scope.loadingEvtFired) { return false; }

				// $scope.$apply needed to propagate the changes to $scope.loadingEvtFired within jqLite.bind handler
				$scope.$apply(function () {
					$scope.loadingEvtFired = true;
					$scope.initialLoad = false;

					// new-terms-icon
					// var currentLength = $scope.loadedTerms.reduce((acc, arr) => acc + arr.length, 0);

					// todo: if need be do live load from server
					var animation_time = 350;

					$timeout( function () {
						// new-terms-icon
						// $scope.loadedTerms.push(stepBy3(masterList.slice(currentLength, currentLength + STEP_INTERVAL)));

						$scope.displayList = $scope.displayList.concat(
							stepBy3(masterList.slice($scope.displayList.length * 3, $scope.displayList.length * 3 + STEP_INTERVAL))
						);
						$scope.loadingEvtFired = false;
					}, animation_time);
				});
			}
		});
	});

	$scope.filterTerms = function() {
		KeytermsClientInt.browseTerms($scope.selectedLanguage.value).then(results => {
			initData = results;
			consumeSearchResults();
		});
	}
}]);


// probably not solution
app.filter('stepBy', function () {
	return function (arr, step) {
		var mod = arr.length % step;
		if (mod >= 1)
			{ var end = arr.splice((-1 * mod)); }

		var list = [];
		for (var i = 0; i < arr.length; i += step) {
			var sublist = [];
			for (var j = i; j < i + step; j++) {
				sublist.push(arr[j]);
			}
			list.push(sublist);
		}

		if (mod >= 1)
			{ list.push(end); }

		return list;
	}
});

app.directive('browseTermDisplay', function () {
	return {
		restrict: 'EA',
		templateUrl: 'resources/templates/widgets/browseTermDisplay.html',
		scope: {
			term: '=browseTermDisplay'
		},
		controller: ['$scope', '$timeout', 'keytermsClient.service', function ($scope, $timeout, KeytermsClientInt) {
			var STATUS = {
				'DONE': 0,
				'LOADING': 1,
				'ERRORED': 2
			};

			$scope.selectTerm = function () {
				// If the selected term is already open then simply close it
				if($scope.$parent.selected == $scope.term){
					$scope.$parent.selected = null;
					return;
				}

				$scope.status = STATUS.LOADING;
				$scope.$parent.selected = null;

				KeytermsClientInt.browseTermEntries($scope.term.entryIds)
				.then( function (entries) {
					$scope.status = STATUS.DONE;
					$scope.term.entries = entries;
					$scope.$parent.selected = $scope.term;
				})
				.catch( function (err) {
					$scope.status = STATUS.ERRORED;
					$timeout( function () {
						$scope.status = STATUS.DONE;
					}, 2000);
				});
			};
		}]
	}
});

app.directive('restrictWidth', function () {
	return {
		restrict: 'A',
		scope: true,		// child scope
		controller: angular.noop,
		link: function (scope, elem) {
			scope._widthLimit = elem[0].clientWidth;
		}
	}
});

app.directive('restrictedElement', function () {
	return {
		restrict: 'A',
		scope: false,		// shared scope
		require: ['^restrictWidth'],
		link: function (scope, elem) {
			// temp watcher fires when width property is set on shared scope by parent
			var w = scope.$watch('_widthLimit', function (oldVal, newVal) {
				if (!!scope._widthLimit) {
					elem.css('width', (scope._widthLimit - 2) + 'px');
					w();
				}
			});
		}
	}
});

app.directive('newItemsIndicator', function () {
	return {
		restrict: 'E',
		template: `<p><span>New Terms</span></p>`,
		controller: ['$scope', '$element', function ($scope, $element) {
			console.log($element);
		}]
	}
});
