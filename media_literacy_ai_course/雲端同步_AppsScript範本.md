# 雲端同步 Apps Script 範本

用途：讓學生用各自裝置提交後，老師後台可以按「同步雲端資料到後台」看見各組資料。

## 這版做了什麼

- 活動一與活動二會自動分開成兩個 Google 試算表，不會混在同一張表。
- 活動一欄位：科技尾巴偵探局題目與填答。
- 活動二欄位：推薦怪圈實驗室題目與填答。
- 老師仍然只需要一個「網頁應用程式網址」，兩個活動網頁都可以貼同一個網址使用。

## 使用方式

1. 開啟 Apps Script 專案。
2. 刪除原本 `Code.gs` 程式碼，貼上下方新版程式碼。
3. 按「儲存」。
4. 按「部署」->「管理部署作業」-> 選鉛筆編輯。
5. 版本選「新增版本」，存取權維持「所有人」。
6. 按「部署」。
7. 複製「網頁應用程式網址」，貼到活動網頁教師後台的「雲端備份網址」。
8. 複製活動網頁產生的「學生連結」給學生掃描。

```javascript
const LESSON_SPREADSHEETS = {
  "第一節：科技尾巴偵探局": "媒體素養_活動一_科技尾巴偵探局_收件箱",
  "第二節：推薦怪圈實驗室": "媒體素養_活動二_推薦怪圈實驗室_收件箱",
};

const DEFAULT_SPREADSHEET_NAME = "媒體素養_其他活動_收件箱";
const SHEET_NAME = "提交資料";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(
      (e && e.parameter && e.parameter.payload) ||
      (e && e.postData && e.postData.contents) ||
      "{}"
    );
    return jsonOutput(appendPayload(data));
  } catch (error) {
    return jsonOutput({ ok: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const mode = e.parameter.mode || "";
  const callback = e.parameter.callback || "";

  if (mode === "submit") {
    try {
      const data = JSON.parse(e.parameter.payload || "{}");
      return jsonpOutput(callback, appendPayload(data));
    } catch (error) {
      return jsonpOutput(callback, { ok: false, message: error.message });
    }
  }

  if (mode === "read") {
    const lessonTitle = e.parameter.lessonTitle || "";
    const className = e.parameter.className || "";
    const rows = readRows(lessonTitle);
    const filtered = rows.filter(function(row) {
      const lessonOk = !lessonTitle || row["課程"] === lessonTitle;
      const classOk = !className || row["班級"] === className;
      return lessonOk && classOk;
    });
    return jsonpOutput(callback, {
      ok: true,
      rows: filtered,
      lessonTitle: lessonTitle,
      spreadsheetUrl: getSpreadsheetForLesson(lessonTitle).getUrl(),
    });
  }

  return ContentService
    .createTextOutput("媒體素養活動雲端同步已啟用，活動一與活動二會分開試算表。")
    .setMimeType(ContentService.MimeType.TEXT);
}

function appendPayload(data) {
  const rows = data.rows || [];

  if (rows.length === 0) {
    return { ok: false, message: "No rows received" };
  }

  const lessonTitle = data.lessonTitle || rows[0]["課程"] || "";
  const sheet = getSheetForLesson(lessonTitle);
  const headers = getHeaders(sheet, rows[0]);

  rows.forEach(function(row) {
    const values = headers.map(function(header) {
      return row[header] === undefined || row[header] === null ? "" : String(row[header]);
    });
    const targetRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(targetRow, 1, 1, headers.length);
    range.setNumberFormat("@");
    range.setValues([values]);
  });

  return {
    ok: true,
    count: rows.length,
    lessonTitle: lessonTitle,
    spreadsheetUrl: sheet.getParent().getUrl(),
  };
}

function getSheetForLesson(lessonTitle) {
  const spreadsheet = getSpreadsheetForLesson(lessonTitle);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function getSpreadsheetForLesson(lessonTitle) {
  const name = LESSON_SPREADSHEETS[lessonTitle] || DEFAULT_SPREADSHEET_NAME;
  const key = "spreadsheetId_" + name;
  const properties = PropertiesService.getScriptProperties();
  const savedId = properties.getProperty(key);

  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (error) {
      properties.deleteProperty(key);
    }
  }

  const spreadsheet = SpreadsheetApp.create(name);
  properties.setProperty(key, spreadsheet.getId());
  return spreadsheet;
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

function readRows(lessonTitle) {
  const sheet = getSheetForLesson(lessonTitle);
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
