var DataBase = require('./data_base/data_base.js');
var assert = require('assert');

var findCallback = function (err, docs) {
	assert.equal(err, null);
	console.log(docs);
	console.log('[pass] findDocuments');
}
var f_filter = {
	//"company": "2330", "year":"106", "type":1
};
process.argv.forEach(function (val, index, array) {
	if (index < 2) {
		return;
	}
	switch(index) {
		case 2:
			console.log('company: ' + val);
			f_filter.company = val;
			break;
		case 3:
			console.log('year: ' + val);
			f_filter.year = val;
			break;
		case 4:
			console.log('season: ' + val);
			f_filter.season = val;
			break;
		case 5:
			console.log('type: ' + val);
			f_filter.type = parseInt(val, 10);
			break;
	}
	
});

DataBase.findDocuments(f_filter, findCallback);
