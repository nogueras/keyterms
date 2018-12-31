/*  * NOTICE  *  */
app.controller('user-entries-ctrl', ['$scope', 'keyterms.fnFactory', 'UserEntries', function ($scope, fnFactory, UserEntries) {
	console.log('User Terms ctrl loaded!');

	$scope.pageName = 'My Entries';

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
	$scope.exportSelected = fnFactory.controlButtons.exportSelected($scope);

	//////////////// Init Sequence ////////////////////////////
	$scope.paginationWatcher = angular.noop; // init as function which does nothing

	$scope.searchResults = UserEntries; // store UserTerms into the "master" array
	$scope.resetPagination(); // initializes pagination logic
}]);
