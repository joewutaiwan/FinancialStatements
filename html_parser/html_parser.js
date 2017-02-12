var util = require("util");
var IncomeStatementParser = require("./IS_parser.js");
var BalanceSheetParser = require("./BS_parser.js");
var CashFlowStatementParser = require("./CFS_parser.js");
var StockholdersEquityStatementParser = require("./SHES_parser.js");

var Error = function (para, error, data) {
	return {
		success: false,
		para: para,
		error: error,
		data: data
	};
}

var Success = function (para, error, data) {
	return {
		success: true,
		para: para,
		error: error,
		data: data
	};
}

var parse = function (para, rawHtml, callback) {
	switch(para.type) {
		case 1:
			data = IncomeStatementParser.parse(para, rawHtml, callback);
			break;
		case 2:
			data = BalanceSheetParser.parse(para, rawHtml, callback);
			break;
		case 3:
			data = CashFlowStatementParser.parse(para, rawHtml, callback);
			break;
		case 4:
			data = StockholdersEquityStatementParser.parse(para, rawHtml, callback);
			break;
		default:
			callback(Error(para, 'No such type'));
			return;
	}
};

var help = function () {
	console.log('');
};

module.exports = {  
  version : '1.0',
  help: help,
  parse : parse
};