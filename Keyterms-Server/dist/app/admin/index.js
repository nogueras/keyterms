/*  * NOTICE  *  */
var path = require('path');
var express = require('express');
var auth = require('../auth').middleware;

var router = express.Router();

// Middleware
router.use('/static', express.static(path.join(__dirname, 'public')));

router.use(auth.authenticate.processCert);
router.use(auth.authenticate.verifyRequest);

router.get('/logout', (req, res) => res.redirect('/logout'));

/**
 * @api {get} /admin admin web client
 * @apiName Administration Client
 * @apiGroup Administration
 * @apiVersion 3.0.0
 * @apiDescription Returns the admin web client, viewable by a browser
 *
 */
router.get('/(*)?', function(req, res, next) {
	req.user.populate([
		{
			path: 'currentGlossary',
			model: 'Glossary',
			select: 'name abbreviation'
		}, {
			path: 'glossaries',
			model: 'Glossary',
			select: 'name abbreviation'
		}
	]).execPopulate()
	.then( function (_user) {
		var user = _user.toObject();
		user.password = undefined;
		user.isGlossaryAdmin = (req.glossary.admins.indexOf(user._id) !== -1);
		user.isGlossaryQC = (req.glossary.qcs.indexOf(user._id) !== -1);

		res.render('admin', {user: JSON.stringify(user)});
	})
	.catch(next);
});

module.exports = router;
