var insertRecord = require('./insertRecord.js');
var sleep = require('sleep');
var fs = require('fs');

function getdata(company) {
	for (var y = 102; y <= 105; y++) {
		var tmp = '000' + y;
		var year = tmp.substring(tmp.length - 3, tmp.length);
		for (var s = 1; s <= 4; s++) {
			var tmp = '000' + s;
			var season = tmp.substring(tmp.length - 2, tmp.length);
			for (var type = 1; type <= 4; type++) {
				var para = {
					type: type,
					company : company,
					year: year,
					season: season
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
      index = remaining.indexOf(' ');
	  //sleep.sleep(1);
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

function func(data) {
	var number = parseInt(data);
	if (!isNaN(number)){
		getdata(String(number));
		//console.log('Line: ' + number);
	}
}

var input = fs.createReadStream('company_list');
readLines(input, func);