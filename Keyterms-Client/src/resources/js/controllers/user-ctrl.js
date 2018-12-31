/*  * NOTICE  *  */
app.controller('user-ctrl', ['$scope', 'keytermsApi', 'user', 'uiToast', 'user.service',
function ($scope, KeyTerms, user, uiToast, UserService) {
    $scope.user = user;
    $scope.password = {};

    // Populate user's default glossary dropdown
    if(user.defaultGlossary){
		$scope.selectedDefaultGlossary = user.glossaries.find(function(glossary){
			if(glossary._id === user.defaultGlossary){
				return glossary;
			}
		});
	} else {
		$scope.selectedDefaultGlossary = false;
	}



	$scope.updateSelectedDefaultGlossary = function (glossary) {
		$scope.selectedDefaultGlossary = glossary;
	};

	$scope.submitDefaultGlossaryChange = function () {
		var glossaryId = $scope.selectedDefaultGlossary ? $scope.selectedDefaultGlossary._id : false;

		UserService.updateUserDefaultGlossary(glossaryId).then( function(response){
			console.log(response);
			uiToast.trigger('Your default glossary has been updated.');

		});
	};

    $scope.submit = function() {
        KeyTerms.changePassword(user, $scope.password).then(function(response) {
            $scope.attempted = true;
            $scope.succeeded = true;
        }, function(error) {
            $scope.attempted = true;
            $scope.succeeded = false;
        });
    };
}]);
