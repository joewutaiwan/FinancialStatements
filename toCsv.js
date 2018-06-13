var sleep = require('sleep');
var fs = require('fs');
var DataBase = require('./data_base/data_base.js');
var assert = require('assert');

var total_count = 0;
var success_count = 0;
var Sta = [];
var HeyKeys = [
//'已實現銷貨（損）益',
'稅前淨利（淨損）',
//'採用權益法認列關聯企業及合資之其他綜合損益之份額-可能重分類至損益之項目',
'管理費用',
'本期綜合損益總額',
//3919'備供出售金融資產未實現評價損益',
'營業利益（損失）',
'營業成本合計',
//'其他收益及費損淨額',
'其他收入',
'所得稅費用（利益）合計',
'營業費用合計',
'營業外收入及支出合計',
//2231'採用權益法認列之關聯企業及合資損益之份額淨額',
//'母公司業主（淨利\／損）',
//2231'研究發展費用',
'繼續營業單位本期淨利（淨損）',
//6267'母公司業主（綜合損益）',
'本期淨利（淨損）',
'營業毛利（毛損）',
'其他利益及損失淨額',
//3919'國外營運機構財務報表換算之兌換差額',
'營業毛利（毛損）淨額',
'營業收入合計',
//'非控制權益（綜合損益）',
'其他綜合損益（淨額）',
//'與可能重分類之項目相關之所得稅',
//'稀釋每股盈餘',
//6525'推銷費用',
//'基本每股盈餘',
//'非控制權益（淨利\／損）',
'財務成本淨額'
];

function LoadCompanyList(package_data) {
	var company_list = []
	var input = fs.createReadStream('twse_company_list');
	return new Promise((resolve, reject) => {
		var remaining = '';
		var found = 0;

	  input.on('data', function(data) {
	    remaining += data;
	    var index = remaining.indexOf('\n');
	    while (index > -1) {
	      var line = remaining.substring(0, index);
	      remaining = remaining.substring(index + 1);
				index = remaining.indexOf('\n');
				company_list.push(line);
	    }
	  });

	  input.on('end', function() {
			console.log("==end of parse compamny list==");
			package_data.company_list = company_list
			resolve(package_data);
		});
	});
}

function compare(a,b) {
	if (a.year < b.year)
	  return -1;
	if (a.year > b.year)
	  return 1;
	if (a.season < b.season)
	  return -1;
	if (a.season > b.season)
	  return 1;
	return 0;
}

function getKeyRecord(record) {
	var result = [];
	var check_value = function(key) {
		if (record.hasOwnProperty(key)) {
			result.push(record[key].percentage);
		} else {
			if (record.hasOwnProperty("營業利益（損失）")) {
				Sta[key] = (!Sta[key]) ? 1 : Sta[key] + 1;
				//console.log(record.company, record.year, " ", record.season, " leak: ", key);
			}
		}
	};
	for (var i = 0; i < HeyKeys.length; i ++) {
		check_value(HeyKeys[i]);
	}
	
	return result;
	
}

function getXdata(start, end, data) {
	var result = [];
	for (var i = start; i <= end ; i++){
		var part = getKeyRecord(data[i]);
		result = result.concat(part);
	}
	return result;
}

function validate(x, y) {
	if (x.length === 4*HeyKeys.length && y.length == 1) {
		return true;
	}
	return false;
}

function getYdata(record_ago, record) {
	//return getKeyRecord(record);
	var result = []
	if (record_ago.hasOwnProperty("基本每股盈餘") && record.hasOwnProperty("基本每股盈餘")) {
		if (record["基本每股盈餘"].value  - record_ago["基本每股盈餘"].value > 0) {
			result.push(1);
		} else {
			result.push(0);
		}
	}
	return result;
}

function writeCsv(x, y , first) {
	var xd, yd;
	xd = x.join(", ") + "\n";
	yd = y.join(", ") + "\n";
	fs.appendFile('xdata.csv', xd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.appendFile('ydata.csv', yd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}

function ProcessToCsv(docs) {
	docs.sort(compare);
	//console.log(docs.length);
	for (var i = 0; i < docs.length - 4 ; i++){
		//console.log("test:", docs[i].year, ", ", docs[i].season);
		//console.log("out:", docs[i + 4].year, ", ", docs[i + 4].season);
		var x = getXdata(i, i + 3, docs);
		var y = getYdata(docs[i], docs[i + 4]);
		if (validate(x, y)) {
			//console.log (x, y)
			/*
			console.log("success add " , docs[i].company ,
			" x:", docs[i].year, docs[i].season , "+4",
			" y:", docs[i+4].year,docs[i+4].season 
			);
			*/
			writeCsv(x, y);
			success_count += 1;
		}
		total_count += 1;
	}

}

function getDBData(company, callback) {
	var f_filter = {
		"company": company.toString(),
		"type": 1
	};
	DataBase.findDocuments(f_filter, callback);
}

function Process(package_data) {
	//package_data.company_list = [1413, 2330, 2498, 8163];
	return new Promise((resolve, reject) => {
		(function loop(i) {
			if (i < package_data.company_list.length) new Promise((resolve, reject) => {
				//console.log(package_data.company_list[i]);
				var dbcallback = function(err, docs) {
					assert.equal(err, null);
					//console.log("docs: ", docs);
					ProcessToCsv(docs);
					resolve();
				}
				getDBData(package_data.company_list[i], dbcallback);
				
			}).then(loop.bind(null, i+1));
			else resolve();
		})(0);

	});
}

function main() {
	
	var package_data = {};
	LoadCompanyList(package_data)
	.then(
		Process
	)
	.then(
		function() {
			console.log ("-----------------------------"); 
			console.log ("created " , success_count , "of " , total_count , " companys data");
			console.log ("-----------------------------");
			console.log ("部分資料缺少以下資訊");
			console.log (Sta);
		}
	)
	.catch(
		// 印出失敗訊息（rejection reason）
		(reason) => {
				var date = new Date();
				var date_string = date.toLocaleString();
				console.log('[ERROR][' + date_string + "] - " + reason + '');
		}
	);

}
main();
