/*
 * NOTICE
 * This software was produced for the U.S. Government and is subject to the
 * Rights in Data-General Clause 5.227-14 (May 2014).
 * Copyright 2018 The MITRE Corporation. All rights reserved.
 * Approved for Public Release; Distribution Unlimited. Case 18-2165
 *
 * This project contains content developed by The MITRE Corporation.
 * If this code is used in a deployment or embedded within another project,
 * it is requested that you send an email to opensource@mitre.org
 * in order to let us know where this software is being used.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
