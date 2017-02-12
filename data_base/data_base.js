var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
// Connection URL
var url = 'mongodb://localhost:27017/FinancialStatements';
// Use connect method to connect to the server

var insertDocuments = function(obj, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		//console.log("Connected successfully to server");
		var collection = db.collection('documents');
		// Find some documents
		collection.insertOne(
			obj
		, function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.result.n);
			assert.equal(1, result.ops.length);
			console.log("Inserted 1 documents into the collection");
			db.close();
			callback();
		});
	});
}

var findDocuments = function(filter, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		var collection = db.collection('documents');
		// Find some documents
		collection.find(filter).toArray(function(err, docs) {
			callback(err, docs);
			db.close();
		});
	});
}

var removeDocument = function(filter, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		var collection = db.collection('documents');
		// Find some documents
		collection.deleteMany(filter, function(err, result) {
			callback(err, result);
			db.close();
		});
	});
}

var updateDocument = function(filter, update, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		var collection = db.collection('documents');
		// Find some documents
		collection.updateMany(filter, update, function(err, result) {
			callback(err, result);
			db.close();
		});
	});
}

module.exports = {  
  version : '1.0',
  findDocuments : findDocuments,
  insertDocuments : insertDocuments,
  removeDocument  : removeDocument,
  updateDocument : updateDocument 
};