var DataBase = require('./data_base/data_base.js');
var assert = require('assert');

var RemoveCallback = function (err, docs) {
	assert.equal(err, null);
	console.log('[pass] removeDocument');
}
var r_filter = {
		
};
DataBase.removeDocument(r_filter, RemoveCallback);