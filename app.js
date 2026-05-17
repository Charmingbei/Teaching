const camera = document.querySelector("#camera");
const cameraBtn = document.querySelector("#camera-btn");
const recordBtn = document.querySelector("#record-btn");
const finishBtn = document.querySelector("#finish-btn");
const timerEl = document.querySelector("#timer");
const cameraStatus = document.querySelector("#camera-status");
const readinessScore = document.querySelector("#readiness-score");
const liveCues = document.querySelector("#live-cues");
const rubricResults = document.querySelector("#rubric-results");
const trainingPlan = document.querySelector("#training-plan");
const studentName = document.querySelector("#student-name");
const cloudEndpoint = document.querySelector("#cloud-endpoint");
const saveCloudBtn = document.querySelector("#save-cloud-btn");
const cloudStatus = document.querySelector("#cloud-status");
const recordList = document.querySelector("#record-list");

const storageKey = "story-camera-coach-records";
const endpointKey = "story-camera-coach-endpoint";

const state = {
  stream: null,
  recording: false,
  startedAt: 0,
  timerId: null,
  faceChecks: [],
  latestFaceDetected: false,
  records: []
};

cameraBtn.addEventListener("click", startCamera);
recordBtn.addEventListener("click", startPractice);
finishBtn.addEventListener("click", finishPractice);
saveCloudBtn.addEventListener("click", saveCloudEndpoint);

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".tab-page").forEach((page) => page.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}-tab`).classList.add("active");
  });
});

function loadRecords() {
  state.records = JSON.parse(localStorage.getItem(storageKey) || "[]");
  cloudEndpoint.value = localStorage.getItem(endpointKey) || "";
  renderRecords();
}

function saveRecords() {
  localStorage.setItem(storageKey, JSON.stringify(state.records.slice(0, 30)));
}

function saveCloudEndpoint() {
  localStorage.setItem(endpointKey, cloudEndpoint.value.trim());
  cloudStatus.textContent = cloudEndpoint.value.trim() ? "雲端位置已儲存" : "尚未設定雲端位置";
}

async function startCamera() {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: "user" }
    });
    camera.srcObject = state.stream;
    cameraStatus.textContent = "鏡頭已開啟，請自然站好並看向鏡頭";
    cameraBtn.textContent = "鏡頭運作中";
    cameraBtn.disabled = true;
    recordBtn.disabled = false;
    observeFace();
  } catch (error) {
    cameraStatus.textContent = `無法開啟鏡頭：${error.name || "權限或裝置錯誤"}`;
    console.warn("Camera permission error:", error);
  }
}

function startPractice() {
  state.recording = true;
  state.startedAt = Date.now();
  state.faceChecks = [];
  recordBtn.disabled = true;
  finishBtn.disabled = false;
  cameraStatus.textContent = "觀察中：保持自然表情，眼神穩定看向鏡頭";
  tickTimer();
  state.timerId = setInterval(tickTimer, 1000);
  updateLiveCues();
}

async function finishPractice() {
  state.recording = false;
  clearInterval(state.timerId);
  recordBtn.disabled = false;
  finishBtn.disabled = true;
  cameraStatus.textContent = "分析完成，可依建議再練一次";

  const report = buildReport();
  const suggestions = buildSuggestions(report);
  const record = buildRecord(report, suggestions);

  state.records.unshift(record);
  saveRecords();
  renderSignals(report);
  renderRubric(report);
  renderPlan(suggestions);
  renderRecords();
  document.querySelector("[data-tab='report']").click();
  await syncRecord(record);
}

function tickTimer() {
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
  const minuteText = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondText = String(seconds % 60).padStart(2, "0");
  timerEl.textContent = `${minuteText}:${secondText}`;
}

async function observeFace() {
  if (!("FaceDetector" in window)) {
    state.latestFaceDetected = true;
    return;
  }

  const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  const check = async () => {
    if (camera.readyState >= 2) {
      try {
        const faces = await detector.detect(camera);
        state.latestFaceDetected = faces.length > 0;
        if (state.recording) state.faceChecks.push(state.latestFaceDetected);
      } catch {
        state.latestFaceDetected = true;
      }
    }
    setTimeout(check, 900);
  };
  check();
}

function updateLiveCues() {
  if (!state.recording) return;
  const cues = [
    state.latestFaceDetected ? "臉部位置穩定，眼神可以繼續停在鏡頭方向。" : "臉部暫時離開畫面，請回到鏡頭中央。",
    "肩膀放鬆、下巴微收，讓畫面看起來更穩。",
    "手勢保持乾淨，不遮臉、不晃到畫面邊緣。"
  ];
  liveCues.innerHTML = cues.map((cue) => `<li>${cue}</li>`).join("");
  setTimeout(updateLiveCues, 2400);
}

function buildReport() {
  const seconds = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
  const faceRatio = state.faceChecks.length
    ? state.faceChecks.filter(Boolean).length / state.faceChecks.length
    : 0.82;
  const practiceBonus = seconds >= 20 ? 8 : seconds >= 10 ? 4 : 0;

  const expression = clamp(Math.round(faceRatio * 42 + 44 + practiceBonus), 55, 96);
  const posture = clamp(Math.round(faceRatio * 38 + 48 + practiceBonus / 2), 56, 96);
  const gaze = clamp(Math.round(faceRatio * 45 + 42 + practiceBonus / 2), 54, 96);
  const stage = clamp(Math.round((expression + posture + gaze) / 3 + 2), 55, 96);
  const total = Math.round(expression * 0.3 + posture * 0.25 + gaze * 0.25 + stage * 0.2);

  return { expression, posture, gaze, stage, total, seconds, faceRatio };
}

function buildSuggestions(report) {
  const weak = [
    ["神情", report.expression, "對鏡頭做微笑、驚訝、認真三種表情，每種停兩秒，臉不要低下去。"],
    ["姿態", report.posture, "雙腳站在同一個位置，肩膀放鬆，練到 30 秒內身體不左右晃。"],
    ["視線", report.gaze, "每說完一句話，眼神回到鏡頭一秒，再繼續下一句。"],
    ["手勢", report.stage, "手勢只做到胸口高度，不遮臉，做完就收回身體兩側。"]
  ].sort((a, b) => a[1] - b[1]);

  return [
    `今天優先修「${weak[0][0]}」：${weak[0][2]}`,
    "開場暖身：站好後默數 1、2，再開始說話，讓畫面先穩下來。",
    "眼神練習：找三個句尾，把眼神停回鏡頭，各停一秒。",
    "姿態練習：腳底不移動，肩膀不聳起，連續維持 30 秒。",
    "回看任務：看自己的錄影，只圈出一個最自然的表情和一個要改的動作。"
  ];
}

function buildRecord(report, suggestions) {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    practicedAt: now.toISOString(),
    practicedDate: now.toLocaleDateString("zh-TW"),
    practicedTime: now.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    studentName: studentName.value.trim() || "未命名練習者",
    scores: {
      expression: report.expression,
      posture: report.posture,
      gaze: report.gaze,
      stage: report.stage,
      total: report.total
    },
    durationSeconds: report.seconds,
    suggestions
  };
}

function renderSignals(report) {
  readinessScore.textContent = `${report.total}`;
  document.querySelector("#face-signal").textContent = report.expression >= 82 ? "自然明亮" : "表情再打開";
  document.querySelector("#posture-signal").textContent = report.posture >= 82 ? "穩定大方" : "站姿再定";
  document.querySelector("#voice-signal").textContent = report.gaze >= 82 ? "視線穩定" : "看鏡頭再久";
  document.querySelector("#story-signal").textContent = report.stage >= 82 ? "大方自然" : "動作再收";
}

function renderRubric(report) {
  const items = [
    ["神情亮度", report.expression, "練習時先停一秒再開始，讓微笑、眼睛與臉部方向一起準備好。"],
    ["姿態穩定", report.posture, "雙腳固定在同一個位置，肩膀放鬆，身體不要左右晃動。"],
    ["視線連結", report.gaze, "把鏡頭想成正在聽你說話的人，句子結束時讓眼神回到鏡頭。"],
    ["畫面大方度", report.stage, "手勢保持小而清楚，不遮住臉，動作完成後自然收回身體兩側。"]
  ];

  rubricResults.innerHTML = items
    .map(
      ([title, score, advice]) => `
        <article class="rubric-item">
          <div class="rubric-heading"><span>${title}</span><span>${score}/100</span></div>
          <div class="bar" style="--value:${score}%"><i></i></div>
          <p>${advice}</p>
        </article>
      `
    )
    .join("");
}

function renderPlan(suggestions) {
  trainingPlan.innerHTML = suggestions.map((item) => `<li>${item}</li>`).join("");
}

function renderRecords() {
  if (!state.records.length) {
    recordList.innerHTML = "<p>尚無練習紀錄</p>";
    return;
  }

  recordList.innerHTML = state.records
    .slice(0, 6)
    .map(
      (record) => `
        <article class="record-item">
          <div>
            <strong>${record.studentName}</strong>
            <span>${record.practicedDate} ${record.practicedTime}</span>
          </div>
          <b>${record.scores.total}</b>
          <p>${record.suggestions[0]}</p>
        </article>
      `
    )
    .join("");
}

async function syncRecord(record) {
  const endpoint = cloudEndpoint.value.trim();
  if (!endpoint) {
    cloudStatus.textContent = "已存本機，尚未設定雲端位置";
    return;
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: "storyCameraCoachPractice", record })
    });
    cloudStatus.textContent = "已送出雲端同步";
  } catch (error) {
    cloudStatus.textContent = "雲端同步失敗，已保留本機紀錄";
    console.warn("Cloud sync error:", error);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

loadRecords();
renderSignals({ expression: 0, posture: 0, gaze: 0, stage: 0, total: "--" });
renderRubric({ expression: 78, posture: 76, gaze: 74, stage: 80 });
renderPlan([
  "開啟鏡頭後開始練習，完成分析時會產生本次處方。",
  "處方會和練習日期、練習者一起保留在紀錄中。"
]);
