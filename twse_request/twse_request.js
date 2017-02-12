var request = require('request');

const IncomeStatementBaseUri             = 'http://mops.twse.com.tw/mops/web/ajax_t164sb04';
const BalanceSheetBaseUri                = 'http://mops.twse.com.tw/mops/web/ajax_t164sb03';
const CashFlowStatementBaseUri           = 'http://mops.twse.com.tw/mops/web/ajax_t164sb05';
const StockholdersEquityStatementBaseUri = 'http://mops.twse.com.tw/mops/web/ajax_t164sb06';

const uri_set = {
	1: IncomeStatementBaseUri,
	2: BalanceSheetBaseUri,
	3: CashFlowStatementBaseUri,
	4: StockholdersEquityStatementBaseUri
};

const settings = 'encodeURIComponent=1&step=1&firstin=1&off=1&keyword4=&code1=&TYPEK2=&checkbtn=&queryName=co_id&inpuType=co_id&TYPEK=all&';

var Error = function (para, error, httpResponse, body) {
	return {
		success: false,
		para: para,
		error: error,
		httpResponse: httpResponse,
		body: body
	};
}

var Success = function (para, error, httpResponse, body) {
	return {
		success: true,
		para: para,
		error: error,
		httpResponse: httpResponse,
		body: body
	};
}

var getData = function (para, callback) { 

	if (!para.type || !para.company || !para.year || !para.season) {
		callback(Error(para, 'para error'));
		return;
	}

	var url = uri_set[para.type.toString()];
	url += '?' + settings;
	url += '&isnew=false';
	url += '&co_id=' + para.company;
	url += '&year=' + para.year;
	url += '&season=' + para.season;

	console.log(url);

	request.post({url:url, form: {key:'value'}}, function (error, httpResponse, body){
		var ret;
		if (!error && httpResponse.statusCode == 200) {
			if (body.length < 500) {
				console.log(body.length);
				ret = Error(para, error, httpResponse, body);
			} else {
				ret = Success(para, error, httpResponse, body);
			}
		} else {
			ret = Error(para, error, httpResponse, body);
		}
		callback(ret);
	})

};

var help = function () {
	console.log('\
	type 1 = IncomeStatement                          \n\
	type 2 = BalanceSheet                             \n\
	type 3 = CashFlowStatement                        \n\
	type 4 = StockholdersEquityStatement            \n\n\
	para format = {                                   \n\
		type:        1,                               \n\
		company:  2330,                               \n\
		year:      102,                               \n\
		season:      3                                \n\
	}	                                              \n\
	');
};

module.exports = {  
  version : '1.0',
  help: help,
  getData : getData
};