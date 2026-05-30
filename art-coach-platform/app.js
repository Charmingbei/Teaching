const storageKey = "art-coach-platform-records";
const endpointKey = "art-coach-platform-endpoint";
const teacherPassword = "888";

const mediaOptions = ["鉛筆素描", "彩色鉛筆", "水彩", "壓克力", "水墨", "麥克筆", "拼貼", "版畫", "數位繪圖"];
const themeOptions = ["生活觀察", "自然與環境", "人物故事", "想像與未來", "節慶文化", "社會議題", "情緒表達", "設計海報"];

const state = {
  records: [],
  syncQueue: [],
  endpoint: "",
  teacherAuthenticated: false,
  imageStats: { composition: null, competition: null }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  state.records = saved.records || [];
  state.syncQueue = saved.syncQueue || [];
  state.endpoint = localStorage.getItem(endpointKey) || saved.endpoint || "";
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify({
    records: state.records,
    syncQueue: state.syncQueue,
    endpoint: state.endpoint
  }));
  localStorage.setItem(endpointKey, state.endpoint);
}

function fillSelects() {
  $$("select[name='medium']").forEach((select) => {
    select.innerHTML = mediaOptions.map((item) => `<option value="${item}">${item}</option>`).join("");
  });
  $$("select[name='theme']").forEach((select) => {
    select.innerHTML = themeOptions.map((item) => `<option value="${item}">${item}</option>`).join("");
  });
}

function showView(view) {
  $$(".view").forEach((section) => section.classList.toggle("active", section.id === `${view}-view`));
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  if (view === "teacher") renderTeacherAccess();
}

function renderTeacherAccess() {
  $("#teacher-lock").classList.toggle("hidden", state.teacherAuthenticated);
  $("#teacher-dashboard").classList.toggle("hidden", !state.teacherAuthenticated);
  if (state.teacherAuthenticated) renderTeacher();
}

