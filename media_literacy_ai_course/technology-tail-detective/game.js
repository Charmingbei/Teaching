const cases = [
  {
    group: "第一組",
    title: "留言尾巴案",
    type: "留言",
    story: "小安看到同學上傳唱歌影片，覺得很好笑，就留言：「哈哈你唱得好怪喔！」後來很多人跟著笑。",
  },
  {
    group: "第二組",
    title: "照片尾巴案",
    type: "照片",
    story: "小妍在校外教學拍到朋友打哈欠的照片，覺得很好玩，就傳到班級群組。",
  },
  {
    group: "第三組",
    title: "按讚尾巴案",
    type: "按讚",
    story: "小宇看到一支嘲笑別人失敗的短片，覺得很有趣，就按了讚。之後平台一直推類似影片給他。",
  },
  {
    group: "第四組",
    title: "分享尾巴案",
    type: "分享",
    story: "小杰看到「某某同學今天被老師罵哭」的截圖，還不知道真假，就轉傳給朋友。",
  },
  {
    group: "第五組",
    title: "截圖尾巴案",
    type: "截圖",
    story: "小晴和朋友吵架後，把聊天紀錄截圖傳給另一位同學，希望大家支持自己。",
  },
  {
    group: "第六組",
    title: "AI圖片尾巴案",
    type: "AI圖片",
    story: "小恩用AI做了一張同學變成搞笑角色的圖片，覺得很有趣，想放到班級群組。",
  },
];

const peopleOptions = ["發布的人", "被提到的人", "看到的人", "被平台記住的人"];
const temperatureOptions = ["友善尾巴", "有點刺刺的尾巴", "受傷尾巴", "變長尾巴"];
const repairOptions = ["道歉", "刪除或撤回", "補一句友善留言", "問對方是否同意", "不再轉傳", "向老師或大人求助", "改成私下提醒", "發布前停三秒"];

const lessonTitle = "第一節：科技尾巴偵探局";
let activeGroup = 0;
let dashboardUnlocked = sessionStorage.getItem("tailDetectiveTeacherUnlocked") === "true";
let drafts = cases.map(() => createDraft());
let submissions = loadSubmissions();
let lessonRecord = loadLessonRecord();

function getUrlCloudEndpoint() {
  const params = new URLSearchParams(window.location.search);
  return params.get("cloud") || params.get("endpoint") || "";
}

function getUrlLessonRecord() {
  const params = new URLSearchParams(window.location.search);
  return {
    date: params.get("date") || "",
    className: params.get("className") || params.get("class") || "",
    cloudEndpoint: getUrlCloudEndpoint(),
  };
}

function createDraft() {
  return {
    action: "",
    reason: "",
    people: [],
    temperature: [],
    repairs: [],
    repairPlan: "",
    goldenSentence: "",
  };
}

function loadSubmissions() {
  try {
    const saved = localStorage.getItem("tailDetectiveSubmissions");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSubmissions() {
  localStorage.setItem("tailDetectiveSubmissions", JSON.stringify(submissions));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadLessonRecord() {
  try {
    const saved = localStorage.getItem("tailDetectiveLessonRecord");
    const urlRecord = getUrlLessonRecord();
    const base = { date: urlRecord.date || getToday(), className: urlRecord.className, cloudEndpoint: urlRecord.cloudEndpoint };
    if (!saved) return base;
    const parsed = JSON.parse(saved);
    return {
      ...base,
      ...parsed,
      date: urlRecord.date || parsed.date || getToday(),
      className: urlRecord.className || parsed.className || "",
      cloudEndpoint: urlRecord.cloudEndpoint || parsed.cloudEndpoint || "",
    };
  } catch {
    const urlRecord = getUrlLessonRecord();
    return { date: urlRecord.date || getToday(), className: urlRecord.className, cloudEndpoint: urlRecord.cloudEndpoint };
  }
}

function saveLessonRecord() {
  localStorage.setItem("tailDetectiveLessonRecord", JSON.stringify(lessonRecord));
}

function toggleItem(list, item) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

function renderGroupTabs() {
  const tabs = document.querySelector("#groupTabs");
  tabs.innerHTML = "";
  cases.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = index === activeGroup ? "active" : "";
    button.innerHTML = `<strong>${item.group}</strong><br>${item.title}`;
    button.addEventListener("click", () => {
      activeGroup = index;
      render();
    });
    tabs.append(button);
  });
}

function renderChoices(containerId, options, selected, onClick, className = "choice-pill") {
  const container = document.querySelector(containerId);
  container.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = `${className} ${selected.includes(option) ? "active" : ""}`;
    button.textContent = option;
    button.addEventListener("click", () => onClick(option));
    container.append(button);
  });
}

