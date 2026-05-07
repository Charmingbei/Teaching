const questions = [
  {
    title: "校園餐具決策",
    topic: "垃圾與資源回收",
    concept: "減塑行動",
    scenario:
      "學校午餐想改用免洗餐具，理由是清洗餐具很花時間，也能讓午餐流程更快。你會支持、反對，還是有條件支持？",
    stances: ["支持", "反對", "有條件支持"],
    reasons: ["生活便利", "垃圾減量", "衛生安全", "資源循環", "執行成本", "替代方案"],
    idealReasons: ["垃圾減量", "資源循環", "替代方案"],
    misconception: "只考慮方便，較少思考垃圾量與資源循環"
  },
  {
    title: "社區太陽能板",
    topic: "能源選擇",
    concept: "再生能源",
    scenario:
      "社區想在活動中心屋頂裝太陽能板，能減少用電支出，但初期費用較高，也需要定期維護。你會如何判斷？",
    stances: ["支持", "反對", "有條件支持"],
    reasons: ["再生能源", "經費成本", "長期效益", "維護管理", "居民意見", "節電行動"],
    idealReasons: ["再生能源", "長期效益", "居民意見"],
    misconception: "容易把初期成本視為唯一判斷依據"
  },
  {
    title: "濕地觀光開發",
    topic: "土地開發",
    concept: "生態保育",
    scenario:
      "地方政府想在濕地旁興建觀光設施，可能帶來人潮與收入，但也可能干擾鳥類棲地。你會提出什麼決策？",
    stances: ["支持", "反對", "有條件支持"],
    reasons: ["生態保護", "地方經濟", "觀光管理", "棲地破壞", "居民就業", "環境承載量"],
    idealReasons: ["生態保護", "觀光管理", "環境承載量"],
    misconception: "尚未能平衡地方發展與棲地保護"
  },
  {
    title: "通學交通選擇",
    topic: "氣候變遷",
    concept: "低碳生活",
    scenario:
      "班上討論是否推動每週一天低碳通學，鼓勵步行、搭公車或共乘。有人擔心不方便，也有人覺得能減少碳排放。",
    stances: ["支持", "反對", "有條件支持"],
    reasons: ["碳排放", "交通安全", "生活習慣", "家長配合", "健康活動", "分階段推動"],
    idealReasons: ["碳排放", "交通安全", "分階段推動"],
    misconception: "知道減碳重要，但缺少可執行的行動設計"
  },
  {
    title: "夜市垃圾問題",
    topic: "垃圾與資源回收",
    concept: "利害關係人",
    scenario:
      "熱門夜市每天製造大量垃圾。政府考慮要求攤商使用可重複餐具，但攤商擔心成本增加、顧客也怕排隊變久。",
    stances: ["支持", "反對", "有條件支持"],
    reasons: ["攤商成本", "垃圾減量", "消費者習慣", "政府規範", "分攤責任", "回收系統"],
    idealReasons: ["垃圾減量", "分攤責任", "回收系統"],
    misconception: "較少辨認政府、攤商、消費者各自責任"
  }
];

const demoOpponents = ["晨希", "品安", "宥廷", "語晴", "柏翰", "苡柔", "承恩", "若妍"];
const storageKey = "future-island-prototype";

const state = {
  view: "login",
  student: null,
  opponent: null,
  round: 0,
  selectedStance: "",
  selectedReason: "",
  score: 0,
  opponentScore: 0,
  records: [],
  students: [],
  board: "score",
  timerId: null,
  seconds: 60,
  island: { eco: 62, life: 68, sustain: 55 }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadData() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  state.records = saved.records || [];
  state.students = saved.students || [];
}

function saveData() {
  localStorage.setItem(
    storageKey,
    JSON.stringify({ records: state.records, students: state.students })
  );
}

function showView(view) {
  state.view = view;
  $$(".view").forEach((el) => el.classList.toggle("active", el.id === `${view}-view`));
  $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  if (view === "leaderboard") renderLeaderboard();
  if (view === "teacher") renderTeacher();
  if (view === "worksheet") renderWorksheet();
}

