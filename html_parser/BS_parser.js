var util = require("util");
var htmlparser = require("htmlparser2");
var data = {};

var SetData = function (header, number, is_percentage) {
	//console.log('SetData: ', header, number, is_percentage);
	if (!data[header]) {
		data[header] = {
			value: null,
			percentage: null
		};
	}
	if (!is_percentage) {
		data[header].value = number;
	} else {
		data[header].percentage = number;
	}
}

var parse = function (para, rawHtml, callback) {
	var valid_data = false;
	var open_header = false;
	var header = '';
	var value = 0;
	var persentage_value = 0;
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

			if (!isNaN(number) && valid_data && parse_count < 2) {
				//console.log("--->", number);
				var is_percentage = (parse_count === 0) ? false : true;
				if (header === '待註銷股本股數（單位：股）' && parse_count ===1) {
					return;
				}
				if (header === '預收股款（權益項下）之約當發行股數（單位：股）' && parse_count ===1) {
					return;
				}
				if (header === '母公司暨子公司所持有之母公司庫藏股股數（單位：股）' && parse_count ===1) {
					return;
				}
				SetData(header, number, is_percentage);
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