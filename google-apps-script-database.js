const SPREADSHEET_ID = "1HSrPxwqYokdzMKofaZyfthsSf74iOtYgcqdYZzds0ng";
const SHEET_NAME = "responses";

function doPost(e) {
  const sheet = getSheet();
  const payload = JSON.parse(e.postData.contents || "{}");
  const record = payload.record || {};

  sheet.appendRow([
    new Date(),
    record.id || "",
    record.className || "",
    record.seat || "",
    record.studentName || "",
    record.opponentName || "",
    record.questionTitle || "",
    record.topic || "",
    record.concept || "",
    record.stance || "",
    record.reason || "",
    record.reflection || "",
    record.score || "",
    record.responseSeconds || "",
    record.misconception || "",
    record.time || ""
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
      "班級",
      "座號",
      "學生姓名",
      "對手",
      "題目",
      "主題",
      "概念",
      "立場",
      "理由卡",
      "文字回答",
      "分數",
      "作答秒數",
      "迷思標記",
      "作答時間"
    ]);
  }

  return sheet;
}
