var DataBase = require('./data_base/data_base.js');
var assert = require('assert');

var findCallback = function (err, docs) {
	assert.equal(err, null);
	console.log(docs);
	console.log('[pass] findDocuments');
}
var f_filter = {
		
};
DataBase.findDocuments(f_filter, findCallback);