var Retriver = require('./twse_request/twse_request.js');

var para = {
	type: 1,
	company : 2495,
	year: 105,
	season: 3
}

var callback = function (resp) { 
	if (!resp.success) {
		console.log(resp.body);
	}
}

Retriver.getData(para, callback);