function renderCase() {
  const currentCase = cases[activeGroup];
  const draft = drafts[activeGroup];
  document.querySelector("#caseTitle").textContent = `${currentCase.group}：${currentCase.title}`;
  document.querySelector("#caseType").textContent = `${currentCase.type}科技尾巴`;
  document.querySelector("#caseStory").textContent = currentCase.story;

  const action = document.querySelector("#tailAction");
  const reason = document.querySelector("#tailReason");
  const repairPlan = document.querySelector("#repairPlan");
  const goldenSentence = document.querySelector("#goldenSentence");

  action.value = draft.action;
  reason.value = draft.reason;
  repairPlan.value = draft.repairPlan;
  goldenSentence.value = draft.goldenSentence;

  renderChoices("#peopleChoices", peopleOptions, draft.people, (item) => {
    draft.people = toggleItem(draft.people, item);
    render();
  });

  renderChoices("#temperatureChoices", temperatureOptions, draft.temperature, (item) => {
    draft.temperature = toggleItem(draft.temperature, item);
    render();
  }, "temp-pill");

  renderChoices("#repairChoices", repairOptions, draft.repairs, (item) => {
    draft.repairs = toggleItem(draft.repairs, item);
    render();
  });

  document.querySelector("#submitHint").textContent = submissions[activeGroup]
    ? "本組已有提交紀錄，可以修改後再次提交。"
    : "完成後提交，老師後台會看到你們的討論。";
}

function bindBoardInputs() {
  document.querySelector("#tailAction").addEventListener("change", (event) => {
    drafts[activeGroup].action = event.target.value;
  });
  document.querySelector("#tailReason").addEventListener("input", (event) => {
    drafts[activeGroup].reason = event.target.value;
  });
  document.querySelector("#repairPlan").addEventListener("input", (event) => {
    drafts[activeGroup].repairPlan = event.target.value;
  });
  document.querySelector("#goldenSentence").addEventListener("input", (event) => {
    drafts[activeGroup].goldenSentence = event.target.value;
  });
}

function submitCurrentGroup() {
  const draft = drafts[activeGroup];
  const missing =
    !draft.action ||
    !draft.reason.trim() ||
    draft.people.length === 0 ||
    draft.temperature.length === 0 ||
    draft.repairs.length === 0 ||
    !draft.repairPlan.trim() ||
    !draft.goldenSentence.trim();

  if (missing) {
    document.querySelector("#submitHint").textContent = "還有空格沒完成，請把案件板填完整再提交。";
    return;
  }

  submissions[activeGroup] = {
    ...draft,
    lessonTitle,
    lessonDate: lessonRecord.date,
    className: lessonRecord.className,
    group: cases[activeGroup].group,
    title: cases[activeGroup].title,
    story: cases[activeGroup].story,
    time: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
  };

  saveSubmissions();
  document.querySelector("#submitHint").textContent = `${cases[activeGroup].group}已提交，班級尾巴森林長出新葉子了。`;
  renderForest();
  renderDashboard();
  uploadGroupSubmission(submissions[activeGroup]);
}

function renderForest() {
  const forest = document.querySelector("#forest");
  forest.innerHTML = "";

  cases.forEach((item, index) => {
    const submission = submissions[index];
    const card = document.createElement("article");
    card.className = `leaf-card ${submission ? "submitted" : ""}`;
    card.innerHTML = submission
      ? `<strong>${item.group}</strong><p>${submission.goldenSentence}</p>`
      : `<strong>${item.group}</strong><p>${item.title}等待提交中。</p>`;
    forest.append(card);
  });
}

function renderDashboardLock() {
  document.querySelector("#dashboardLock").classList.toggle("hidden", dashboardUnlocked);
  document.querySelector("#dashboardContent").classList.toggle("hidden", !dashboardUnlocked);
  document.querySelector("#dashboardStatus").textContent = dashboardUnlocked ? "已解鎖" : "需要教師密碼";
}

