/*  * NOTICE  *  */
// Triggers the blinking of the Language Code dropdown on the Search page
app.directive('lcBlink', function ($q, $timeout) {
	var delay = function (elem) {
		return new $q(function (resolve, reject) {
			$timeout(function () {
				elem.toggleClass('lc-blink');
				resolve(elem); // resolves elem to allow for .then chaining without wrapping in anon-fn
			}, 200);
		});
	};

	return {
		restrict: 'A',
		scope: {
			'lcBlink': '='
		},
		link: function (scope, elem, attrs) {
			scope.$watch('lcBlink', function (blink, b) {
				if (blink) {
					elem.addClass('lc-blink');
					//delay(elem).then(delay).then(delay).then(delay);
					delay(elem).then(delay);
				} else {
					elem.removeClass('lc-blink');
				}
			});
		}
	};
});

// based on http://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs
app.directive('ngEnterkey', function () {
	return function (scope, element, attrs) {
		element.bind('keydown', function (event) {
			if (!!event.which && event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnterkey);
				});

				event.preventDefault();
			}
		});
	};
});

app.directive('recentlyUpdated', function ($timeout) {
	return {
		restrict: 'C',
		link: function (scope, elem) {
			elem.addClass('highlight');
			$timeout(function () {
				elem.removeClass('highlight');
				elem.removeClass('recently-updated');
			}, 1250);
		}
	};
});

// http://www.html5rocks.com/en/tutorials/dnd/basics/
// http://mereskin.github.io/dnd/
app.directive('dragLink', function () {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {

			if (attrs['dragLink'] === '' || attrs['dragLink'] === 'drag') {

				elem.prop('draggable', 'true');

				elem.bind('dragstart', function (e) {
					elem.css('opacity', 0.4);

					e.dataTransfer.effectAllowed = 'move';
					var dragData = JSON.stringify({
						text: elem.text(),
						termIndex: attrs['dragIndex']
					});
					e.dataTransfer.setData('text/plain', dragData);
				});

				elem.bind('dragend', function (e) {
					elem.css('opacity', 1.0);
				});
			}
			else if (attrs['dragLink'] === 'drop') {
				var lastClass = 'label-danger';
				elem.addClass('link-drop-target');

				elem.bind('dragover', function (e) {
					e.preventDefault();

					elem.removeClass('label-danger');
					elem.removeClass('label-success');
					elem.addClass('label-warning');
				});

				elem.bind('dragenter', function (e) {
					elem.removeClass('label-danger');
					elem.removeClass('label-warning');
					elem.removeClass('label-success');
					elem.addClass(lastClass);
				});

				elem.bind('dragleave', function (e) {
					elem.removeClass('label-danger');
					elem.removeClass('label-warning');
					elem.removeClass('label-success');
					elem.addClass(lastClass);
				});

				elem.bind('drop', function (e) {
					e.preventDefault();

					// DataTransfer Here
					var dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
					// scope.apply is needed here because this elem.bind callback isn't bound to the scope
					scope.$apply( function () {
						scope.linkData['_' + attrs['ngModel'].slice(9) + 'Index'] = dragData.termIndex;
					});
					elem.text(dragData.text);
					elem.removeClass('label-danger');
					elem.removeClass('label-warning');
					elem.addClass('label-success');
					lastClass = 'label-success';

					var getFormScope = function (s) {
						if (s.entryForm && '$dirty' in s.entryForm) {
							return s;
						}

						return s.$parent;
					};
					var s = getFormScope(scope.$parent);
					s.entryForm.$setDirty();

					return false;
				});

				// resets the drag bins to their default state once a link has been added
				scope.$on('termLinkAdded', function () {
					lastClass = 'label-danger';
					elem.removeClass('label-warning');
					elem.removeClass('label-success');
					elem.addClass('label-danger');
					var linkSide = attrs['ngModel'].slice(9) === 'source' ? 'lhs' : 'rhs';
					elem.text(scope.linkData[linkSide]);
				});
			}
		}
	};
});

app.directive('glossaryDropdown', ['user.service', '$route', '$rootScope', function (UserService, $route, $rootScope) {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'resources/templates/widgets/glossaryDropdown.html',
		link: function (scope, elem, attrs) {
			scope.user = UserService.getUser();
			scope.glossaryChange = function (glossary) {
				//Todo: lock the user out from interacting with the site until this change is complete
				UserService.updateUser({
					glossaryName: glossary.name,
					currentGlossary: glossary._id,
					langList: glossary.langList
				}).then(function(){
					if($rootScope.showGlossaryPopup) {
						$rootScope.showGlossaryPopup = false;
					}
					scope.user = UserService.getUser();
					$route.reload();
				});
			}
		}
	}
}]);

app.directive('langCodeDropdown', ['globals', 'user.service',
	function (globals, UserService) {
		return {
			restrict: 'E',
			//replace: true,
			scope: {
				binding: '=binding',
				langDefault: '=default'
			},
			templateUrl: 'resources/templates/widgets/langCodeDropdown.html',
			link: function (scope, elem, attrs) {
				var user = UserService.getUser();
				scope.list = globals.langCodeList.map(lc => globals.langCodeMap[lc]);
				scope.glossaryLangList = user.langList.map(lc => globals.langCodeMap[lc]);

				scope.codeFilter = '';

				// Initialize bindings
				if (!!scope.langDefault) {
					scope.model = globals.langCodeMap[scope.langDefault];
				}
				else if (scope.binding === undefined || scope.binding.value === undefined){
					scope.model = (scope.glossaryLangList.length > 0) ? scope.glossaryLangList[0] : scope.list[0];
				}
				else {
					scope.model = scope.binding;
				}

				var searchInput = elem.find('input');

				scope.focusInput = function () {
					if(!scope.isOpen) {
						return;
					}
					// This now targets the <ul> of the dropdown menu
					// 'false' means it places the bottom of the element to the bottom of the first scrollable ancestor
					// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
					searchInput[0].parentElement.parentElement.scrollIntoView(false);
					searchInput[0].select();
				};

				scope.onCodeChange = function (code) {
					scope.model = code;
					scope.$parent.$eval(`${ attrs['binding'] } = ${ JSON.stringify(code) }`);
					scope.isOpen = false;
				};

				scope.onCodeChange(scope.model);
			}
		}
	}]);
