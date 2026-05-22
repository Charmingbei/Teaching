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
const voiceScoreInput = document.querySelector("#voice-score");
const contentScoreInput = document.querySelector("#content-score");
const mannerScoreInput = document.querySelector("#manner-score");
const timeMinInput = document.querySelector("#time-min");
const timeMaxInput = document.querySelector("#time-max");

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
    state.latestFaceDetected ? "儀態穩定，表情可以再亮一點，讓聽眾更容易被你吸引。" : "臉部暫時離開畫面，請回到鏡頭中央。",
    "語音練習重點：每個字的聲母、韻母和聲調都說完整，不急著衝下一句。",
    "內容練習重點：說到轉折時停一下，讓故事的開始、經過、結果更清楚。"
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
  const practiceBonus = seconds >= 20 ? 1 : seconds >= 10 ? 0.5 : 0;
  const visualManner = clamp(Math.round(faceRatio * 7 + 2 + practiceBonus), 0, 10);
  const enteredManner = readNumber(mannerScoreInput, 8, 0, 10);
  const manner = clamp(Math.round((visualManner + enteredManner) / 2), 0, 10);
  const voice = readNumber(voiceScoreInput, 45, 0, 60);
  const content = readNumber(contentScoreInput, 22, 0, 30);
  const timeMin = readNumber(timeMinInput, 3, 0, 60) * 60;
  const timeMax = readNumber(timeMaxInput, 4, 0, 60) * 60;
  const timePenalty = calculateTimePenalty(seconds, timeMin, timeMax);
  const rawTotal = voice + content + manner;
  const total = clamp(rawTotal - timePenalty, 0, 100);

  mannerScoreInput.value = String(manner);

  return {
    voice,
    content,
    manner,
    visualManner,
    timePenalty,
    rawTotal,
    total,
    seconds,
    timeMin,
    timeMax,
    faceRatio
  };
}

function buildSuggestions(report) {
  const weak = [
    ["語音", report.voice / 60, "慢一點把字說圓：每天挑 5 句，先一字一字說清楚，再連成自然的句子。"],
    ["內容", report.content / 30, "把故事分成開始、經過、結果三段，每段先用一句話說出重點。"],
    ["儀態", report.manner / 10, "站穩、看前方、表情跟著情節變化；手勢只在重要地方出現。"]
  ].sort((a, b) => a[1] - b[1]);

  const timeAdvice =
    report.timePenalty > 0
      ? `時間提醒：這次時間為 ${formatDuration(report.seconds)}，已扣 ${report.timePenalty} 分。下一次先練到 ${formatDuration(report.timeMin)} 到 ${formatDuration(report.timeMax)} 之間。`
      : `時間很穩：${formatDuration(report.seconds)} 落在標準範圍內，這是很棒的比賽習慣。`;

  return [
    `很棒的是，你已經完成一次完整練習。今天優先修「${weak[0][0]}」：${weak[0][2]}`,
    "語音處方：錄 30 秒，只檢查聲、韻、調。聽到含糊的字，就把那一句重說 3 次。",
    "內容處方：練習前先說出三個段落標題，讓故事有清楚的路線。",
    "儀態處方：站好後默數 1、2 再開始；說到開心、緊張、驚訝時，讓表情跟著出現。",
    timeAdvice
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
      voice: report.voice,
      content: report.content,
      manner: report.manner,
      timePenalty: report.timePenalty,
      rawTotal: report.rawTotal,
      expression: report.voice,
      posture: report.content,
      gaze: report.manner,
      stage: report.timePenalty,
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
  document.querySelector("#face-signal").textContent = `${report.voice}/60`;
  document.querySelector("#posture-signal").textContent = `${report.content}/30`;
  document.querySelector("#voice-signal").textContent = `${report.manner}/10`;
  document.querySelector("#story-signal").textContent =
    report.timePenalty > 0 ? `扣 ${report.timePenalty} 分` : "未扣分";
}

function renderRubric(report) {
  const items = [
    ["語音（聲、韻、調）", report.voice, 60, buildVoiceComment(report.voice)],
    ["內容（思想、結構）", report.content, 30, buildContentComment(report.content)],
    ["儀態（動作、表情）", report.manner, 10, buildMannerComment(report.manner)],
    [
      "時間扣分",
      report.timePenalty,
      "扣分",
      report.timePenalty > 0
        ? `這次時間 ${formatDuration(report.seconds)}，依規則扣 ${report.timePenalty} 分。下次先用計時器練到標準時間內。`
        : `這次時間 ${formatDuration(report.seconds)}，沒有時間扣分，節奏掌握得很穩。`
    ]
  ];

  rubricResults.innerHTML = items
    .map(
      ([title, score, maxScore, advice]) => `
        <article class="rubric-item">
          <div class="rubric-heading"><span>${title}</span><span>${formatRubricScore(score, maxScore)}</span></div>
          <div class="bar" style="--value:${getRubricBarValue(score, maxScore)}%"><i></i></div>
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

function formatRubricScore(score, maxScore) {
  if (maxScore === "扣分") return score > 0 ? `扣 ${score} 分` : "未扣分";
  return `${score}/${maxScore}`;
}

function getRubricBarValue(score, maxScore) {
  if (maxScore === "扣分") return score > 0 ? Math.min(100, score * 10) : 0;
  return Math.round((score / maxScore) * 100);
}

function readNumber(input, fallback, min, max) {
  const value = Number(input.value);
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}

function calculateTimePenalty(seconds, minSeconds, maxSeconds) {
  if (!minSeconds && !maxSeconds) return 0;
  let offSeconds = 0;
  if (minSeconds && seconds < minSeconds) offSeconds = minSeconds - seconds;
  if (maxSeconds && seconds > maxSeconds) offSeconds = seconds - maxSeconds;
  if (offSeconds <= 0) return 0;
  return Math.ceil(offSeconds / 30) * 2;
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function buildVoiceComment(score) {
  if (score >= 52) return "語音很清楚，聲、韻、調已經有穩定感。下一步可以練情緒變化，讓聲音更有畫面。";
  if (score >= 42) return "語音有基礎，孩子已經敢說出來了。下一次請放慢速度，把容易糊掉的字圈出來重練。";
  return "語音還在暖身期，請先不要急。每天練 5 句，把每個字說完整，清楚度會很快進步。";
}

function buildContentComment(score) {
  if (score >= 26) return "內容結構清楚，故事有方向。可以再加強轉折前後的停頓，讓聽眾更容易跟上。";
  if (score >= 20) return "內容已經聽得出主線。下一次先用三句話整理開始、經過、結果，再完整說一次。";
  return "內容可以慢慢整理，不用一次背很多。先抓住故事最重要的三件事，說清楚就很棒。";
}

function buildMannerComment(score) {
  if (score >= 8) return "儀態自然大方，表情和動作能幫助故事。下一步讓眼神在句尾穩定停一下。";
  if (score >= 6) return "儀態已經穩住了。下一次練腳不移動、肩膀放鬆，手勢只放在最重要的句子。";
  return "儀態還可以更放鬆。先練站穩 30 秒，微笑看前方，再開始說，孩子會更有安全感。";
}

loadRecords();
renderSignals({ voice: 0, content: 0, manner: 0, timePenalty: 0, total: "--" });
renderRubric({ voice: 45, content: 22, manner: 8, timePenalty: 0, seconds: 0 });
renderPlan([
  "請先依正式標準填入語音、內容、儀態分數，再開始或上傳練習。",
  "處方會和練習日期、練習者一起保留在紀錄中。"
]);