function enableGameTabs() {
  $("[data-view='battle']").disabled = false;
  $("[data-view='worksheet']").disabled = false;
}

function startGame(student) {
  const opponentName = demoOpponents[Math.floor(Math.random() * demoOpponents.length)];
  state.student = student;
  state.opponent = { name: opponentName, className: student.className, seat: Math.ceil(Math.random() * 30) };
  state.round = 0;
  state.score = 0;
  state.opponentScore = 0;
  state.island = { eco: 62, life: 68, sustain: 55 };
  state.students = state.students.filter((item) => item.id !== student.id).concat(student);
  saveData();
  enableGameTabs();
  updateMatchPanel();
  nextQuestion();
  showView("battle");
}

function nextQuestion() {
  clearInterval(state.timerId);
  state.selectedStance = "";
  state.selectedReason = "";
  $("#reflection-input").value = "";
  state.seconds = 60;
  $("#timer").textContent = state.seconds;

  const question = questions[state.round];
  $("#round-now").textContent = state.round + 1;
  $("#question-title").textContent = question.title;
  $("#scenario-text").textContent = question.scenario;
  renderOptions("#stance-options", question.stances, "stance");
  renderOptions("#reason-options", question.reasons, "reason");
  state.timerId = setInterval(() => {
    state.seconds -= 1;
    $("#timer").textContent = state.seconds;
    if (state.seconds <= 0) submitRound();
  }, 1000);
}

function renderOptions(target, options, type) {
  const container = $(target);
  container.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = option;
    button.addEventListener("click", () => {
      if (type === "stance") state.selectedStance = option;
      if (type === "reason") state.selectedReason = option;
      Array.from(container.children).forEach((child) => child.classList.remove("selected"));
      button.classList.add("selected");
    });
    container.appendChild(button);
  });
}

function scoreRound(question, stance, reason, reflection) {
  let score = 2;
  if (stance === "有條件支持") score += 2;
  if (question.idealReasons.includes(reason)) score += 3;
  if (reflection.length >= 18) score += 1;
  if (/(替代|兼顧|減少|分階段|規範|回收|安全|居民|成本|長期|責任)/.test(reflection)) score += 2;
  return Math.min(score, 10);
}

function submitRound() {
  const question = questions[state.round];
  const reflection = $("#reflection-input").value.trim();
  if (!state.selectedStance || !state.selectedReason || !reflection) {
    alert("請先選擇立場、理由卡，並寫下一句想法。");
    return;
  }

  clearInterval(state.timerId);
  const roundScore = scoreRound(question, state.selectedStance, state.selectedReason, reflection);
  const opponentRoundScore = Math.floor(Math.random() * 5) + 5;
  const record = {
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    studentId: state.student.id,
    studentName: state.student.name,
    className: state.student.className,
    seat: state.student.seat,
    opponentName: state.opponent.name,
    questionTitle: question.title,
    topic: question.topic,
    concept: question.concept,
    stance: state.selectedStance,
    reason: state.selectedReason,
    reflection,
    score: roundScore,
    responseSeconds: 60 - state.seconds,
    misconception: roundScore < 7 ? question.misconception : "表現穩定"
  };

  state.score += roundScore;
  state.opponentScore += opponentRoundScore;
  state.records.push(record);
  updateIsland(question, roundScore);
  saveData();
  appendLog(record, opponentRoundScore);
  updateMatchPanel();

  state.round += 1;
  if (state.round >= questions.length) {
    setTimeout(() => {
      showView("worksheet");
    }, 200);
    return;
  }
  setTimeout(nextQuestion, 450);
}

function updateIsland(question, score) {
  const delta = score >= 7 ? 5 : -4;
  if (["垃圾與資源回收", "土地開發"].includes(question.topic)) state.island.eco += delta;
  if (question.topic === "氣候變遷") state.island.sustain += delta;
  if (question.topic === "能源選擇") state.island.life += delta;
  Object.keys(state.island).forEach((key) => {
    state.island[key] = Math.max(10, Math.min(100, state.island[key]));
  });
}

