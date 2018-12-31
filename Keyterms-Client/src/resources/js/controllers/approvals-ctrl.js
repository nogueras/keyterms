/*  * NOTICE  *  */
app.factory('approvals.service', function () {
	var service = {};

	service.sorting = {
		orderBy: 0,
		page: 1,
		itemsPerPage: 10
	};

	return service;
});

app.controller('approvals-ctrl', ['$scope', '$location', '$filter', 'keyterms.fnFactory', 'Nominations', 'approvals.service',
function ($scope, $location, $filter, fnFactory, Nominations, AvlSvc) {
	console.log('Approvals ctrl loaded!');

	$scope.pageName = 'Current Nominations';

	$scope.selectApproval = function (id) {
		$location.path('/approvals/review/' + id);
	};

	console.log(Nominations);

	/////////////// Binds all functions needed from Function Factory ////////////////////

	// pagination functions
	$scope.pageCount = fnFactory.pagination.pageCount;
	$scope.setPage = fnFactory.pagination.setPage;
	$scope.resetPagination = fnFactory.pagination.resetPagination;

	// control button functions
	$scope.selectAllBtn = fnFactory.controlButtons.selectAllBtn($scope);
	$scope.openTagModal = fnFactory.controlButtons.openBulkTagModal($scope);
	$scope.openDeleteModal = fnFactory.controlButtons.openBulkDeleteModal($scope);

	////////////////////////////// Ordering Logic //////////////////////////////////

	var filter = $filter('orderBy');

	$scope.ordering = [
		{ view: 'Date (oldest first)', field: 'creationDate' },
		{ view: 'Date (newest first)', field: '-creationDate' },
		{ view: 'Type', field: 'type' }
	].map((item, index) => {
		item._index = index;
		return item;
	});

	$scope.orderBy = $scope.ordering[AvlSvc.sorting.orderBy];

	$scope.changeOrder = function () {
		AvlSvc.sorting.orderBy = $scope.orderBy._index;
		AvlSvc.sorting.page = 1;

		$scope.searchResults = filter($scope.searchResults, $scope.orderBy.field);
		$scope.resetPagination();
	};

	$scope.$watch('itemsPerPage', function () {
		AvlSvc.sorting.itemsPerPage = $scope.itemsPerPage;
	});

	$scope.$watch('currentPage', function () {
		AvlSvc.sorting.page = $scope.currentPage;
	});

	///////////////////////////// Init Sequence //////////////////////////////////////

	$scope.paginationWatcher = angular.noop; // init as function which does nothing

	$scope.searchResults = Nominations; // store UserTerms into the "master" array
	$scope.searchResults = filter($scope.searchResults, $scope.orderBy.field);
	$scope.resetPagination( function () {
		this.currentPage = AvlSvc.sorting.page;
		this.itemsPerPage = AvlSvc.sorting.itemsPerPage;
	}); // initializes pagination logic

}]);
