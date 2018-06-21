var sleep = require('sleep');
var fs = require('fs');
var DataBase = require('./data_base/data_base.js');
var assert = require('assert');

var total_count = 0;
var success_count = 0;
var Sta = [];
var HeyKeys = [
	'營業成本合計',
	'營業毛利（毛損）',
	'營業費用合計',
	'營業利益（損失）',
	'營業外收入及支出合計',
	'稅前淨利（淨損）',
	'本期淨利（淨損）',
	'本期綜合損益總額',

	'流動負債合計',
	'非流動負債合計',
	'保留盈餘合計',
	'非流動資產合計',
	'流動資產合計',
	'其他權益合計',
	'股本合計',
	'資本公積合計'

];
var HeyKeysEng = [
	'A',//'營業成本合計',
	'B',//'營業毛利（毛損）',
	'C',//'營業費用合計',
	'D',//'營業利益（損失）',
	'E',//'營業外收入及支出合計',
	'F',//'稅前淨利（淨損）',
	'G',//'本期淨利（淨損）',
	'H',//'本期綜合損益總額',

	'I',//'流動負債合計',
	'J',//'非流動負債合計',
	'K',//'保留盈餘合計',
	'L',//'非流動資產合計',
	'M',//'流動資產合計',
	'N',//'其他權益合計',
	'O',//'股本合計',
	'P'//'資本公積合計'

];

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
		if (record.hasOwnProperty(key)
		&& record[key].percentage !== undefined
		&& record[key].percentage !== null
		) {
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

function getYdata(start, end, data) {
	var result = [];
	result.push(data[start].company);
	return result;
}

function getZdata(start, end, data) {
	var result = [];
	var a = parseInt(data[start].year, 10);
	var b = parseInt(data[start].season, 10);
	var index =  a - 100 + b;
	result.push(index);
	return result;
}

function initalCsv() {
	var xd, yd, zd;
	xd = HeyKeysEng.join("Q1,") + "Q1,"
	+ HeyKeysEng.join("Q2,") + "Q2,"
	+ HeyKeysEng.join("Q3,") + "Q3,"
	+ HeyKeysEng.join("Q4,") + "Q4\n";
	yd = "EPS\n";
	zd = "Company\n";
	fs.writeFile('company_xdata.csv', xd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.writeFile('company_ydata.csv', yd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.writeFile('company_zdata.csv', zd, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function writeCsv(x, y, z) {
	var xd, yd, zd;
	xd = x.join(", ") + "\n";
	yd = y.join(", ") + "\n";
	zd = z.join(", ") + "\n";
	fs.appendFile('company_xdata.csv', xd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.appendFile('company_ydata.csv', yd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.appendFile('company_zdata.csv', zd, function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function ProcessToCsv(docs) {
	var processed = [];
	for (var i in docs) {
		if (docs[i].type !== 1 && docs[i].type !== 2) {
			continue;
		}
		var key = docs[i].year + docs[i].season;
		processed[key] = (processed[key] === undefined) ? docs[i] : Object.assign(processed[key], docs[i]);
	}

	var ok_data = [];
	for (var i in processed) {
		if (processed[i] != undefined) {
			ok_data.push(processed[i]);
		}	
	}

	ok_data.sort(compare);
	for (var i = 0; i < ok_data.length - 4 ; i++){
		//console.log("test:", docs[i].year, ", ", docs[i].season);
		//console.log("out:", docs[i + 4].year, ", ", docs[i + 4].season);
		var x = getXdata(i, i + 3, ok_data);
		var y = getYdata(i, i + 3, ok_data);
		var z = getZdata(i, i + 3, ok_data);
		if (validate(x, y)) {
			//console.log (x, y)
			writeCsv(x, y, z);
			success_count += 1;
		}
		total_count += 1;
	}
}

function getDBData(company, callback) {
	var f_filter = {
		"company": company.toString()
	};
	DataBase.findDocuments(f_filter, callback);
}

function Process(package_data) {
	initalCsv();
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
	package_data.company_list = [2002, 2324, 2330, 2454, 8358, 8163, 6411];
	Process(package_data)
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
