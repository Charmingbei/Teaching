const SPREADSHEET_ID = "請貼上你的 Google 試算表 ID";
const SHEET_NAME = "art_coach_usage";

function doPost(e) {
  const sheet = getSheet();
  const payload = JSON.parse(e.postData.contents || "{}");
  const record = payload.record || {};
  const stats = record.imageStats || {};

  sheet.appendRow([
    new Date(),
    payload.app || "",
    payload.version || "",
    record.id || "",
    record.time || "",
    record.toolName || "",
    record.className || record.grade || "",
    record.seat || "",
    record.medium || "",
    record.topic || "",
    record.note || "",
    record.summary || "",
    record.need || "",
    Math.round(stats.brightness || 0),
    Math.round(stats.contrast || 0),
    Math.round((stats.edgeDensity || 0) * 100)
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "同步時間",
      "App",
      "版本",
      "紀錄ID",
      "使用時間",
      "工具",
      "班級",
      "座號",
      "媒材",
      "主題或比賽",
      "學生備註",
      "系統判斷",
      "教學提醒",
      "影像亮度",
      "影像對比",
      "細節密度%"
    ]);
  }

  return sheet;
}
