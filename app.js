var insertRecord = require('./insertRecord.js');
var sleep = require('sleep');
var fs = require('fs');

const wait_second = 5;
const start = 13;
const end = 920;
var count = 0;

var company_array = [];

function getdata(company) {
	for (var y = 102; y <= 106; y++) {
		var tmp = '000' + y;
		var year = tmp.substring(tmp.length - 3, tmp.length);
		for (var s = 1; s <= 4; s++) {
			var tmp = '000' + s;
			var season = tmp.substring(tmp.length - 2, tmp.length);
			for (var type = 1; type <= 4; type++) {
				var para = {
					type: type,
					company : String(company),
					year: String(year),
					season: String(season)
				};
				insertRecord.Run(para);
			}
		}
	}
}

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

function func(data) {
	var tmp_count = count;
	if (count >= start && count < end) {
		setTimeout(function(){
			console.log('N: ' + data + ' count : ' + tmp_count);
			getdata(String(data));
		}, wait_second*1000*(count - start));
	}
	count = count + 1;
}

var input = fs.createReadStream('twse_company_list');
readLines(input, func);

