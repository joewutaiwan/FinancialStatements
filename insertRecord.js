var TwseRequest = require('./twse_request/twse_request.js');
var HtmlParser = require('./html_parser/html_parser.js');
var DataBase = require('./data_base/data_base.js');

var InsertCallback =  function (err, result) {
	if (err) {
		console.log('[fail] insertDocuments');
	} else {
		//console.log('[pass] insertDocuments');
	}
}

var HtmlParserCallback = function (resp) {
	if (resp.success) {
		var save_obj = Object.assign({}, resp.para, resp.data);
		DataBase.insertDocuments(save_obj, InsertCallback);
		//console.log(save_obj);
		console.log('[success][HP][' + resp.para.type + '][' + resp.para.company + '][' + resp.para.year + '][' + resp.para.season + ']');
	} else {
		console.log('[fail][HP][' + resp.para.type + '][' + resp.para.company + '][' + resp.para.year + '][' + resp.para.season + ']');
	}
}

var TwseRequestCallback = function (resp) { 
	if (resp.success) {
		HtmlParser.parse(resp.para, resp.body, HtmlParserCallback);
	} else {
		console.log('[fail][TR][' + resp.para.type + '][' + resp.para.company + '][' + resp.para.year + '][' + resp.para.season + ']');
	}
}

var Run = function (para) {
	var parameter = Object.assign({}, para);
	var TR = new TwseRequest;
	TR.getData(parameter, TwseRequestCallback);
}

// Example
// Run({
// 	type: 1,
// 	company : '2330',
// 	year: '104',
// 	season: '04'
// });

module.exports = {  
  version : '1.0',
  Run : Run
};