function unlockTeacher() {
  const input = $("#teacher-password-input").value.trim();
  if (input === teacherPassword) {
    state.teacherAuthenticated = true;
    $("#teacher-password-input").value = "";
    $("#teacher-login-message").textContent = "已進入教師後台。";
    renderTeacherAccess();
    return;
  }
  $("#teacher-login-message").textContent = "密碼錯誤，請再試一次。";
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function inferLevel(className = "") {
  const value = String(className).trim();
  if (/^[1-2]/.test(value) || /一|二|低/.test(value)) return "低年級";
  if (/^[3-4]/.test(value) || /三|四|中/.test(value)) return "中年級";
  if (/^[5-6]/.test(value) || /五|六|高/.test(value)) return "高年級";
  if (/^[7-9]/.test(value) || /國中|七|八|九/.test(value)) return "國中";
  if (/高中|高一|高二|高三|10|11|12/.test(value)) return "高中";
  return "高年級";
}

function classAdvice(className) {
  const level = inferLevel(className);
  return {
    "低年級": "以大形狀、明確主角與安全嘗試為主，建議一次只調整一到兩個重點。",
    "中年級": "可開始練習前中後景、大小對比與色彩主次，讓畫面有故事路線。",
    "高年級": "適合加入視覺焦點、明暗層次、構圖裁切與主題象徵，提升作品完整度。",
    "國中": "可加入風格選擇、視覺節奏、材質控制與創作意圖，讓作品有個人觀點。",
    "高中": "建議以系列思考、形式語言、媒材實驗與作品論述來深化表現。"
  }[level] || "先確認作品主題，再調整構圖、媒材技法與完成度。";
}

function mediumAdvice(medium) {
  return {
    "鉛筆素描": "先壓出三到五個明度層次，焦點區域邊緣最清楚，背景可降低對比。",
    "彩色鉛筆": "用同色系疊色建立體積，焦點處增加冷暖變化，不要只平均塗滿。",
    "水彩": "先保留亮面，再用大面積淡色統一氣氛，最後只在焦點補深色與細節。",
    "壓克力": "先鋪大色塊，再用厚薄、乾刷或覆蓋建立層次，避免每個區域都同樣用力。",
    "水墨": "注意濃淡乾濕與留白，主體可用較肯定的線，背景以淡墨拉開空間。",
    "麥克筆": "先規劃色票與大面積方向，焦點可用較高彩度，陰影用同色系深色。",
    "拼貼": "先確定最大形狀與視覺方向，再用材質差異凸顯主角，不要讓碎片平均分散。",
    "版畫": "強化黑白塊面、線條方向與節奏，主題輪廓需要比一般繪畫更簡潔明確。",
    "數位繪圖": "分圖層管理草稿、色塊、光影與細節，縮小畫面檢查主角是否仍清楚。"
  }[medium] || "先掌握大形、大色與焦點，再處理局部細節。";
}

function analyzeStats(stats) {
  if (!stats) {
    return {
      label: "尚未讀取影像",
      focus: "請加入作品照片，系統就能把建議連結到畫面的亮度、對比與留白狀態。",
      needs: ["補上照片後檢查主體是否清楚", "確認畫面上下左右是否有刻意安排", "用一句話說明作品最重要的視覺焦點"]
    };
  }

  const needs = [];
  if (stats.contrast < 42) needs.push("明暗對比偏弱，可在主角旁增加最深與最亮的區域");
  if (stats.brightness > 176) needs.push("畫面整體偏亮，可保留亮部並加深背景或投影");
  if (stats.brightness < 82) needs.push("畫面整體偏暗，建議打開主角亮面與中間調");
  if (stats.edgeDensity < 0.11) needs.push("細節與邊緣偏少，可在焦點區補明確輪廓與材質線索");
  if (stats.edgeDensity > 0.29) needs.push("細節密度偏高，需讓背景或次要物件退後");
  if (Math.abs(stats.leftWeight - stats.rightWeight) < 0.04) needs.push("左右重量接近平均，可讓主體稍微偏離中心，增加畫面張力");
  if (stats.topWeight > stats.bottomWeight + 0.08) needs.push("上方視覺重量較重，可在下方補穩定的地面、陰影或前景");
  if (needs.length < 3) needs.push("目前畫面基礎穩定，可進一步加強主角和背景的層次差");

  return {
    label: `亮度 ${Math.round(stats.brightness)}、對比 ${Math.round(stats.contrast)}、細節密度 ${Math.round(stats.edgeDensity * 100)}%`,
    focus: stats.contrast >= 55
      ? "畫面已有可被辨識的明暗差，接下來重點是讓最高對比集中在主角。"
      : "畫面目前較容易平均化，建議先用明暗與大小差把主角推到第一眼位置。",
    needs: needs.slice(0, 4)
  };
}

function buildCompositionGuide(data) {
  const statsGuide = analyzeStats(state.imageStats.composition);
  const note = data.note ? `你提到「${escapeHtml(data.note)}」，可以把它當作本次修改的主要目標。` : "若還沒有明確問題，先從主角是否第一眼被看見開始檢查。";
  return `
    <article class="advice-card">
      <h3>構圖診斷</h3>
      <p>${statsGuide.label}。${statsGuide.focus}</p>
      <p>${note}</p>
    </article>
    <article class="advice-card">
      <h3>給 ${escapeHtml(data.className)}、${escapeHtml(data.medium)} 的具體修改</h3>
      <ol>
        <li>先用手遮住背景，確認主角輪廓是否仍清楚；若不清楚，先加強主角外形或明暗邊界。</li>
        <li>把最深色、最亮色或最鮮豔色集中在主角附近，其他地方降低一階對比。</li>
        <li>檢查前景、中景、背景是否都有位置；缺少層次時，可加一個前景遮擋或遠景淡化。</li>
        <li>${mediumAdvice(data.medium)}</li>
      </ol>
    </article>
    <article class="advice-card">
      <h3>本次優先修正</h3>
      <ul>${statsGuide.needs.map((item) => `<li>${item}</li>`).join("")}</ul>
      <p>${classAdvice(data.className)}</p>
    </article>
  `;
}

function buildLearningGuide(data) {
  const themePlan = {
    "生活觀察": "從一個真實角落開始，加入時間、人物動作與物件細節，讓平凡題材有故事。",
    "自然與環境": "先決定自然元素的主角，再用色彩氣氛表現季節、天氣或環境感受。",
    "人物故事": "用動作、表情與道具說明人物關係，背景不只裝飾，要能補充情節。",
    "想像與未來": "保留一個現實物件作為入口，再把比例、功能或空間改造成想像世界。",
    "節慶文化": "抓住儀式、服飾、色彩與人群互動，避免只畫單一符號。",
    "社會議題": "先表達立場，再用對比、象徵或視覺焦點讓觀者理解問題。",
    "情緒表達": "用線條方向、色彩冷暖、空間疏密來呈現感受，不一定只靠表情。",
    "設計海報": "一句主訊息搭配一個主視覺，文字層級要清楚，遠看也能讀懂。"
  };

  return `
    <article class="advice-card">
      <h3>創作任務</h3>
      <p>${escapeHtml(data.className)}可以挑戰「${escapeHtml(data.theme)}」主題：${themePlan[data.theme]}</p>
      <p>${data.note ? `你的關鍵詞是「${escapeHtml(data.note)}」，建議先圈出其中最想讓觀眾記住的一個畫面。` : "先寫下三個關鍵詞，再選一個最有畫面感的詞當主角。"}</p>
    </article>
    <article class="advice-card">
      <h3>三步驟引導</h3>
      <ol>
        <li>構思：用 3 張小草圖嘗試不同視角，選擇主角最大、動線最清楚的一張。</li>
        <li>技法：${mediumAdvice(data.medium)}</li>
        <li>深化：加入一個「只有你會想到」的細節，讓作品從完成變成有個性。</li>
      </ol>
    </article>
    <article class="advice-card">
      <h3>自我檢核</h3>
      <ul>
        <li>我能用一句話說出作品想表達什麼。</li>
        <li>主角、背景、色彩都服務同一個主題。</li>
        <li>${classAdvice(data.className)}</li>
      </ul>
    </article>
  `;
}

function buildCompetitionGuide(data) {
  const statsGuide = analyzeStats(state.imageStats.competition);
  return `
    <article class="advice-card">
      <h3>比賽評審視角</h3>
      <p>${escapeHtml(data.contest)}通常會先看主題是否一眼清楚，再看構圖完整度、媒材控制與細節完成度。${statsGuide.focus}</p>
    </article>
    <article class="advice-card priority">
      <h3>送件前修改優先序</h3>
      <ol>
        <li>主題辨識：把題名或主題「${escapeHtml(data.note || "作品核心")}」轉成畫面中最明顯的主視覺。</li>
        <li>視覺焦點：${statsGuide.needs[0]}</li>
        <li>技法成熟：${mediumAdvice(data.medium)}</li>
        <li>完成度：邊角、背景、主角輪廓與陰影要一起檢查，避免只有中央完成。</li>
      </ol>
    </article>
    <article class="advice-card">
      <h3>老師可給學生的下一句提示</h3>
      <p>「請你先選一個地方修改到更清楚，而不是整張重新畫；讓評審在 3 秒內知道你的主題，30 秒後還能看到細節。」</p>
      <p>${classAdvice(data.className)}</p>
    </article>
  `;
}

function inferNeed(tool, data, stats) {
  if (tool === "learning") return `${data.theme}發想與${data.medium}技法`;
  if (!stats) return "需補作品照片分析";
  if (stats.contrast < 42) return "明暗與焦點";
  if (stats.edgeDensity > 0.29) return "畫面取捨";
  if (stats.edgeDensity < 0.11) return "細節完成度";
  return "主題深化";
}

function addRecord(tool, data, summary) {
  const stats = state.imageStats[tool] || null;
  const record = {
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    tool,
    toolName: { composition: "構圖教學", learning: "學習天地", competition: "比賽指導" }[tool],
    className: data.className,
    seat: String(data.seat).padStart(2, "0"),
    medium: data.medium,
    topic: data.theme || data.contest || data.stage || "",
    note: data.note || "",
    summary,
    need: inferNeed(tool, data, stats),
    imageStats: stats
  };
  state.records.push(record);
  state.syncQueue.push(record.id);
  saveData();
  if (state.endpoint) syncPendingRecords({ silent: true });
}

function handleGuideSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const tool = form.dataset.tool;
  const data = getFormData(form);
  let html = "";
  let summary = "";

  if (tool === "composition") {
    html = buildCompositionGuide(data);
    summary = "已產生構圖診斷與修改優先序";
  }
  if (tool === "learning") {
    html = buildLearningGuide(data);
    summary = "已產生創作任務、技法練習與自我檢核";
  }
  if (tool === "competition") {
    html = buildCompetitionGuide(data);
    summary = "已產生比賽送件修改優先序";
  }

  $(`#${tool}-result`).innerHTML = html;
  addRecord(tool, data, summary);
}