function updateMatchPanel() {
  if (!state.student) return;
  $("#player-name").textContent = `${state.student.name}（${state.student.className} ${state.student.seat}號）`;
  $("#player-score").textContent = `${state.score} 分`;
  $("#opponent-name").textContent = state.opponent.name;
  $("#opponent-score").textContent = `${state.opponentScore} 分`;
  $("#eco-meter").value = state.island.eco;
  $("#life-meter").value = state.island.life;
  $("#sustain-meter").value = state.island.sustain;
}

function appendLog(record, opponentRoundScore) {
  const item = document.createElement("div");
  item.className = "log-item";
  item.innerHTML = `<strong>${record.questionTitle}</strong><p>你 ${record.score} 分，${record.opponentName} ${opponentRoundScore} 分</p>`;
  $("#battle-log").prepend(item);
}

function getStudentTotals() {
  const totals = new Map();
  state.records.forEach((record) => {
    const key = record.studentId;
    const current = totals.get(key) || {
      id: key,
      name: record.studentName,
      className: record.className,
      seat: record.seat,
      score: 0,
      rounds: 0,
      thinking: 0,
      growth: 0
    };
    current.score += record.score;
    current.rounds += 1;
    current.thinking += record.stance === "有條件支持" ? 2 : 0;
    current.thinking += record.reflection.length >= 25 ? 1 : 0;
    current.growth = Math.max(current.growth, record.score);
    totals.set(key, current);
  });
  return Array.from(totals.values());
}

function renderLeaderboard() {
  const list = getStudentTotals();
  const metric = state.board;
  const sorted = list.sort((a, b) => b[metric] - a[metric]);
  $("#leaderboard").innerHTML = sorted.length
    ? sorted
        .map(
          (student, index) => `
            <div class="leader-row">
              <span class="rank">${index + 1}</span>
              <div>
                <strong>${student.name}</strong>
                <p>${student.className} ${student.seat}號，完成 ${student.rounds} 回合</p>
              </div>
              <strong>${student[metric]} 分</strong>
            </div>
          `
        )
        .join("")
    : `<div class="log-item"><strong>尚無資料</strong><p>學生完成一回合作答後，這裡會即時更新。</p></div>`;
}

