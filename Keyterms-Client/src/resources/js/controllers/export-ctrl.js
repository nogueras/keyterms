/*  * NOTICE  *  */
app.controller('export-ctrl', ['$scope', 'globals', 'ApiUrl', function ($scope, globals, apiUrl) {
	console.log('Export ctrl loaded!');

	$scope.pageName = 'Export';

	// for ng-repeats
	$scope.fileTypes = globals.supportedFileTypeList;

	$scope.formData = {};
	// Tags temporarily stripped out
	// $scope.formData.tagList = [];
	// $scope.formData.tagStr = '';
    $scope.formData.creation = {};
    $scope.formData.lastMod = {};
    $scope.formData.creation.startDate = '';
    $scope.formData.creation.endDate = '';
    $scope.formData.lastMod.startDate = '';
    $scope.formData.lastMod.endDate = '';
    $scope.formData.langCode = '';
	$scope.formData.langCode = globals.langCodeList[12];
	$scope.formData.fileType = globals.supportedFileTypeList[0];

	// JSON Export Query String
    $scope.queryString = 'api/download/search?' +
        'creationStartDate=' +	$scope.formData.creation.startDate +
        '&creationEndDate=' + 	$scope.formData.creation.endDate +
        '&modifiedStartDate=' + 	$scope.formData.lastMod.startDate +
        '&modifiedEndDate=' + 	$scope.formData.lastMod.endDate +
        '&langCode=' + 			$scope.formData.langCode;
    $scope.apiUrl = apiUrl;

	$scope.buildQuery = function () {
		var nextChar = '?';
		var baseURL = apiUrl + 'api/download/glossary';
		var paramVals = [$scope.formData.creation.startDate, $scope.formData.creation.endDate,
			$scope.formData.lastMod.startDate, $scope.formData.lastMod.endDate, $scope.formData.langCode.value, $scope.formData.fileType.value];

		var paramNames = ['creationStartDate=', 'creationEndDate=', 'modifiedStartDate=', 'modifiedEndDate=', 'langCode=', 'fileType='];

		paramVals.forEach(function (param, index) {

			if(param !== ''){

				baseURL = baseURL + nextChar + paramNames[index] + param;
				nextChar = '&';
			};
        });
		console.log(baseURL);
		return baseURL;

    };
    // Sense Tag methods
	$scope.addTag = function ($event) {
		//console.log($event);
		//console.log($scope.tagStr);

		if ($event.keyCode === 13) {
			$scope.formData.tagList.push($scope.formData.tagStr);
			$scope.formData.tagStr = '';
			$event.target.blur(); // un-focuses the input field
		}
	};
	$scope.removeTag = function ($index) {
		$scope.formData.tagList.splice($index, 1);
	};
}]);