function renderDashboard() {
  renderDashboardLock();
  if (!dashboardUnlocked) return;

  renderLessonRecord();
  renderSubmissionOverview();
  const board = document.querySelector("#submissionBoard");
  board.innerHTML = "";

  cases.forEach((item, index) => {
    const submission = submissions[index];
    const card = document.createElement("article");
    card.className = "submission-card";

    if (!submission) {
      card.innerHTML = `<strong>${item.group}：${item.title}</strong><p>尚未提交。</p>`;
      board.append(card);
      return;
    }

    card.innerHTML = `
      <strong>${submission.group}：${submission.title}</strong>
      <p>${submission.lessonDate || lessonRecord.date}｜${submission.className || lessonRecord.className || "未填班級"}｜${submission.time} 提交</p>
      <b>尾巴從哪裡長出來？</b>
      <p>${submission.action}：${submission.reason}</p>
      <b>尾巴碰到了誰？</b>
      <p>${submission.people.join("、")}</p>
      <b>尾巴溫度計</b>
      <p>${submission.temperature.join("、")}</p>
      <b>修復工具箱</b>
      <p>${submission.repairs.join("、")}。${submission.repairPlan}</p>
      <b>科技尾巴金句</b>
      <p>${submission.goldenSentence}</p>
    `;
    board.append(card);
  });
}

function renderSubmissionOverview() {
  const overview = document.querySelector("#submissionOverview");
  if (!overview) return;
  overview.innerHTML = "";

  cases.forEach((item, index) => {
    const submission = submissions[index];
    const card = document.createElement("article");
    card.className = `status-card ${submission ? "submitted" : ""}`;
    card.innerHTML = submission
      ? `
        <strong>${item.group}</strong>
        <span>已提交</span>
        <p>${submission.time || "未記錄時間"}</p>
        <small>${submission.goldenSentence || "已收到本組填答"}</small>
      `
      : `
        <strong>${item.group}</strong>
        <span>尚未提交</span>
        <p>${item.title}</p>
        <small>等待學生送出</small>
      `;
    overview.append(card);
  });
}

function renderLessonRecord() {
  document.querySelector("#lessonDate").value = lessonRecord.date || getToday();
  document.querySelector("#className").value = lessonRecord.className || "";
  document.querySelector("#cloudEndpoint").value = lessonRecord.cloudEndpoint || "";
  renderStudentShareLink();
}

function bindLessonRecordInputs() {
  document.querySelector("#lessonDate").addEventListener("change", (event) => {
    lessonRecord.date = event.target.value || getToday();
    saveLessonRecord();
  });
  document.querySelector("#className").addEventListener("input", (event) => {
    lessonRecord.className = event.target.value.trim();
    saveLessonRecord();
  });
  document.querySelector("#cloudEndpoint").addEventListener("input", (event) => {
    lessonRecord.cloudEndpoint = event.target.value.trim();
    saveLessonRecord();
    renderStudentShareLink();
  });
}

function getStudentShareLink() {
  const endpoint = lessonRecord.cloudEndpoint?.trim();
  if (!endpoint) return "";
  const url = new URL(window.location.href);
  url.searchParams.set("cloud", endpoint);
  url.searchParams.set("date", lessonRecord.date || getToday());
  if (lessonRecord.className) url.searchParams.set("className", lessonRecord.className);
  else url.searchParams.delete("className");
  return url.toString();
}

function renderStudentShareLink() {
  const input = document.querySelector("#studentShareLink");
  if (!input) return;
  input.value = getStudentShareLink();
}

function getBackupRows() {
  return cases.map((item, index) => {
    const submission = submissions[index];
    return {
      課程: lessonTitle,
      上課日期: submission?.lessonDate || lessonRecord.date || getToday(),
      班級: submission?.className || lessonRecord.className || "",
      組別: item.group,
      案件: item.title,
      提交時間: submission?.time || "",
      尾巴來源: submission?.action || "",
      來源理由: submission?.reason || "",
      影響對象: submission?.people?.join("、") || "",
      尾巴溫度: submission?.temperature?.join("、") || "",
      修復工具: submission?.repairs?.join("、") || "",
      修復做法: submission?.repairPlan || "",
      科技尾巴金句: submission?.goldenSentence || "",
      資料JSON: submission ? JSON.stringify(submission) : "",
    };
  });
}

