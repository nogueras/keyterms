/*  * NOTICE  *  */
app.controller('tags-ctrl', ['$scope', '$route', '$uibModal', 'tagList', 'keytermsApi', 'user.service',
function ($scope, $route, $uibModal, tagList, KeyTerms, UserSvc) {
	console.log('Tags ctrl loaded!');

	$scope.pageName = 'Manage Tags';
	$scope.qc = UserSvc.getUser().isGlossaryQC;

	// live data demo
	// Sort the tag list case insensitively
	$scope.tagList = tagList.sort(function(a, b){
		var aTag = a.content.toUpperCase();
		var bTag = b.content.toUpperCase();
		if (aTag > bTag){
			return 1;
		} else if (aTag < bTag){
			return -1;
		} else {
			return 0;
		}
	});

	$scope.openRenameModal = function (index) {
		var modalInstance = $uibModal.open({
			animation: false,
			templateUrl: 'resources/templates/modals/editTag.html',
			controller: function ($scope, $uibModalInstance) {
				$scope.tag = Object.assign({}, tagList[index]);

				$scope.ok = function () {
					KeyTerms.renameTag(tagList[index]._id, $scope.tag.content).then(function (res) {
						if (res.status === 200) {
							$uibModalInstance.close($scope.tag);
							$route.reload();
						} else {
							$uibModalInstance.dismiss();
							console.log('tag unchanged');
							// TODO: add error message to user here
						}
					});
				};

				$scope.cancel = function () {
					$uibModalInstance.dismiss();
				};
			},
			size: 'lg'
		});

		modalInstance.result.then(function (res) {
			$scope.tagList.splice(index, 1);
		});
	};

	$scope.openDeleteModal = function (index) {
		var modalInstance = $uibModal.open({
			animation: false,
			templateUrl: 'resources/templates/modals/deleteModal.html',
			controller: function ($scope, $uibModalInstance) {

				$scope.ok = function () {
					KeyTerms.deleteTag(tagList[index]._id).then(function (res) {
						if (res.status === 204) {
							$uibModalInstance.close($scope.tag);
							tagList.splice(index, 1);
						} else {
							$uibModalInstance.dismiss();
							console.log('tag not deleted');
							// TODO: add error message to user here
						}
					});
				};

				$scope.cancel = function () {
					$uibModalInstance.dismiss();
				};
			},
			size: 'lg'
		});

		modalInstance.result.then(function (res) {
			$scope.tagList.splice(index, 1);
		});
	};
}]);