function renderTeacher() {
  const studentCount = new Set(state.students.map((student) => student.id)).size;
  const totalScore = state.records.reduce((sum, record) => sum + record.score, 0);
  const average = state.records.length ? (totalScore / state.records.length).toFixed(1) : "0";
  const weakTopic = findWeakTopic();
  $("#metric-students").textContent = studentCount;
  $("#metric-rounds").textContent = state.records.length;
  $("#metric-average").textContent = average;
  $("#metric-weak").textContent = weakTopic || "尚無";
  $("#record-table").innerHTML = state.records.length
    ? state.records
        .slice()
        .reverse()
        .map(
          (record) => `
            <tr>
              <td>${record.studentName}<br>${record.className} ${record.seat}號</td>
              <td>${record.questionTitle}<br>${record.topic}</td>
              <td>${record.stance}</td>
              <td>${record.reason}</td>
              <td>${record.score}</td>
              <td>${record.misconception}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="6">尚無作答紀錄。</td></tr>`;
}

function findWeakTopic(records = state.records) {
  const grouped = {};
  records.forEach((record) => {
    grouped[record.topic] ||= { score: 0, count: 0 };
    grouped[record.topic].score += record.score;
    grouped[record.topic].count += 1;
  });
  return Object.entries(grouped)
    .map(([topic, data]) => ({ topic, average: data.score / data.count }))
    .sort((a, b) => a.average - b.average)[0]?.topic;
}

function renderWorksheet() {
  if (!state.student) {
    $("#worksheet-content").innerHTML = `<div class="worksheet-block">請先完成登入與對戰。</div>`;
    return;
  }
  const myRecords = state.records.filter((record) => record.studentId === state.student.id);
  const weakTopic = findWeakTopic(myRecords) || "環境決策";
  const level = getWorksheetLevel(myRecords);
  $("#worksheet-title").textContent = `${state.student.name}的環境決策學習單`;
  $("#worksheet-content").innerHTML = `
    <div class="worksheet-block">
      <h3>學習狀態</h3>
      <p>系統判斷你目前適合「${level}」任務。這份學習單會協助你加強「${weakTopic}」相關概念。</p>
    </div>
    <div class="worksheet-block">
      <h3>一、概念整理</h3>
      <p>請用自己的話說明「${weakTopic}」和日常生活有什麼關係。</p>
      <div class="worksheet-lines"><div class="line"></div><div class="line"></div><div class="line"></div></div>
    </div>
    <div class="worksheet-block">
      <h3>二、情境判斷</h3>
      <p>如果一項政策對生活很方便，卻會增加環境負擔，你會用哪三個標準來判斷是否支持？</p>
      <div class="worksheet-lines"><div class="line"></div><div class="line"></div><div class="line"></div></div>
    </div>
    <div class="worksheet-block">
      <h3>三、行動方案</h3>
      <p>請提出一個你在學校或家中可以實行的環境改善行動，並說明可能遇到的困難與解決方式。</p>
      <div class="worksheet-lines"><div class="line"></div><div class="line"></div><div class="line"></div><div class="line"></div></div>
    </div>
  `;
}

function getWorksheetLevel(records) {
  if (!records.length) return "基礎型";
  const avg = records.reduce((sum, record) => sum + record.score, 0) / records.length;
  if (avg >= 8.5) return "挑戰型";
  if (avg >= 6.5) return "進階型";
  return "基礎型";
}

function seedDemoData() {
  const className = "六年甲班";
  demoOpponents.slice(0, 6).forEach((name, index) => {
    const student = { id: `demo-${index}`, className, seat: index + 1, name };
    state.students = state.students.filter((item) => item.id !== student.id).concat(student);
    questions.slice(0, 3).forEach((question, round) => {
      state.records.push({
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        studentId: student.id,
        studentName: name,
        className,
        seat: student.seat,
        opponentName: demoOpponents[(index + 2) % demoOpponents.length],
        questionTitle: question.title,
        topic: question.topic,
        concept: question.concept,
        stance: round % 2 ? "有條件支持" : "反對",
        reason: question.idealReasons[round % question.idealReasons.length],
        reflection: "我會先比較環境影響與生活需求，再提出可以執行的替代方案。",
        score: 6 + ((index + round) % 5),
        responseSeconds: 20 + index,
        misconception: "表現穩定"
      });
    });
  });
  saveData();
  renderLeaderboard();
}

function bindEvents() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
  $$(".mini-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.board = button.dataset.board;
      $$(".mini-tab").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      renderLeaderboard();
    });
  });
  $("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const className = $("#class-input").value;
    const seat = $("#seat-input").value.padStart(2, "0");
    const name = $("#name-input").value.trim() || `${className.replace("六年", "")}${seat}號`;
    startGame({ id: `${className}-${seat}`, className, seat, name });
  });
  $("#submit-round").addEventListener("click", submitRound);
  $("#simulate-opponent").addEventListener("click", () => {
    const question = questions[state.round];
    const randomReason = question.reasons[Math.floor(Math.random() * question.reasons.length)];
    alert(`${state.opponent.name}選擇「有條件支持」，理由卡是「${randomReason}」。`);
  });
  $("#seed-demo").addEventListener("click", seedDemoData);
  $("#clear-data").addEventListener("click", () => {
    if (!confirm("確定要清除所有本機示範紀錄嗎？")) return;
    state.records = [];
    state.students = [];
    saveData();
    renderTeacher();
    renderLeaderboard();
  });
  $("#print-worksheet").addEventListener("click", () => window.print());
}

loadData();
bindEvents();
renderLeaderboard();
renderTeacher();
