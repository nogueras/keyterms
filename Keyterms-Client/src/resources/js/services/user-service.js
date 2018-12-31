/*  * NOTICE  *  */
app.factory('user.service', ['$q', '$location', '$cookies', 'keytermsApi', function ($q, $location, $cookies, Keyterms) {

	// private variables here
	var user = {};

	var cookieOptions = {
		path: '/',
		domain: $location.host(),
		expires: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours (1/2 a day)
		secure: false
	};

	var setUser = function (_user) {
		if (angular.equals(user, _user)) {
			return;
		}
		user = _user;
		$cookies.putObject('keytermsuserdata', _user);
	};



	// public variable/methods here
	var service = {};


	service.lastPath = '/search';
	service.lastModal = {};
	service.lastModal.dismiss = angular.noop;
	service.isLoggedIn = function () {
		this.lastModal.dismiss();

		// Must check against cookie for cross-session sync
		var u = $cookies.getObject('keytermsuserdata');
		if (u === undefined || angular.equals(u, {})) {
			return false;
		} else {
			user = u;
			return true;
		}
	};

	service.updateUserDefaultGlossary = function (glossaryId) {
		var __user = null;
		return Keyterms.updateDefaultGlossary(glossaryId).then(function (response) {
			__user = response.data;
			return Keyterms.checkGlossaryPermissions();
		}).then(function (perms) {
			setUser(angular.extend(__user, perms.data));
		});
	};

    service.updateUser = function (updates) {
        if (updates.glossaryName && updates.currentGlossary && updates.langList) {
            var __user = null;
            return Keyterms.updateUserGlossary(updates.currentGlossary).then(function (httpRes) {
                __user = httpRes.data;
                return Keyterms.checkGlossaryPermissions();
            }).then(function (perms) {
                setUser(angular.extend(__user, perms.data));
            });
        }
    };

	service.logout = function () {
		user = {};
		$cookies.remove('keytermsuserdata');
		return Keyterms.logout();
	};

	service.getUser = function () {
		return user;
	};

    service.getCurrentGlossary = function () {
        return user.glossaries.find(glossary => glossary._id === user.currentGlossary);
    };

	service.checkUserCreds = function (__creds) {
		var credentials = {
			username: __creds.email,
			password: __creds.password
		};
		return new $q(function (resolve, reject) {
			var __user = {};

			Keyterms.validateUser(credentials).then(function (httpRes) {
				__user = httpRes.data;
				// TODO: revisit this
				return Keyterms.checkGlossaryPermissions();
			}).then(function (perms) {
				setUser(angular.extend(__user, perms.data));
				resolve(true);
			}).catch(function (err) {
				console.log(err);
				// TODO: navigate to where?
				reject(false);
			});
		});
	};

	return service;
}]);
