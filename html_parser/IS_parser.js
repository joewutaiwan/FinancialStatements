var util = require("util");
var htmlparser = require("htmlparser2");
/*
var data = {
	OperatingRevenue                           :null,                  //營業收入
	OperatingCosts                             :null,                  //營業成本
	GrossProfitFromOperations                  :null,                  //營業毛利
	RealizedProfitFromSales                    :null,                  //已實現銷貨（損）益
	NetGrossProfitFromOperations               :null,                  //營業毛利（毛損）淨額
	OperatingExpenses                          :{                      //營業費用
		SellingExpenses                        :null,                  //推銷費
		AdministrativeExpenses                 :null,                  //管理費
		ResearchAndDevelopmentExpenses         :null,                  //研究發展費用
		TotalOperatingExpenses                 :null                   //營業費用合計
	},
	NetOtherIncome                             :null,                  //其他收益及費損淨額
	NetOperatingIncome                         :null,                  //營業利益（損失）
	NonOperatingIncome                         :{                      //營業外收入及支出
		OtherIncome                            :null,                  //其他收入
		OtherGainsAndLosses                    :null,                  //其他利益及損失淨額
		FinanceCosts                           :null,                  //財務成本淨額
		ShareOfProfit                          :null,                  //採用權益法認列之關聯企業及合資損益之份額淨額
		TotalNonOperatingIncome                :null                   //營業外收入及支出合計
	},
	ProfitBeforeTax                            :null,                  //稅前淨利（淨損）
	TaxExpense                                 :null,                  //所得稅費用（利益）合計
	ProfitFromContinuingOperations             :null,                  //繼續營業單位本期淨利（淨損）
	Profit                                     :null,                   //本期淨利（淨損）
	OtherComprehensiveIncome: {
		'Exchange differences on translation'  :null,                  //國外營運機構財務報表換算之兌換差額
		'unrealised gains of financial assets' :null,                  //備供出售金融資產未實現評價損益
		'Share of other comprehensive income'  :null,                  //採用權益法認列關聯企業及合資之其他綜合損益之份額-可能重分類至損益之項目
		'Income tax related'                   :null,                  //與可能重分類之項目相關之所得稅
		TotalOtherComprehensiveIncome          :null                   //其他綜合損益（淨額）
	},
	TotalComprehensiveIncome                   :null,                  //本期綜合損益總額
	'Profit (loss), attributable to owners of parent'          :null,  //母公司業主（淨利／損）
	'Profit (loss), attributable to non-controlling interests' :null,  //非控制權益（淨利／損）
	'Comprehensive income, attributable to owners of parent'   :null,  //母公司業主（綜合損益）
	'Comprehensive income for non-controlling interests'       :null,  //非控制權益（綜合損益）
	BasicEarningsPerShare                      :null,                  //基本每股盈餘
	DilutedEarningsPerShare:null                                       //稀釋每股盈餘
}
*/
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
/*
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
*/

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
				if (header === '基本每股盈餘' && parse_count ===1) {
					return;
				}
				if (header === '稀釋每股盈餘' && parse_count ===1) {
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