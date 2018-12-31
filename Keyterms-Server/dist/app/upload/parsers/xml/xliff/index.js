/*  * NOTICE  *  */
var Parsers = {
	v2: {
		0: require('./formats/v2.0.js')
	},
	v1: {
		2: require('./formats/v1.2.js')
	}
};

var route = function (req) {
	var ParserClass = null;

	switch (req.body.format) {
		case 'v1.2':
			ParserClass = Parsers.v1[2];			break;
		case 'v2.0':
			ParserClass = Parsers.v2[0];			break;
	}

	if (!ParserClass) {
		throw new Error(`Invalid Parser format [${req.body.format}] for ext [${req.body.ext}]`);
	}

	var base = {
		viewScope: req.body.vs,
		createdBy: req.user._id,
		notes: [{
			createdBy: req.user._id,
			type: 'source',
			text: `THIS ENTRY WAS IMPORTED FROM ${req.originalFileName} BY ${req.user.fullName} (${req.user.email}) ON ${(new Date()).toLocaleString()}`
		}]
	};

	var parser = new ParserClass(req, base);
	return parser.parse();
};

module.exports = {
	Parsers: Parsers,
	route: route
};
