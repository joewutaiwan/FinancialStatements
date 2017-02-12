var Retriver = require('./twse_request.js');

var testcase = [{
	type: 1,
	company : 2330,
	year: 105,
	season: 1
},{
	type: 2,
	company : 2495,
	year: 103,
	season: 2
},{
	type: 3,
	company : 2498,
	year: 104,
	season: 3
},{
	type: 4,
	company : 2330,
	year: 105,
	season: 4
}]

var callback = function (resp) { 
	if (resp.success) {
		console.log('[pass] testcase type :' + resp.para.type);
		console.log('type :' + resp.para.type);
		console.log('company :' + resp.para.company);
		console.log('year :' + resp.para.year);
		console.log('season :' + resp.para.season);
	} else {
		console.log('[fail] testcase type :' + resp.para.type);
		console.log('error :' + resp.err);
		console.log('httpResponse :' + resp.httpResponse);
		console.log('body :' + resp.body);
	}
}

for (i = 0; i < testcase.length; i++) { 
	var para = testcase[i];
	Retriver.getData(para, callback);
}
