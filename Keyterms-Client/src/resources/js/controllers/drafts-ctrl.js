/*  * NOTICE  *  */
app.controller('drafts-ctrl', ['$scope', 'keyterms.fnFactory', 'Drafts', function ($scope, fnFactory, Drafts) {
	console.log('Drafts ctrl loaded!');

	$scope.pageName = 'Drafts';

	$scope.viewEntry = fnFactory.navigation.viewEntry;
	// TODO: Add loading logic (loading spinner gif)

	/////////////// Binds all functions needed from Function Factory ////////////////////

	// pagination functions
	$scope.pageCount = fnFactory.pagination.pageCount;
	$scope.setPage = fnFactory.pagination.setPage;
	$scope.resetPagination = fnFactory.pagination.resetPagination;

	// control button functions
	$scope.selectAllBtn = fnFactory.controlButtons.selectAllBtn($scope);
    $scope.anyChecked = fnFactory.controlButtons.anyChecked($scope);
    $scope.openTagModal = fnFactory.controlButtons.openBulkTagModal($scope);
	$scope.openDeleteModal = fnFactory.controlButtons.openBulkDeleteModal($scope);

	//////////////// Init Sequence ////////////////////////////

	$scope.paginationWatcher = angular.noop; // init as function which does nothing

	$scope.searchResults = Drafts; // store UserTerms into the "master" array
	$scope.resetPagination(); // initializes pagination logic
}]);
