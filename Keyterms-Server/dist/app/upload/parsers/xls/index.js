/*  * NOTICE  *  */
var Excel = require('exceljs');

var Parsers = {
	_2d: require('./formats/2d'),
	_simple: require('./formats/simple')
};

var getParser = function (req, ws, base) {
	switch (req.body.format) {
		case '2D':
			return new Parsers._2d(ws, req.glossary, base);
		case 'simple':
			return new Parsers._simple(ws, req.glossary, base);
	}
};

var route = function (req) {
	var workbook = new Excel.Workbook();

	return workbook.xlsx.readFile(req.filePath)
	.then( function () {
		var ws = workbook.getWorksheet(1);

		var base = {

			viewScope: req.body.vs,
			createdBy: req.user._id,
			notes: [{
				createdBy: req.user._id,
				type: 'source',
				text: `THIS ENTRY WAS IMPORTED FROM ${req.originalFileName} BY ${req.user.fullName} (${req.user.email}) ON ${(new Date()).toLocaleString()}`
			}]
		};

        if (req.body.generateTag === 'true') {

        	var date = new Date();
            var importTag = date.toLocaleDateString() + ':' + date.getHours() + ':' + date.getMinutes();
            base.tags = [];
            base.tags.push(importTag);

        }

		var parser = getParser(req, ws, base);
		return parser.parse();
	});
};

module.exports = {
	Parsers: Parsers,
	route: route
};
