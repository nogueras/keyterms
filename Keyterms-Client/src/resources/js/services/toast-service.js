/*  * NOTICE  *  */
app.factory('uiToast', ['$rootScope', '$compile', '$timeout',
function ($scope, $compile, $timeout) {

	var _container =
`<div class="toast toast-container">
	<div class="toast toast-outer animate-repeat" ng-repeat="toast in toasts | orderBy: '-' track by $index">
		<div class="toast toast-inner">{{ toast.msg }} <span ng-if="toast.dismissible" class="toast-close" ng-click="dismiss(toast._index)">Dismiss</span></div>
	</div>
</div>`;

    var service = {};

    service.trigger = function (msg, duration) {
        var toast = {
            _index: _index++,
            _ot: $timeout( function () {
                var i = findToast(toast._index);
                if (i >= 0) { scope.toasts.splice(i, 1); }
            }, duration || 3000),
            msg: msg,
            dismissible: false
        };

        scope.toasts.push(toast);
    };

    service.isActive = function () {
        return scope.toasts.length > 0;
    };

    service.setLimit = function (l) {
    	if (typeof l === 'number') {
    		limit = 1;
		}
	};

    service.DEFAULT_LIMIT = 3;

	// create an isolated scope for all toasts to exist in
	var scope = $scope.$new(true);
	scope.toasts = [];						// list of toasts to be displayed

	var limit = service.DEFAULT_LIMIT;

	// ensure no more than n toasts are displayed at once
	scope.$watch(() => scope.toasts.length, function (newVal, oldVal) {
		if (newVal > limit) {
			scope.toasts.shift();
		}
	});

	scope.dismiss = function (index) {
		var i = findToast(index);
		$timeout.cancel(scope.toasts[i]._ot);
		if (i >= 0) { scope.toasts.splice(i, 1); }
	};

	// bind the container to the isolated scope and add it to the DOM
	var container = $compile(angular.element(_container))(scope);
	angular.element(document.body).prepend(container);

	// Used to create an "uuid" to track all toasts added
	var _index = 0;

	var findToast = function (index) {
		return scope.toasts.findIndex( item => item._index === index );
	};

	return service;
}]);
