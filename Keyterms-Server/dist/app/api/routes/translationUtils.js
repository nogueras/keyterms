/*  * NOTICE  *  */
var fs = require('fs');
var path = require('path');

// GET /api/langcodes - returns JSON of all the supported language codes
exports.langCodes = function (req, res) {
    res.json(JSON.parse(fs.readFileSync(path.join(__dirname, '/../../utils/langCodes.json'), 'utf8')));
};
