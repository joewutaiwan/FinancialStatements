var DataBase = require('./data_base/data_base.js');
var assert = require('assert');

var findCallback = function (err, docs) {
	assert.equal(err, null);
	console.log(docs);
	console.log('[pass] findDocuments');
}

var UpdateCallback = function (err, result) {
	assert.equal(err, null);
	console.log('[pass] updateDocument');
	var f_filter = {
		'testa': {$exists :true},
	};
	DataBase.findDocuments(f_filter, findCallback);
}
var u_filter = {
	"company": "2208", "year":"105", "season": "03", "type":4
};

var u_update = {
	$set: {'testa': 'hi' } 
};
DataBase.updateDocument(u_filter, u_update, UpdateCallback);
