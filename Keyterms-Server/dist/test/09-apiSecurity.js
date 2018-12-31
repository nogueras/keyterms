/*  * NOTICE  *  */
var TestEnv = require('./env-setup').TestEnv;

// This is a list of every endpoint within the KeyTerms server, which is known to not require
// authentication and/or authorization to return a non-failure HTTP status code
var WHITELISTED_PATHS = [
	{method: 'GET',		path: ''},
	{method: 'GET',		path: 'login'},
	{method: 'POST',	path: 'login'},
	{method: 'GET',		path: 'api'},
	{method: 'GET',		path: 'api/api'},
	{method: 'GET',		path: 'api/docs'},
	{method: 'GET',		path: 'api/status'},
	{method: 'GET',		path: 'api/schema'},
	{method: 'GET',		path: 'api/enums'},
	{method: 'GET',		path: 'api/langcodes'},
];

var EXPECTED_RESPONSES = {
	'api': 401,
	'upload': 302,
	'admin': 302
};

describe('09-01 Verifying the API is secure at all endpoints', function () {
	var env = new TestEnv();

	var request = env.request;

	var processed = 0;
	var secureRoutes = [];

	var findAuthMiddleware = function (layer) {
		return !!layer.name && layer.name === 'authenticate';
	};

	var authIndex = env.app._router.stack.findIndex(findAuthMiddleware);

	// Only show the routes mounted after passport.initialize() is mounted
	var routes = env.app._router.stack.slice(authIndex + 1);

	var regex1 = '\\/?';
	var regex2 = '(?=\\/|$)';
	var regex3 = /^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//;

	var print = function (path, layer) {
		if (layer.route) {
			layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
		}
		else if (layer.name === 'router' && layer.handle.stack) {
			layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))));
		}
		else if (layer.method) {
			secureRoutes.push({method: layer.method.toUpperCase(), path: path.concat(split(layer.regexp)).filter(Boolean).join('/')});
		}

		processed++;
	};

	var split = function (thing) {
		if (typeof thing === 'string') {
			return thing.split('/');
		}
		else if (thing.fast_slash) {
			return '';
		}
		else {
			var match = thing.toString()
			.replace(regex1, '')
			.replace(regex2, '$')
			.match(regex3);

			return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>';
		}
	};

	routes.forEach(print.bind(null, []));

	var routeToUuid = function (r) {
		return `${ r.method }|${ r.path }`;
	};

	var urlParamRegex = /:(\d|\w)+/g;

	// tracks routes which have already been tested
	var endpointsTested = new Set(WHITELISTED_PATHS.map(routeToUuid));

	// log out the current user (TestEnv setup automatically logs in)
	it('should logout the test user', function (done) {
		request.get('/logout').expect(302, done);
	});

	// run a test on each endpoint, expecting every endpoint to 404
	for (let route of secureRoutes) {
		if (!endpointsTested.has(routeToUuid(route))) {
			route.path = '/' + route.path;

			it(`should test authentication on route: ${ route.method } ${ route.path }`, function (done) {
				var url = route.path.replace(urlParamRegex, TestEnv.mockMongoId);
				var expectedStatus = EXPECTED_RESPONSES[url.split('/')[1]] || 404;

				// request[ {{ VERB }} ]( {{ url }} )
				request[route.method.toLowerCase()](url)
				.expect(expectedStatus)
				.end( function (err) {
					endpointsTested.add(routeToUuid(route));
					done(err);
				});
			});
		}
	}

});
