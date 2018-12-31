/*  * NOTICE  *  */
var xlsParser = require('./../xlsAbstract');
var NLP = require('./../../../../utils/nlpServices');
var log = require('../../includes').log;

class simple extends xlsParser {
    parse() {

        var self = this;
        var lastEntryId = 0;
        var langCodeMap = {};
        var promises = [];

        Object.keys(self.headerPos).forEach( function (header) {
            promises.push(new Promise(function (resolve, reject) {
                NLP.getISO(header)
                    .then( function (res) {

                        if (res.length != 0) {
                            langCodeMap[res[0].english_name] = res[0].code;
                        }
                        resolve(true);
                    })
                    .catch( function (err) {
                        log.error(err);
                    })
            }))
        })

       return Promise.all(promises)
        .then( function (res) {
            console.log("testing here");
            return new Promise( function (resolve) {

                self.ws.eachRow( function (row, rowNum) {

                    log.verbose('Parsing row #', rowNum);
                    if (rowNum < 2) { return; }

                    // handy shortcut function that references the header map
                    // and returns the value of the row's cell via column name
                    var extract = function (field) {
                        return row.values[self.headerPos[field]];
                    };

                    // add entry to import queue
                    if (lastEntryId > 0) {
                        self.queueEntry(lastEntryId);
                    }

                    var entry = self.createEntry();
                    lastEntryId = rowNum - 1;

                    Object.keys(self.headerPos).forEach( function (header) {
                        //----- TAG LOGIC --------
                        if (header.toLowerCase().includes("tags")) {

                            var temp = extract(header);
                            var tempArr = temp.split(",");

                            tempArr.forEach( function (str) {
                                entry.tags.push(str);
                            });
                        }

                        //------ NOTE LOGIC -----
                        else if (header.toLowerCase().includes("note")) {

                            if(extract(header) != null) {
                                var note = {};
                                note.text = extract(header);

                                if (header.includes("_")) {
                                    note.type = header.slice(header.indexOf("_") + 1).toLowerCase();
                                }

                                else {
                                    note.type = "general";
                                }

                                entry.notes.push(note);
                            }
                        }

                        //set entry type if one is given. 'term' is default
                        else if (header.toLowerCase().includes("EntryType")) {
                            entry.type = extract(header);

                        }

                        //------ TERM LOGIC ---------
                        else {

                            var term = {};
                            term.termText = extract(header);
                            term.langCode = langCodeMap[header];
                            entry.terms.push(term);

                        }
                    })

                    // update entry within entries map
                    self.entries[rowNum - 1] = entry;

                });
                console.log("lastEntry: ", lastEntryId);
                self.queueLastEntry(lastEntryId, resolve);
            });
        })

    }
}

module.exports = simple;
