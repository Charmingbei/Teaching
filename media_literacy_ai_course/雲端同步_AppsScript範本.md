# 雲端同步 Apps Script 範本

用途：讓學生用各自裝置提交後，老師後台可以按「同步雲端資料到後台」看見各組資料。

## 使用方式

1. 開啟 Google 試算表。
2. 點「擴充功能」->「Apps Script」。
3. 刪除原本程式碼，貼上下方程式碼。
4. 修改第一行 `SPREADSHEET_ID`，填入你的 Google 試算表 ID。
5. 部署為「網頁應用程式」：
   - 執行身分：我
   - 誰可以存取：所有人
6. 複製「網頁應用程式網址」，貼到活動網頁教師後台的「雲端備份網址」。
7. 複製「學生連結」給學生掃描。學生若掃一般網址，不會送到老師雲端後台。

```javascript
const SPREADSHEET_ID = "請貼上你的試算表ID";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const rows = data.rows || [];

    if (rows.length === 0) {
      return jsonOutput({ ok: false, message: "No rows received" });
    }

    const headers = getHeaders(sheet, rows[0]);
    rows.forEach(function(row) {
      sheet.appendRow(headers.map(function(header) {
        return row[header] || "";
      }));
    });

    return jsonOutput({ ok: true, count: rows.length });
  } catch (error) {
    return jsonOutput({ ok: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const mode = e.parameter.mode || "";
  const callback = e.parameter.callback || "";

  if (mode === "read") {
    const rows = readRows();
    const lessonTitle = e.parameter.lessonTitle || "";
    const className = e.parameter.className || "";
    const filtered = rows.filter(function(row) {
      const lessonOk = !lessonTitle || row["課程"] === lessonTitle;
      const classOk = !className || row["班級"] === className;
      return lessonOk && classOk;
    });
    return jsonpOutput(callback, { ok: true, rows: filtered });
  }

  return ContentService
    .createTextOutput("媒體素養活動雲端同步已啟用")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getHeaders(sheet, sampleRow) {
  if (sheet.getLastRow() === 0) {
    const headers = Object.keys(sampleRow);
    sheet.appendRow(headers);
    return headers;
  }
  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String);
  const missingHeaders = Object.keys(sampleRow).filter(function(header) {
    return existingHeaders.indexOf(header) === -1;
  });

  if (missingHeaders.length > 0) {
    sheet
      .getRange(1, existingHeaders.length + 1, 1, missingHeaders.length)
      .setValues([missingHeaders]);
  }

  return existingHeaders.concat(missingHeaders);
}

function readRows() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1).map(function(row) {
    const item = {};
    headers.forEach(function(header, index) {
      item[header] = row[index];
    });
    return item;
  });
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonpOutput(callback, payload) {
  const body = callback
    ? callback + "(" + JSON.stringify(payload) + ");"
    : JSON.stringify(payload);
  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```