function readImage(file, tool) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.imageStats[tool] = computeImageStats(img);
      renderPreview(tool, reader.result);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function renderPreview(tool, src) {
  const preview = $(`[data-preview='${tool}']`);
  if (preview) preview.innerHTML = `<img src="${src}" alt="學生作品預覽" />`;
}

function computeImageStats(img) {
  const canvas = document.createElement("canvas");
  const width = 180;
  const height = Math.max(1, Math.round((img.height / img.width) * width));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  let sum = 0;
  let sumSq = 0;
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;
  let edges = 0;
  const gray = [];

  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const pixel = i / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    gray[pixel] = value;
    sum += value;
    sumSq += value * value;
    if (x < width / 2) left += 255 - value;
    else right += 255 - value;
    if (y < height / 2) top += 255 - value;
    else bottom += 255 - value;
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const diff = Math.abs(gray[index] - gray[index - 1]) + Math.abs(gray[index] - gray[index - width]);
      if (diff > 46) edges += 1;
    }
  }

  const pixels = width * height;
  const brightness = sum / pixels;
  const variance = sumSq / pixels - brightness * brightness;
  const totalWeight = left + right + top + bottom || 1;
  return {
    width: img.width,
    height: img.height,
    brightness,
    contrast: Math.sqrt(Math.max(0, variance)),
    edgeDensity: edges / pixels,
    leftWeight: left / totalWeight,
    rightWeight: right / totalWeight,
    topWeight: top / totalWeight,
    bottomWeight: bottom / totalWeight
  };
}

