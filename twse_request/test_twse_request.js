var TwseRequest = require('./twse_request.js');

var testcase = [{
	type: 1,
	company : '2330',
	year: '106',
	season: '02'
}];

/*,{
	type: 2,
	company : '2208',
	year: '103',
	season: '02'
},{
	type: 3,
	company : '2208',
	year: '104',
	season: '03'
},{
	type: 4,
	company : '2208',
	year: '105',
	season: '04'
}]
*/

var callback = function (resp) { 
	if (resp.success) {
		console.log('[pass] TwseRequest testcase type :' + resp.para.type);
		console.log('type :' + resp.para.type);
		console.log('company :' + resp.para.company);
		console.log('year :' + resp.para.year);
		console.log('season :' + resp.para.season);
		console.log(resp);
	} else {
		console.log('[fail] TwseRequest testcase type :' + resp.para.type);
		console.log('error :' + resp.error);
		console.log('httpResponse :' + resp.httpResponse);
		console.log('body :' + resp.body);
	}
}

for (i = 0; i < testcase.length; i++) { 
	var para = testcase[i];
	var TR = new TwseRequest;
	TR.getData(para, callback);
}
