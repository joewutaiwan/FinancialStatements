# FinancialStatements
use nodejs for Financial statements


# TWSE Request
   - fetch html data from TWSE
   - pass to Html parser

# 預先準備
- install mongoDB https://docs.mongodb.com/manual/installation/
- install nodejs

# Install
    npm install
   - 根據 package.json 來安裝相依檔案

# Check
    node showDBData.js 2330 105 01
   - 最後一個參數提供的種類 :
   
| Type | Catagory |
| ------ | ------ |
| 1 | IncomeStatement | 
| 2 | BalanceSheet | 
| 3 | CashFlowStatement | 
| 4 | StockholdersEquityStatement | 
   - 這個指令會把 MongoDB 內的台積電 (2330) 105 年的第一季的 IncomeStatement 噴出, 但如果你裡面沒有會回傳一個空的陣列

# Run
    node app.js
   - 根據 twse_company_list 來爬資料到 MongoDB
   - 會跑在背景, ssh 斷了也沒關係, ps aux | grep node 可以看到

# 調整一些參數
   - 設定要抓的時間 app.js 內的 genParaList
   - 修改 progress.config 設定起始的公司以及時間
