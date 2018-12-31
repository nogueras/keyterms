/*  * NOTICE  *  */
app.controller('edit-ctrl', ['$scope', '$anchorScroll', '$location', 'components.entry', 'Curr',
    function ($scope, $anchorScroll, $location, Entry, Curr) {
        // START HERE - ADDING SENSE CAUSES THE ERROR
        console.log('Edit ctrl loaded!');

        console.log(Curr);
        $scope.entry = Curr;

        $scope.pageName = 'Entry';
        $scope.viewing = 'edit';
        $scope.formView = 'terms';
        $scope.entryData = Curr;

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
