/*  * NOTICE  *  */

app.controller('keytermsClient-ctrl', ['$scope', '$location', '$q', 'user.service', 'AppVersion', '$rootScope', '$uibModal', 'uiToast', 'ApiUrl', 'keytermsClient.service',
function ($scope, $location, $q, User, AppVersion, $rootScope, $uibModal, uiToast, ApiUrl, keytermsClient) {
	console.log('Main Ctrl loaded!');

	$scope.uiToast = uiToast;
	$scope.currentpageName = 'Search';
	$scope.user = User;
	$scope.logout = function () {
		User.logout().then(function (user) {
			keytermsClient.deleteLocalValue();
			$location.path('/login');
		});
	};

	$scope.tbVersion = AppVersion;

	// initialize
	var domQuery = 'nav.navbar ul.nav li > a[href="#' + $location.path() + '"]';
	var lastPage = angular.element(document.querySelector(domQuery)).parent();
	lastPage.addClass('active');

	$scope.$on('$viewContentLoaded', function (event) {
        if ( $rootScope.showGlossaryPopup ) {
            $uibModal.open({
                animation: false,
                templateUrl: 'glossaryPopup.html',
                size: 'md',
				scope: $scope,
				controller: function ($scope, $uibModalInstance) {
					$scope.saveAsDefault = false;

					$scope.close = function () {
						if($scope.saveAsDefault){
							var glossaryId = $scope.user.getUser().currentGlossary;
							$scope.user.updateUserDefaultGlossary(glossaryId)
							.then(function(){
								$scope.uiToast.trigger("Default glossary saved! You can update your default glossary in 'My Settings'.");
							});
						}
						$uibModalInstance.close();
					};
				}
            }).closed.then(function(){
                $rootScope.showGlossaryPopup = false;
			});
		}

        $scope.currentpageName = event.targetScope.pageName;

		lastPage.removeClass('active');
		var domQuery = 'nav.navbar ul.nav li a[href="#' + $location.path() + '"]';
		lastPage = angular.element(document.querySelector(domQuery)).parent().addClass('active');
	});

	$scope.mailto = window.mailto;

	$scope.apiUrl = ApiUrl;

	$scope.isGlossaryQC = function () {
		return User.getUser().isGlossaryQC;
	}
}]);
