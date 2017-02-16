var TwseRequest = require('../twse_request/twse_request.js');
var HtmlParser = require('./html_parser.js');
var util = require("util");

var para = {
	type: 4,
	company : '2330',
	year: '105',
	season: '02'
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

var TR = new TwseRequest;
TR.getData(para, TwseRequestCallback);