function renderTeacher() {
  const records = state.records;
  const students = new Set(records.map((record) => `${record.className || record.grade}-${record.seat}`));
  $("#metric-uses").textContent = records.length;
  $("#metric-students").textContent = students.size;
  $("#metric-top-tool").textContent = topValue(records, "toolName") || "尚無";
  $("#metric-need").textContent = topValue(records, "need") || "尚無";
  renderDatabaseStatus();
  $("#record-table").innerHTML = records.length
    ? records.slice().reverse().map((record) => `
        <tr>
          <td>${new Date(record.time).toLocaleString("zh-TW")}</td>
          <td>${escapeHtml(record.toolName)}</td>
          <td>${escapeHtml(record.className || record.grade)} / ${escapeHtml(record.seat)}號</td>
          <td>${escapeHtml(record.medium)}</td>
          <td>${escapeHtml(record.topic || record.note)}</td>
          <td>${escapeHtml(record.summary)}</td>
          <td>${escapeHtml(record.need)}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="7">尚無使用紀錄。學生產生建議後，這裡會自動累積。</td></tr>`;
}

function topValue(records, key) {
  const count = {};
  records.forEach((record) => {
    const value = record[key] || "";
    if (value) count[value] = (count[value] || 0) + 1;
  });
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function renderDatabaseStatus() {
  $("#database-endpoint").value = state.endpoint;
  const pending = state.syncQueue.length;
  $("#database-status").textContent = state.endpoint
    ? `已設定同步端點，目前有 ${pending} 筆紀錄等待同步。`
    : `尚未設定同步端點，目前有 ${pending} 筆紀錄保存在本機。`;
}

async function syncPendingRecords(options = {}) {
  if (!state.endpoint) {
    if (!options.silent) alert("請先貼上 Google Apps Script Web App URL。");
    renderDatabaseStatus();
    return;
  }

  const pending = state.syncQueue.map((id) => state.records.find((record) => record.id === id)).filter(Boolean);
  const synced = [];
  for (const record of pending) {
    try {
      await fetch(state.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ app: "art-coach-platform", version: "20260530", record })
      });
      record.syncedAt = new Date().toISOString();
      synced.push(record.id);
    } catch (error) {
      record.syncError = error.message;
      if (!options.silent) alert(`同步失敗：${error.message}`);
      break;
    }
  }

  state.syncQueue = state.syncQueue.filter((id) => !synced.includes(id));
  saveData();
  renderDatabaseStatus();
  if (!options.silent) alert(`已同步 ${synced.length} 筆紀錄。`);
}

function exportCsv() {
  const headers = ["時間", "工具", "班級", "座號", "媒材", "主題或比賽", "備註", "系統判斷", "教學提醒"];
  const rows = state.records.map((record) => [record.time, record.toolName, record.className || record.grade, record.seat, record.medium, record.topic, record.note, record.summary, record.need]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `art-coach-records-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  $$(".tab").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  $$(".guide-form").forEach((form) => form.addEventListener("submit", handleGuideSubmit));
  $$("input[type='file']").forEach((input) => {
    input.addEventListener("change", (event) => {
      const form = event.currentTarget.closest("form");
      readImage(event.currentTarget.files[0], form.dataset.tool);
    });
  });
  $("#save-database-endpoint").addEventListener("click", () => {
    state.endpoint = $("#database-endpoint").value.trim();
    saveData();
    renderDatabaseStatus();
    alert(state.endpoint ? "資料庫端點已儲存。" : "已清除資料庫端點。");
  });
  $("#sync-database").addEventListener("click", () => syncPendingRecords());
  $("#export-csv").addEventListener("click", exportCsv);
  $("#clear-data").addEventListener("click", () => {
    if (!confirm("確定要清除本機所有使用紀錄嗎？")) return;
    state.records = [];
    state.syncQueue = [];
    saveData();
    renderTeacher();
  });
  $("#teacher-unlock").addEventListener("click", unlockTeacher);
  $("#teacher-password-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") unlockTeacher();
  });
}

loadData();
fillSelects();
bindEvents();
