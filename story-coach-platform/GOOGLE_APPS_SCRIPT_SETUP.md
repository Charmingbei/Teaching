# 低年級國語說故事陪伴教練：專用雲端儲存設定

專用 Google 試算表：

https://docs.google.com/spreadsheets/d/1MPVxE4HdOLHQvfZJaKx02V7XYblBSIUIkAHKyC9iJ6U/edit

## 部署步驟

1. 開啟 https://script.google.com/
2. 建立新專案
3. 將 `google-apps-script-cloud.js` 的內容貼到 Apps Script 編輯器
4. 按「部署」>「新增部署作業」
5. 類型選「網頁應用程式」
6. 執行身分選「我」
7. 存取權選「任何人」
8. 複製產生的 Web App URL
9. 回到網頁的「雲端紀錄位置」貼上 URL，按「儲存位置」

完成後，每次分析都會寫入這份專用試算表的 `camera_coach_records` 工作表。
