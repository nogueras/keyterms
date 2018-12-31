/*  * NOTICE  *  */
var fs = require("fs");
var git = require("git-rev");

var getGitHash = function () {
	return new Promise( function (resolve, reject) {
		git.short(resolve);
	});
};

getGitHash().then( function (hash) {
	console.log(hash);

	var configFile = fs.readFileSync('./src/gitHash.js').toString();
	//console.log(configFile);

	configFile += `var gitHash = '${hash}';\n`;
	//console.log(configFile);

	fs.writeFileSync('./public/keyterms/gitHash.js', configFile);
});
