var TwseRequest = require('./twse_request/twse_request.js');
var HtmlParser = require('./html_parser/html_parser.js');
var DataBase = require('./data_base/data_base.js');


CheckDocsContainData = function (para, docs) {
	if (!docs || docs.length === 0) {
		return false;
	}
	if (para.type === 1 && docs[0].hasOwnProperty('營業利益（損失）')) {
		//console.log('has 營業利益（損失）');
		return true;
	}
	if (para.type === 2 && docs[0].hasOwnProperty('股本合計')) {
		//console.log('has 股本合計');
		return true;
	}
	if (para.type === 3 && docs[0].hasOwnProperty('期初現金及約當現金餘額')) {
		//console.log('has 期初現金及約當現金餘額');
		return true;
	}
	if (para.type === 4 && docs[0].hasOwnProperty('期初餘額')) {
		//console.log('has 期初餘額');
		return true;
	}
	return false;
}

var InsertCallback =  function (err, result) {
	if (err) {
		console.log('[fail] insertDocuments');
	} else {
		//console.log('[pass] insertDocuments');
	}
}

var UpdateCallback = function (err, result) {
	//console.log('[pass] updateDocument', err, result);
}

var checkExist =  function (resp) {
	var save_obj = Object.assign({}, resp.para, resp.data);
	var f_filter = resp.para;
	DataBase.findDocuments(f_filter, function (err, docs) {
		if (err) {
			console.log('[fail] checkExist findDocuments', err, resp.para);
		} 
		if (!docs || docs.length === 0) {
			DataBase.insertDocuments(save_obj, InsertCallback);
		} else if (CheckDocsContainData(f_filter, docs) === false) {
			var u_update = {
				$set: save_obj 
			};
			DataBase.updateDocument(f_filter, u_update, UpdateCallback);
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
	if (resp.para.callback) {
		resp.para.callback(true);
	}
}

var Run = function (para) {
	var parameter = Object.assign({}, para);
	var f_filter = para;
	DataBase.findDocuments(f_filter, function (err, docs) {
		if (err) {
			console.log('[fail] checkExist findDocuments');
			para.callback(false);
		} 
		if (CheckDocsContainData(para, docs) === false) {
			var TR = new TwseRequest;
			console.log ("request for :", para);
			TR.getData(parameter, TwseRequestCallback);
		} else {
			para.callback(false);
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
