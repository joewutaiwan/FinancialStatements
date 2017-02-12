var DataBase = require('./data_base.js');
var assert = require('assert');

var findCallback = function (err, docs) {
	assert.equal(err, null);
	console.log(docs);
	console.log('[pass] findDocuments');
}

var RemoveCallback = function (err, result) {
	assert.equal(err, null);
	console.log('[pass] removeDocument');
}

var UpdateCallback = function (err, result) {
	assert.equal(err, null);
	console.log('[pass] updateDocument');
	var f_filter = {
		'testa': {$exists :true},
	};
	DataBase.findDocuments(f_filter, findCallback);
	var r_filter = {
		'testa': {$exists :true},
	};
	DataBase.removeDocument(r_filter, RemoveCallback);
}

var InsertCallback = function (err, result) {
	assert.equal(err, null);
	//assert.equal(1, result.result.n);
	console.log('[pass] insertDocuments');
	var f_filter = {
		'testa': {$exists :true},
	};
	DataBase.findDocuments(f_filter, findCallback);
	var u_filter = {
		'testb': {$exists :true}
	};
	var u_update = {
		$set: {'testb': 'qq', 'testa': 'my bad'} 
	};
	DataBase.updateDocument(u_filter, u_update, UpdateCallback);
}

var test_obj = {
	'testa' : 'hello',
	'testb' : 'haha'
};

DataBase.insertDocuments(test_obj, InsertCallback);