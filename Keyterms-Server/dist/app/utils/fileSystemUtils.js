/*  * NOTICE  *  */
var fs = require('fs');
exports.makeDirIfNotExists = function checkDirectorySyncMakeIfNot(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
};
