/*  * NOTICE  *  */

app.controller('review-ctrl', ['$scope', '$uibModal', '$location', 'globals', 'components.entry', 'keytermsClient.service', 'Nomination', 'user.service',
function ($scope, $uibModal, $location, globals, Entry, KeytermsClientInt, Nomination, User) {
	console.log('Review ctrl loaded!');
	console.log('Delta: ', Nomination.delta);

	var user = User.getUser();

	$scope.pageName = 'Approve Modification';
	$scope.viewScopeList = globals.viewScopeList;
	$scope.globals = globals;
	$scope.glossaryName = user.glossaryName;

	if (user.isAdmin){
		// Admins can always approve nominations
		$scope.canApprove = true;
	} else if (user.isGlossaryQC) {
		// GlossaryAdmins and GlossaryQC's can approve nominations for their glossary
		$scope.canApprove = user.currentGlossary === Nomination.data.glossary;
	} else {
		$scope.canApprove = false;
	}

	if (Nomination.isGarbage) {
		$scope.statusMessage = 'Good news! The changes proposed by this nomination have either been implemented already OR were made invalid by subsequent changes. This nomination can safely be removed!';
	} else if ($scope.canApprove) {
		$scope.statusMessage = 'You are currently acting as QC for ' + user.glossaryName + '.';
	} else {
		$scope.statusMessage = 'You do not have permission to act as QC for ' + user.glossaryName + '.';
	}

	$scope.nomType = Nomination.type;
	$scope.nomId = Nomination._id;

	switch($scope.nomType){
		case 'add':
			$scope.buttonText = 'New Entry';
			$scope.current = Nomination.data;
			$scope.current.viewScope = globals.viewScopeList.find(v => v.value === $scope.current.viewScope);
			$scope.current.editScope = globals.editScopeList.find(v => v.value === $scope.current.editScope);
			break;
		case 'del':
			$scope.buttonText = 'Deletion';
			$scope.current = Nomination.originalEntry;
			break;
		case 'mod':
			$scope.buttonText = 'All Modifications';
			$scope.current = Nomination.originalEntry;
			break;
	}

	$scope.delta = Nomination.delta;
	$scope.nomination = Nomination;
	//console.log("Nomination: ", $scope.nomination);

	$scope.approve = function () {
		console.log('approve called');
		var data = {};	// TEMP FIX, deltas do not need this feature

		// TODO: re-write logic to strip data object of client-only fields
		KeytermsClientInt.approveNomination(Nomination._id, data)
		.then(function (res) {
			console.log(res);
			$location.path('/approvals');
		})
		.catch(function (err) {
			console.log(err);
		});
	};

	$scope.reject = function () {
		console.log('reject called');
		KeytermsClientInt.rejectNomination(Nomination._id)
		.then(function (res) {
			console.log(res);
			$location.path('/approvals');
		})
		.catch(function (err) {
			console.log(err);
		});
	};
}]);
