/*  * NOTICE  *  */
app.controller('search-ctrl', ['$scope', '$location', 'keyterms.fnFactory', 'keytermsClient.service', 'isInitQuery',
function ($scope, $location, fnFactory, KeytermsClientInt, isInitQuery) {
	console.log('Search ctrl loaded!');
	console.log('isInitQuery: ', isInitQuery);

	$scope.pageName = 'Search';
	$scope.querying = false;
	$scope.initialQuery = isInitQuery;
	//$scope.initialQuery = false;
	isInitQuery = false;

	$scope.glossScopes = [	{name: 'Current Glossary', value: 'current'},
							{name: 'My Glossaries', value: 'my'},
							{name: 'All Glossaries', value: 'all'}];

    $scope.glossScope = $scope.glossScopes[0];

	$scope.encode = encodeURIComponent;

	$scope.searchTerm = {
		term: '',
		langCode: {},
		onClick: function () {
			// prevents user from spamming queries
			if ($scope.querying || !this.term) {
				return false;
			} else if (angular.equals(this.langCode, {})) {
				$scope.noSelectedLC = true;
				return false;
			}
			// shows user query is executing
			$scope.querying = true;
			$scope.noSelectedLC = false;
			$scope.initialQuery = false;

			// store it locally
			$scope.lastSearch = {term: this.term, langCode: this.langCode};
			KeytermsClientInt.storeLocalValue('search', 'lastSearch', { term: this.term, lc: this.langCode });
			KeytermsClientInt.searchTerms(this.term, this.langCode.value, $scope.glossScope)
			.then(function (termList) {
				$scope.searchResults = termList;
				$scope.resetPagination();
				$scope.querying = false;
			}).catch(function (err) {
				console.log(err);
				$scope.querying = false;
			});
		}
	};

	$scope.setGlossScope = function (newGlossScope) {
		$scope.glossScope = newGlossScope;
    }

	$scope.advSearch = function () {
		$scope.initialQuery = false;
		$scope.showAdvanced = true;
	};

	// Runs a search on the last term stored (if one exits)
	var temp = KeytermsClientInt.getLocalValue('search', 'lastSearch');
	if (!!temp) {
		$scope.searchTerm.term = temp.term;
		$scope.searchTerm.langCode = temp.lc;
		$scope.searchTerm.onClick();
	}

	$scope.searchResults = [];
	$scope.paginationWatcher = angular.noop; // init as function which does nothing

	// pagination functions
	$scope.pageCount = fnFactory.pagination.pageCount;
	$scope.setPage = fnFactory.pagination.setPage;
	$scope.resetPagination = fnFactory.pagination.resetPagination;

	// control button functions
	$scope.selectAllBtn = fnFactory.controlButtons.selectAllBtn($scope);
	$scope.anyChecked = fnFactory.controlButtons.anyChecked($scope);
	$scope.openTagModal = fnFactory.controlButtons.openBulkTagModal($scope);
	$scope.openDeleteModal = fnFactory.controlButtons.openBulkDeleteModal($scope);
    $scope.exportSelected = fnFactory.controlButtons.exportSelected($scope);
}]);
