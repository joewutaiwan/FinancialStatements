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
	var total_EPS = 0;
	var some_one_dont_have = false;
	for (var i = start; i <= end ; i++){
		if (data[i].hasOwnProperty("基本每股盈餘")) {
			total_EPS += data[i]["基本每股盈餘"].value
		} else {
			some_one_dont_have = true;
		}
	}
	if (!some_one_dont_have) {
		result.push(total_EPS);
	}

	return result;
}

function getZdata(start, end, data) {
	var result = [];
	var str = data[start].company + data[start].year + data[start].season;
	result.push(str);

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
	fs.writeFile('xdata.csv', xd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.writeFile('ydata.csv', yd, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
	fs.writeFile('zdata.csv', zd, function(err) {
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
	fs.appendFile('zdata.csv', zd, function(err) {
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

	var final_data = [];
	for (var i in processed) {
		if (processed[i] != undefined) {
			final_data.push(processed[i]);
		}	
	}

	final_data.sort(compare);
	for (var i = 0; i < final_data.length - 4 ; i++){
		//console.log("test:", docs[i].year, ", ", docs[i].season);
		//console.log("out:", docs[i + 4].year, ", ", docs[i + 4].season);
		var x = getXdata(i, i + 3, final_data);
		var y = getYdata(i, i + 3, final_data);
		var z = getZdata(i, i + 3, final_data);
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
	//package_data.company_list = [2330, 2498, 8163];
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
