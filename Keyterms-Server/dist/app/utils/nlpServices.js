/*  * NOTICE  *  */
// An Interface for using NLP Services in conjunction with KeyTerms

/**
 * [NLPServices on HTTPS]
 *
 * var fs = require('fs');
 *
 * // append these fields to the requestLib.defaults anonymous object
 * 		cert: fs.readFileSync('<path/to/cert'),
 *  	key: fs.readFileSync('<path/to/key'),
 *  	passphrase: '<the passphrase of the key>'		// THIS MAY NOT BE NEEDED
 *  	ca: fs.readFileSync('<path/to/ca'),
 */

var requestLib = require('request');
var ktConfig = require('../../config').server;
var nlpConfig = require('../../config').nlp;
var log = require('./logger').logger;
const https = require ('https');

var REQUEST_DEFAULTS = {
	method: 'GET',
	jar: true,
	json: true
};

if (nlpConfig.useHTTPS) {

    log.info('establishing SSL options..');
	var fs = require('fs');
	var nlpCerts = nlpConfig.certs;

	REQUEST_DEFAULTS.cert = fs.readFileSync(nlpCerts.cert);
	REQUEST_DEFAULTS.key = fs.readFileSync(nlpCerts.key);
	REQUEST_DEFAULTS.ca = nlpCerts.ca.map(ca => fs.readFileSync(ca));

   var options = {
        hostname: nlpConfig.hostname,
        port: nlpConfig.port,
        path: nlpConfig.endpoint,
        protocol: nlpConfig.protocol,
        key:  fs.readFileSync(nlpCerts.key),
        cert: fs.readFileSync(nlpCerts.cert),
        ca: nlpCerts.ca.map(ca => fs.readFileSync(ca)),
        passphrase: nlpCerts.passphrase,
        secureProtocol: ktConfig.TLSOptions.secureProtocol,
        rejectUnauthorized:  ktConfig.TLSOptions.rejectUnauthorized,
        method: 'GET'
      };

    var myCert = options.cert;
    //log.debug('creating agent');
    options.agent = new https.Agent({ myCert : myCert });
    //console.log("SSL OPTIONS:");
    //console.log(options);
}

var request = requestLib.defaults(REQUEST_DEFAULTS);
var Promise = require('bluebird');
var log = require('./logger').logger;


// HTTP FETCH
var fetch = function (url) {
	return new Promise( function (resolve, reject) {
		request(url, function (err, resp, body) {
			log.debug('request to NLP returned a: ' + resp.statusCode);
			if (err) {
				reject(err);
			}
			else {
				resolve(body);
			}
		});
	});
};


// SSL FETCH
var fetchHttps = function (requestParams) {

    options.path = nlpConfig.endpoint + requestParams;
    log.debug('NLP services request path: ' + options.path);
	return new Promise( function (resolve, reject) {
    log.debug('Connecting to NLPServices via SSL');
    https.get(options,(resp) => {
    var bodyChunks = [];
    //a chunk of data has been received
    resp.on('data', (chunk) => {
         bodyChunks.push(chunk);
       });

      //The whole response has been received.  Print out the result.
     resp.on('end', () => {
         var body = bodyChunks.join('');
         log.debug("DATA RECEIVED: "+ body);
        var data = '';
        try {
            data = JSON.parse(body);
        } catch (e) {
            log.debug('Error parsing JSON response:  '+e.message);
            reject(e);
        }
        resolve(data);
     }).on("error", (err) => {
          log.error("Error:  "+err.message);
          reject(err);
      });
   });
});
};


// SERVICE CALL
exports.callService = function (termText, langCode, index) {
	log.debug('Calling NLP Services...' + termText);
	index = (index === undefined) ? false : index;
	termText = encodeURIComponent(termText);

  // SSL FETCH
  if (nlpConfig.useHTTPS) {
    var path = `?srctxt=${termText}&lang=${langCode}&index=${index}`;
    log.debug('NLP PATH: '+path);
    return fetchHttps(path)
     .then( function (resp) {
		return resp;
	})
	.catch( function (err) {
		log.error('Error while querying NLP Services!'+err.message);
		return err;
	});
  }
  // HTTP FETCH
  else {

	var url = `${nlpConfig.protocol}\/\/${nlpConfig.hostname}:${nlpConfig.port}${nlpConfig.endpoint}?srctxt=${termText}&lang=${langCode}&index=${index}`;
	return fetch(url)
	.then( function (resp) {
		return resp;
	})
	.catch( function (err) {
		log.error('Error while querying NLP Services!'+err.message);
		return err;
	});
  }
};

exports.getISO = function (language) {

    log.debug('Calling language lookup Services...' + language);

    var url = `${nlpConfig.protocol}\/\/${nlpConfig.hostname}:${nlpConfig.port}${nlpConfig.endpoint}\/iso\/language?query=${language}`;

	return fetch(url)
	.then( function (resp) {
		return resp;
    })
	.catch( function (err) {
        log.warn('Error while querying NLP Services!');
        log.error(err);
        return err;
    });
};
