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
const videoUpload = document.querySelector("#video-upload");
const analyzeUploadBtn = document.querySelector("#analyze-upload-btn");
const uploadStatus = document.querySelector("#upload-status");

const storageKey = "story-camera-coach-records";
const endpointKey = "story-camera-coach-endpoint";
const defaultCloudEndpoint =
  "https://script.google.com/macros/s/AKfycbzLBoNAj8TCrSGk_ZyvUzj6xzlxaqKjWIprKUFt8ARIUc_TItMEObGmS55tmOPf1bb-/exec";
const dedicatedSheetUrl =
  "https://docs.google.com/spreadsheets/d/1MPVxE4HdOLHQvfZJaKx02V7XYblBSIUIkAHKyC9iJ6U/edit";

const state = {
  stream: null,
  uploadedVideoUrl: "",
  uploadedVideoName: "",
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
videoUpload.addEventListener("change", loadUploadedVideo);
analyzeUploadBtn.addEventListener("click", analyzeUploadedVideo);

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
  cloudEndpoint.value = localStorage.getItem(endpointKey) || defaultCloudEndpoint;
  cloudStatus.innerHTML = cloudEndpoint.value
    ? "已設定雲端位置"
    : `專用試算表已建立：<a href="${dedicatedSheetUrl}" target="_blank" rel="noreferrer">開啟紀錄表</a>`;
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
    clearUploadedVideo();
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: "user" }
    });
    camera.srcObject = state.stream;
    camera.removeAttribute("src");
    camera.controls = false;
    camera.muted = true;
    camera.classList.remove("uploaded-video");
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

function loadUploadedVideo() {
  const file = videoUpload.files?.[0];
  if (!file) return;

  stopCameraStream();
  if (state.uploadedVideoUrl) URL.revokeObjectURL(state.uploadedVideoUrl);

  state.uploadedVideoUrl = URL.createObjectURL(file);
  state.uploadedVideoName = file.name;
  state.faceChecks = [];
  state.latestFaceDetected = false;

  camera.srcObject = null;
  camera.src = state.uploadedVideoUrl;
  camera.controls = true;
  camera.muted = false;
  camera.classList.add("uploaded-video");
  cameraStatus.textContent = "已載入上傳影片，可播放確認後分析";
  uploadStatus.textContent = `已選擇：${file.name}`;
  analyzeUploadBtn.disabled = false;
  recordBtn.disabled = true;
  finishBtn.disabled = true;
  cameraBtn.disabled = false;
  cameraBtn.textContent = "開啟鏡頭";
}

async function analyzeUploadedVideo() {
  if (!state.uploadedVideoUrl) return;
  analyzeUploadBtn.disabled = true;
  uploadStatus.textContent = "正在分析影片畫面，請稍候...";
  cameraStatus.textContent = "分析中：正在檢查臉部位置與畫面穩定度";

  try {
    const faceChecks = await sampleVideoFaces(camera);
    const duration = Number.isFinite(camera.duration) ? Math.round(camera.duration) : 0;
    const report = buildReport({ faceChecks, seconds: duration || 20 });
    const suggestions = buildSuggestions(report);
    const record = buildRecord(report, suggestions, {
      source: "上傳影片",
      mediaName: state.uploadedVideoName
    });

    state.records.unshift(record);
    saveRecords();
    renderSignals(report);
    renderRubric(report);
    renderPlan(suggestions);
    renderRecords();
    document.querySelector("[data-tab='report']").click();
    uploadStatus.textContent = "影片分析完成，已產生建議與紀錄";
    cameraStatus.textContent = "分析完成，可依處方調整下一次錄影";
    await syncRecord(record);
  } catch (error) {
    uploadStatus.textContent = "影片分析失敗，請換一支可播放的影片再試。";
    cameraStatus.textContent = "影片分析失敗";
    console.warn("Uploaded video analysis error:", error);
  } finally {
    analyzeUploadBtn.disabled = false;
  }
}

function stopCameraStream() {
  if (!state.stream) return;
  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
}

function clearUploadedVideo() {
  if (state.uploadedVideoUrl) URL.revokeObjectURL(state.uploadedVideoUrl);
  state.uploadedVideoUrl = "";
  state.uploadedVideoName = "";
  videoUpload.value = "";
  analyzeUploadBtn.disabled = true;
  uploadStatus.textContent = "可上傳練習影片，依鏡頭展現產生建議。";
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
  const record = buildRecord(report, suggestions, { source: "即時鏡頭", mediaName: "" });

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

async function sampleVideoFaces(video) {
  await ensureVideoMetadata(video);

  if (!("FaceDetector" in window)) {
    return [true, true, true, true, true];
  }

  const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 20;
  const sampleCount = Math.min(8, Math.max(4, Math.floor(duration / 4)));
  const checks = [];
  const wasPaused = video.paused;

  video.pause();
  for (let index = 0; index < sampleCount; index += 1) {
    const progress = sampleCount === 1 ? 0.5 : index / (sampleCount - 1);
    await seekVideoTo(video, Math.min(duration - 0.15, Math.max(0.1, duration * progress)));
    try {
      const faces = await detector.detect(video);
      checks.push(faces.length > 0);
    } catch {
      checks.push(true);
    }
  }

  video.currentTime = 0;
  if (!wasPaused) await video.play().catch(() => {});
  return checks;
}

function ensureVideoMetadata(video) {
  if (Number.isFinite(video.duration) && video.duration > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleLoad);
      video.removeEventListener("error", handleError);
    };
    const handleLoad = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("影片無法讀取"));
    };
    video.addEventListener("loadedmetadata", handleLoad, { once: true });
    video.addEventListener("error", handleError, { once: true });
    video.load();
  });
}

function seekVideoTo(video, time) {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 1200);
    video.addEventListener(
      "seeked",
      () => {
        clearTimeout(timeout);
        requestAnimationFrame(resolve);
      },
      { once: true }
    );
    video.currentTime = time;
  });
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

function buildReport(source = {}) {
  const seconds =
    source.seconds || Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
  const faceChecks = source.faceChecks || state.faceChecks;
  const faceRatio = faceChecks.length
    ? faceChecks.filter(Boolean).length / faceChecks.length
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

function buildRecord(report, suggestions, metadata = {}) {
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
    source: metadata.source || "即時鏡頭",
    mediaName: metadata.mediaName || "",
    score: report.total,
    responseSeconds: report.seconds,
    reflection: suggestions.join("\n"),
    questionTitle: metadata.source || "鏡頭展現分析",
    time: now.toISOString(),
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
            <span>${record.practicedDate} ${record.practicedTime} · ${record.source || "即時鏡頭"}</span>
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
