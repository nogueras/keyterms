/*  * NOTICE  *  */
app.controller('add-entry-ctrl', ['$scope', '$anchorScroll', '$location', 'components.entry', '$routeParams', 'globals', 'user.service',
function ($scope, $anchorScroll, $location, Entry, $routeParams, globals, UserService) {

	console.log('Add Term ctrl loaded!');
	//console.log('globals: ', globals);

	$scope.pageName = 'Add Entry';
	$scope.viewing = 'edit';
	$scope.formView = 'terms';

	$scope.entryData = Entry.getDefault();
    $scope.userGlossary = UserService.getCurrentGlossary();
    console.log($scope.userGlossary);

	//Populate default language from URL
	var langList = globals.langCodeList.map(lc => globals.langCodeMap[lc]);

	//Populate entryData with a starting term if we've got that data to pull from the URL
	if ($routeParams.langCode && $routeParams.term) {
		var defaultLang = langList.find(lc => lc.value == $routeParams.langCode);
		$scope.entryData.termPopulate = {
			termText: decodeURIComponent($routeParams.term),
			langCode: defaultLang
		};
	}

    $anchorScroll.yOffset = 150;
    var goToTop = function() {

        $anchorScroll('top');
    }

    // formView navigation logic
    var formViews = ['terms', 'links', 'tags', 'notes', 'finish'];
    $scope.nextFormView = function () {
        $scope.formView = formViews[formViews.indexOf($scope.formView) + 1];
        goToTop();
    };
    $scope.lastFormView = function () {
        $scope.formView = formViews[formViews.indexOf($scope.formView) - 1];
        goToTop();

    };
}]);
