/*  * NOTICE  *  */
app.controller('view-entry-ctrl', ['$scope', '$location', 'keytermsClient.service', 'Entry', function ($scope, $location, KeytermsCLientInt, Entry) {
	console.log('View Entry ctrl loaded!');

	$scope.pageName = 'View Entry';
	console.log(Entry);

	$scope.entry = Entry;

	$scope.expandDraft = false;
}]);