function getBackupPayload() {
  return {
    lessonTitle,
    lessonDate: lessonRecord.date || getToday(),
    className: lessonRecord.className || "",
    exportedAt: new Date().toISOString(),
    rows: getBackupRows(),
    submissions,
  };
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCsvBackup() {
  const rows = getBackupRows();
  const headers = Object.keys(rows[0]);
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  downloadFile(`科技尾巴偵探局_${lessonRecord.date || getToday()}_${lessonRecord.className || "未填班級"}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
}

function downloadJsonBackup() {
  downloadFile(`科技尾巴偵探局_${lessonRecord.date || getToday()}_${lessonRecord.className || "未填班級"}.json`, JSON.stringify(getBackupPayload(), null, 2), "application/json;charset=utf-8");
}

function getRowsForSubmission(submission) {
  return [
    {
      課程: lessonTitle,
      上課日期: submission.lessonDate || lessonRecord.date || getToday(),
      班級: submission.className || lessonRecord.className || "",
      組別: submission.group,
      案件: submission.title,
      提交時間: submission.time || "",
      尾巴來源: submission.action || "",
      來源理由: submission.reason || "",
      影響對象: submission.people?.join("、") || "",
      尾巴溫度: submission.temperature?.join("、") || "",
      修復工具: submission.repairs?.join("、") || "",
      修復做法: submission.repairPlan || "",
      科技尾巴金句: submission.goldenSentence || "",
      資料JSON: JSON.stringify(submission),
    },
  ];
}

function getSubmittedBackupRows() {
  return getBackupRows().filter((row) => row["資料JSON"] || row["提交時間"]);
}

function postRowsToCloud(rows, statusElement) {
  const endpoint = lessonRecord.cloudEndpoint?.trim();
  if (!endpoint) {
    if (statusElement) statusElement.textContent = "請先貼上雲端備份網址，再按上傳。";
    return Promise.resolve(false);
  }
  return fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      lessonTitle,
      lessonDate: lessonRecord.date || getToday(),
      className: lessonRecord.className || "",
      activityKey: "activity1",
      exportedAt: new Date().toISOString(),
      rows,
    }),
  })
    .then(() => true)
    .catch(() => false);
}

function uploadGroupSubmission(submission) {
  const hint = document.querySelector("#submitHint");
  if (!lessonRecord.cloudEndpoint?.trim()) {
    hint.textContent = "本組已提交在這台裝置，但目前不是學生雲端連結，資料不會進老師雲端後台。請用老師提供的學生連結重新進入。";
    return;
  }
  hint.textContent = `${submission.group}已提交，正在送到老師後台...`;
  Promise.race([postRowsToCloud(getRowsForSubmission(submission)), new Promise((resolve) => setTimeout(() => resolve(true), 4500))]).then((ok) => {
    hint.textContent = ok ? `${submission.group}已提交，已送出雲端收件箱。` : `${submission.group}已提交本機；雲端送出失敗，請告訴老師。`;
  });
}

async function uploadCloudBackup() {
  const status = document.querySelector("#cloudStatus");
  const endpoint = lessonRecord.cloudEndpoint?.trim();
  if (!endpoint) {
    status.textContent = "請先貼上雲端備份網址，再按上傳。";
    return;
  }
  const submittedRows = getSubmittedBackupRows();
  if (submittedRows.length === 0) {
    status.textContent = "目前還沒有任何小組提交資料，不會上傳空白備份。學生提交後，老師請按「同步雲端資料到後台」。";
    return;
  }
  status.textContent = "正在送出雲端備份...";
  try {
    await Promise.race([postRowsToCloud(submittedRows, status), new Promise((resolve) => setTimeout(resolve, 4500))]);
    status.textContent = `已送出 ${submittedRows.length} 筆已提交資料，請到活動一收件箱確認。`;
  } catch {
    status.textContent = "上傳失敗，請檢查網路或雲端備份網址。";
  }
}

function readCloudRows() {
  const endpoint = lessonRecord.cloudEndpoint?.trim();
  const status = document.querySelector("#cloudStatus");
  if (!endpoint) {
    status.textContent = "請先貼上雲端備份網址，才能同步學生資料。";
    return;
  }
  const callbackName = `tailDetectiveSync_${Date.now()}`;
  const url = new URL(endpoint);
  url.searchParams.set("mode", "read");
  url.searchParams.set("lessonTitle", lessonTitle);
  url.searchParams.set("callback", callbackName);
  status.textContent = "正在同步雲端資料...";

  window[callbackName] = (payload) => {
    try {
      mergeCloudRows(payload.rows || []);
      saveSubmissions();
      render();
      status.textContent = `已同步 ${payload.rows?.length || 0} 筆活動一資料到教師後台。`;
    } finally {
      delete window[callbackName];
      document.querySelector(`#${callbackName}`)?.remove();
    }
  };

  const script = document.createElement("script");
  script.id = callbackName;
  script.src = url.toString();
  script.onerror = () => {
    status.textContent = "同步失敗，請確認 Apps Script 已使用新版程式碼並允許所有人存取。";
    delete window[callbackName];
    script.remove();
  };
  document.body.append(script);
}

