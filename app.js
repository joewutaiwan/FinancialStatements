var TwseRequest = require('./twse_request/twse_request.js');
var HtmlParser = require('./html_parser/html_parser.js');
var util = require("util");

var para = {
	type: 4,
	company : '2498',
	year: '104',
	season: '04'
};

var HtmlParserCallback = function (resp) {
	if (resp.success) {
		console.log(resp.data);
	} else {
		console.log('[fail] HtmlParserCallback testcase type');
		console.log('error :' + resp.error);
	}
}

var TwseRequestCallback = function (resp) { 
	if (resp.success) {
		HtmlParser.parse(para, resp.body, HtmlParserCallback);
	} else {
		console.log('[fail] TwseRequest testcase type :' + resp.para.type);
		console.log('error :' + resp.error);
		console.log('httpResponse :' + resp.httpResponse);
		console.log('body :' + resp.body);
	}
}

TwseRequest.getData(para, TwseRequestCallback);