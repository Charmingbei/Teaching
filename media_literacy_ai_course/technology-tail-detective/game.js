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
    return saved ? JSON.parse(saved) : { date: getToday(), className: "", cloudEndpoint: "" };
  } catch {
    return { date: getToday(), className: "", cloudEndpoint: "" };
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

function renderLessonRecord() {
  document.querySelector("#lessonDate").value = lessonRecord.date || getToday();
  document.querySelector("#className").value = lessonRecord.className || "";
  document.querySelector("#cloudEndpoint").value = lessonRecord.cloudEndpoint || "";
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
  });
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

async function uploadCloudBackup() {
  const status = document.querySelector("#cloudStatus");
  const endpoint = lessonRecord.cloudEndpoint?.trim();
  if (!endpoint) {
    status.textContent = "請先貼上雲端備份網址，再按上傳。";
    return;
  }
  status.textContent = "正在送出雲端備份...";
  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(getBackupPayload()),
    });
    status.textContent = "已送出雲端備份，請到雲端試算表確認是否新增。";
  } catch {
    status.textContent = "上傳失敗，請檢查網路或雲端備份網址。";
  }
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

render();
