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

var checkExist =  function (resp) {
	var save_obj = Object.assign({}, resp.para, resp.data);
	var f_filter = resp.para;
	DataBase.findDocuments(f_filter, function (err, docs) {
		if (err) {
			console.log('[fail] checkExist findDocuments');
		} 
		if (docs.length === 0) {
			DataBase.insertDocuments(save_obj, InsertCallback);
		} else {
			//console.log('Exist');
		}
	});
}

var HtmlParserCallback = function (resp) {
	if (resp.success) {
		checkExist(resp);
		//console.log('[success][HP][' + resp.para.type + '][' + resp.para.company + '][' + resp.para.year + '][' + resp.para.season + ']');
	} else {
		console.log('[fail][HP][' + resp.para.type + '][' + resp.para.company + '][' + resp.para.year + '][' + resp.para.season + ']');
	}
}

var TwseRequestCallback = function (resp) { 
	if (resp.success) {
		HtmlParser.parse(resp.para, resp.body, HtmlParserCallback);
	} else {
		console.log('[fail][TR][' + resp.para.type + '][' + resp.para.company + '][' + resp.para.year + '][' + resp.para.season + ']');
		//console.log(resp.body);
	}
}

var Run = function (para) {
	var parameter = Object.assign({}, para);
	var f_filter = para;
	DataBase.findDocuments(f_filter, function (err, docs) {
		if (err) {
			console.log('[fail] checkExist findDocuments');
		} 
		if (docs.length === 0) {
			var TR = new TwseRequest;
			TR.getData(parameter, TwseRequestCallback);
		} else {
			//console.log('Exist');
		}
	});
}

process.argv.forEach((val, index) => {

  if (index >= 2) {
	var company = val;
	for (var y = 102; y <= 106; y++) {
		var tmp = '000' + y;
		var year = tmp.substring(tmp.length - 3, tmp.length);
		for (var s = 1; s <= 4; s++) {
			var tmp = '000' + s;
			var season = tmp.substring(tmp.length - 2, tmp.length);
			for (var type = 1; type <= 4; type++) {
				var para = {
					type: type,
					company : String(company),
					year: String(year),
					season: String(season)
				};
				Run(para);
			}
		}
	}
  }
  
 // Run({
//	type: 4,
//	company : ${val},
//	year: '103',
//	season: '03'
 //});
});

// Example


module.exports = {  
  version : '1.0',
  Run : Run
};
