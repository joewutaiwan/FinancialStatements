var util = require("util");
var htmlparser = require("htmlparser2");
var data = {};

var SetData = function (header, number) {
	//console.log('SetData: ', header, number);
	if (!data[header]) {
		data[header] = {
			value: null
		};
	}
	data[header].value = number;
}

var parse = function (para, rawHtml, callback) {
	var valid_data = false;
	var open_header = false;
	var first_run = false;
	var header = '';
	var value = 0;
	var parse_count = 0;
	var parser = new htmlparser.Parser({
		onopentag: function(name, attribs){
			if(name === "td"){
				if (attribs.style === 'text-align:left;white-space:nowrap;') {
					open_header = true;
					valid_data = true;
					parse_count = 0;
				}
			}
		},
		ontext: function(text_origin){

			var text = text_origin.replace(/\s/g,'');
			text = text.replace(/,/g,'');
			var number = parseFloat(text);

			//only get this quart
			if (text === '期初餘額' && !first_run) {
				first_run = true;
			} else if (text === '期初餘額'){
				first_run = false;
			}

			if (!isNaN(number) && valid_data && parse_count < 13 && first_run) {
				//console.log("--->", number);
				if (parse_count === 12) {
					SetData(header, number);
				}
				parse_count += 1;
			} else if (text !== '' && open_header){
				//console.log("-->", text);
				header = text;
			}
		},
		onclosetag: function(tagname){
			if(tagname === "td"){
				open_header = false;
			}
		}
	}, {decodeEntities: true});
	parser.write(rawHtml);
	parser.end();
	callback({success: true, data:data});
};

module.exports = {
  parse : parse
};