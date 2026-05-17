const SPREADSHEET_ID = "1MPVxE4HdOLHQvfZJaKx02V7XYblBSIUIkAHKyC9iJ6U";
const SHEET_NAME = "camera_coach_records";

function doPost(e) {
  const sheet = getSheet();
  const payload = JSON.parse(e.postData.contents || "{}");
  const record = payload.record || {};
  const scores = record.scores || {};

  sheet.appendRow([
    new Date(),
    record.id || "",
    record.practicedDate || "",
    record.practicedTime || "",
    record.studentName || "",
    record.source || "",
    record.mediaName || "",
    scores.total || "",
    scores.expression || "",
    scores.posture || "",
    scores.gaze || "",
    scores.stage || "",
    record.durationSeconds || "",
    (record.suggestions || []).join("\n"),
    record.practicedAt || ""
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
      "紀錄ID",
      "練習日期",
      "練習時間",
      "練習者",
      "來源",
      "影片檔名",
      "總分",
      "神情亮度",
      "姿態穩定",
      "視線連結",
      "畫面大方度",
      "練習秒數",
      "建議",
      "原始時間"
    ]);
  }

  return sheet;
}