function mergeCloudRows(rows) {
  rows.forEach((row) => {
    let submission = null;
    if (row["資料JSON"]) {
      try {
        submission = JSON.parse(row["資料JSON"]);
      } catch {
        submission = null;
      }
    }
    if (!submission) {
      submission = {
        lessonTitle,
        lessonDate: row["上課日期"] || lessonRecord.date,
        className: row["班級"] || lessonRecord.className,
        group: row["組別"],
        title: row["案件"],
        story: cases.find((item) => item.group === row["組別"])?.story || "",
        time: row["提交時間"] || "",
        action: row["尾巴來源"] || "",
        reason: row["來源理由"] || "",
        people: row["影響對象"] ? row["影響對象"].split("、") : [],
        temperature: row["尾巴溫度"] ? row["尾巴溫度"].split("、") : [],
        repairs: row["修復工具"] ? row["修復工具"].split("、") : [],
        repairPlan: row["修復做法"] || "",
        goldenSentence: row["科技尾巴金句"] || "",
      };
    }
    const index = cases.findIndex((item) => item.group === submission.group);
    if (index >= 0) submissions[index] = submission;
  });
}

function copyStudentShareLink() {
  const link = getStudentShareLink();
  const status = document.querySelector("#cloudStatus");
  if (!link) {
    status.textContent = "請先貼上雲端備份網址，才會產生學生掃描連結。";
    return;
  }
  navigator.clipboard?.writeText(link).then(
    () => {
      status.textContent = "已複製學生掃描連結。學生用這個連結提交，老師才能同步看到。";
    },
    () => {
      document.querySelector("#studentShareLink").select();
      status.textContent = "已選取學生連結，請手動複製。";
    }
  );
}

function render() {
  renderGroupTabs();
  renderCase();
  renderForest();
  renderDashboard();
}

bindBoardInputs();
bindLessonRecordInputs();

document.querySelector("#startBtn").addEventListener("click", () => {
  document.querySelector(".workspace").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  drafts = cases.map(() => createDraft());
  render();
});

document.querySelector("#submitBtn").addEventListener("click", submitCurrentGroup);

document.querySelector("#unlockDashboard").addEventListener("click", () => {
  const password = document.querySelector("#teacherPassword");
  const hint = document.querySelector("#passwordHint");
  if (password.value.trim() === "888") {
    dashboardUnlocked = true;
    sessionStorage.setItem("tailDetectiveTeacherUnlocked", "true");
    password.value = "";
    hint.textContent = "已進入教師後台。";
    render();
    return;
  }
  hint.textContent = "密碼不正確，請再試一次。";
  password.select();
});

document.querySelector("#teacherPassword").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.querySelector("#unlockDashboard").click();
  }
});

document.querySelector("#lockDashboard").addEventListener("click", () => {
  dashboardUnlocked = false;
  sessionStorage.removeItem("tailDetectiveTeacherUnlocked");
  render();
});

document.querySelector("#clearBtn").addEventListener("click", () => {
  submissions = {};
  saveSubmissions();
  render();
});

document.querySelector("#downloadCsv").addEventListener("click", downloadCsvBackup);
document.querySelector("#downloadJson").addEventListener("click", downloadJsonBackup);
document.querySelector("#uploadCloud").addEventListener("click", uploadCloudBackup);
document.querySelector("#syncCloud").addEventListener("click", readCloudRows);
document.querySelector("#copyStudentLink").addEventListener("click", copyStudentShareLink);

render();
