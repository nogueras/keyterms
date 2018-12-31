/*  * NOTICE  *  */
"use strict";

(function() {
	angular.module('kt-upload', ['ui.bootstrap'])

	.constant('Includes', JSON.parse(___includes___))

	.controller('upload-ctrl', ['$scope', '$http', 'Includes', function ($scope, $http, Includes) {
		var reset = function () {
			var clean = {
				glossaries: '',
				glossary: '',
				file: {},
				ext: '',
				format: '',
				generateTag: false
			};
			return Object.assign({}, clean);
		};
		$scope.fm = reset();

		$scope.user = Includes.user;
		$scope.loading = false;
		$scope.msg = {
			text: '',
			show: false,
			format: 'text-muted'
		};
		$scope.fm.glossaries = Includes.glossaries;
		$scope.currentGlossary = Includes.user.currentGlossary;

		$scope.fm.glossaries.forEach(function(gloss){

			if(gloss._id === $scope.currentGlossary){
				$scope.fm.glossary = gloss;
			}
		});

		$scope.exts = Includes.fileTypes;
		$scope.extHints = Includes.fileFormats;
		$scope.formats = [];
		$scope.setFormat = function () {
			$scope.formats = Includes.fileFormats[$scope.fm.ext].formats;
		};

		$scope.isFormValid = function () {
			return $scope.$invalid || angular.equals({}, $scope.fm.file);
		};

		$scope.submit = function () {
			// HTML5 FormData API is needed to send a multipart form via Angular
			var fd = new FormData();

			Object.keys($scope.fm).forEach( function (key) {
				fd.append(key, $scope.fm[key]);
			});

			$scope.loading = true;
			$scope.msg.text = 'Uploading...';
			$scope.msg.format = 'text-muted';
			$scope.msg.show = true;

			// The content-type cannot be set manually (specific issue with multipart forms)
			// therefore the use of angular.identity and 'Content-Type': undefined is required
			$http.post('/upload', fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			})
			.then( function (res) {
				console.log(res);
				$scope.errors = res.data;
				$scope.loading = false;
				if ($scope.isEmpty(res.data)) {
					$scope.msg.text = 'Upload successful';
					$scope.msg.format = 'text-success';
					$scope.msg.show = true;
				}
				else {
					$scope.msg.text = 'Upload complete with errors, see list below.';
					$scope.msg.format = 'text-danger';
					$scope.msg.show = true;
				}
			});
		};

		$scope.cancel = function () {
			$scope.fm = reset();
		};

		///////////// Error display logic /////////////////////
		$scope.isEmpty = function (obj) {
			return angular.equals({}, obj);
		};

		$scope.errors = {};

	}])

	.directive('ngUpload', function () {
		return {
			restrict: 'A',
			scope: {
				ngUpload: '='
			},
			link: function (scope, elem, attrs) {
				elem[0].value = null;	// resets input[type="file"] on page load. Needed because browser "stores" last uploaded file

				elem.bind('change', function (e) {
					console.log(e);
					var reader = new FileReader();
					reader.onload = function (load) {
						scope.$apply( function () {
							scope.ngUpload = angular.copy({}, e.target.files[0]);
							scope.ngUpload.data = load.target.result;
						});
					};
					reader.readAsDataURL(e.target.files[0]);
				});
			}
		}
	})

	.filter('importError', function () {
		return function (input, field) {
			var result = '';

			var keys = Object.keys(input);

			if (field == 'count') {
				return keys.length;
			}
			else if (field == 'path') {
				result += input[keys[0]].path + ' is a(n) ' + input[keys[0]].kind + ' field';

				keys.slice(1).forEach( function (key) {
					result += '\n' + input[key].path + ' is a(n) ' + input[key].kind + ' field';
				});
			}
			else {
				result += input[keys[0]][field];

				keys.slice(1).forEach( function (key) {
					result += '\n' + input[key][field];
				});
			}

			return result;
		}
	} )
})();
