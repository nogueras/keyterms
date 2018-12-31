/*  * NOTICE  *  */
var log = require('../includes').log;
var ImporterBase = require('../importerBase');

class xlsParser extends ImporterBase {
	constructor (ws, glossary, base) {
		super(glossary, base);

		log.verbose('Initializing xls Parser...');

		this.ws = ws;
		this.headers = {};
        this.headerPos = {};
		this.orderedHeaders = {};
		this.parseHeader();
	}

	parseHeader () {
		log.verbose('Parsing header row...');
		var self = this;

		//list to contain all term notes
		self.orderedHeaders["notes"] = [];

		this.ws.getRow(1).values.forEach( function (val, index) {
			// creates mapping of header names to their column position
			if (index === 0) { return; }	// exceljs does not use the zero index
            self.headerPos[val] = index;
            self.headers[index] = val;

            var header = val.toLocaleLowerCase();

            //map each header to a specified type
            if(header.includes("entry")) {
            	self.orderedHeaders["entry"] = index;
			}

			else if(header.includes("field")){
            	self.orderedHeaders["field"] = index;
			}

			else if(header.includes("value")) {
            	self.orderedHeaders["value"] = index;
			}

			else if(header.includes("term") && header.includes("id")) {
            	self.orderedHeaders["termID"] = index;
			}

			else if(header.includes("lang")) {
            	self.orderedHeaders["language"] = index;
			}

			else if(header.includes("variety")) {
            	self.orderedHeaders["variety"] = index;
			}

			else if(header.includes("script")) {
            	self.orderedHeaders["script"] = index;
			}

			else if(header.includes("from")) {
            	self.orderedHeaders["linkedFrom"] = index;
			}

			else if(header.includes("type")) {
            	self.orderedHeaders["linkType"] = index;
			}

			else if(header.includes("note")) {
            	self.orderedHeaders["notes"].push(val);
			}

			else {
            	//throw new Error('Incorrect headers');
			}
        });
		log.verbose('headers: ', self.orderedHeaders);
	}

	parse () {
		throw new Error('xls Parser is meant to be an abstract class');
	}
}

module.exports = xlsParser;
