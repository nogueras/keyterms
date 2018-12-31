/*  * NOTICE  *  */
app.directive('termBadge', ['$compile', '$sce', function ($compile, $sce) {
	return {
		restrict: 'E',
		scope: {
			'term': '=term',
			'index': '=index',
			'delta':	'=delta'
		},
		// controller: ['$scope', function ($scope) {
		//
		// }],
		link: function (scope, elem, attrs) {

			//var icon = '<div class="term-index text-muted">{{::(index - 0) + 1}}</div>';

			if (scope.term.src === 'nlp') {

				var icon = '<span ng-class="{\'editted-nlp-badge\': term.isEdit || delta.terms.mod[term._id]}" class="nlp-badge" tooltip-enable="!term.isEdit" uib-tooltip-html= "tip" tooltip-class="nlp-badge-help"  tooltip-placement="left">NLP</span>';

				var tipHtml = 'This term is a computer-generated transliteration';

				if (scope.term.variety !== 'Original Text' && scope.term.variety !== undefined) {
					tipHtml += `<br><br><i>Term Variety:</i>&nbsp;&nbsp;<b>${scope.term.variety}</b>`;
				}

				scope.tip = $sce.trustAsHtml(tipHtml);
			}

			var template = angular.element(icon);
			var link = $compile(template);
			elem.replaceWith(link(scope));
		}
	}
}]);

app.directive('termText', ['term-highlight.service', function (HLSvc) {
	return {
		restrict: 'AE',
		transclude: true,
		template:
		'<ng-transclude>' +
		'<div class="term-index text-muted">{{::index + indexOffset + 1}}</div>{{ termText }}' +
		'</ng-transclude>',
		scope: true,
		link: function (scope, elem, attrs) {

			scope.term = (!scope.term) ? {termText: ''} : scope.term;	// default termText to empty string if neither $eval or scope.term exist

			scope.termText = scope.$eval(attrs.termText) || scope.term.termText;
			scope.index = scope.$eval(attrs.index) || scope.index;
			scope.indexOffset = (!!scope.indexOffset) ? scope.indexOffset : 0;

			var indexWatcher = angular.noop;

			var registerId = -1;

			if (!!attrs.watchIndex) {
				indexWatcher = scope.$watch(
					function () { return scope.$eval(attrs.index) || scope.index },
					function (newVal, oldVal) {

						if(newVal !== undefined && oldVal !== undefined) {

							if(registerId > -1) {
								HLSvc.unregister(oldVal, registerId);
							}
							registerId = HLSvc.register(parseInt(newVal, 10), elem);
						}
					}
				)
			} else {
				registerId = HLSvc.register(scope.index, elem);
			}

			scope.$on('$destroy', function () {
				indexWatcher();		// manually unbind watcher, if added to scope
				HLSvc.unregister(scope.index, registerId);
			});
		}
	}
}]);

app.directive('nominationButtons', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'resources/templates/widgets/nominationButtons.html'
	};
});

app.directive('termCommentButton', [ function () {
	return {
		restrict: 'EA',
		scope: { 'term': '=term' },
		template: '<button class="btn btn-default btn-sm comment-button" ng-click="term.isNotesShowing = !term.isNotesShowing">\n' +
		'                            <i class="fa fa-commenting-o text-muted"></i>\n' +
		'                            <i class="fa fa-plus text-muted is-editable" ng-if="isEditable"></i>\n' +
		'                            <i class="fa fa-pencil text-muted comment-changes" ng-if="hasChanges"></i>\n' +
		'                        </button>',
		link: function (scope, elem, attrs) {
			scope.isEditable = attrs['isEditable'] === 'true' || false;
			scope.hasChanges = attrs['hasChanges'] === 'true' || false;
		}
	}
}]);

app.directive('termCommentContainer', [function () {
	return {
		restrict: 'E',
		templateUrl: 'resources/templates/modals/termComments.html',
		scope: {term: '=term', delta: '=delta'},
		link: function (scope, elem, attrs) {
			scope.isEditable = attrs['isEditable'] == 'true' || false;
		}
	};
}]);

app.directive('tagAuto', ['keytermsApi', function (KeyTerms) {

	var _cslRegex = /^(?:\w|\d| )+(?:, ?(?:\w|\d|(?: \w)|(?: \d) )+)*$/;

	return {
		restrict: 'E',
		scope: {
			inputModel: '='
		},
		templateUrl: 'resources/templates/widgets/autoComplete.html',
		controller: ['$scope', function($scope) {

			$scope.isAutoLoading = false;
			$scope.isOpen = false;
			$scope.autocomplete = function () {

				if (!$scope.inputModel || $scope.inputModel.length < 3) {
					$scope.isOpen = false;
					return;
				}

				if ($scope.inputModel.indexOf(',') !== -1) {
					$scope.isOpen = false;
					return;
				}

				$scope.isAutoLoading = true;
				KeyTerms.autocomplete($scope.inputModel)
				.then(function(response) {
					$scope.isOpen = true;
					$scope.options = response.data;
					$scope.isAutoLoading = false;
				})
				.catch( function (err) {
					console.log(err);
					$scope.isAutoLoading = false;

				});
				console.log('inputModel: ', $scope.inputModel);
			};

			$scope.chooseTag = function (text) {
				$scope.inputModel = text;
				$scope.isOpen = false;
			}
			//var input = element.find('ng-transclude').contents()


			// if(!compiled) {
			// 	compiled = true;
			// 	$compile(input)(scope);
			// }
		}]

	};

}]);
