const tags = ["畫畫", "恐龍", "遊戲", "搞笑", "刺激", "AI", "廣告", "學習"];

const groups = [
  { id: 0, name: "第一組", focus: "小宇是否守住原本目標？" },
  { id: 1, name: "第二組", focus: "平台怎麼猜小宇喜歡什麼？" },
  { id: 2, name: "第三組", focus: "廣告商在什麼時候出現？" },
  { id: 3, name: "第四組", focus: "觀察哪個選擇能跳出怪圈？" },
  { id: 4, name: "第五組", focus: "推薦越準，會不會讓選擇變少？" },
  { id: 5, name: "第六組", focus: "小宇可以怎麼訓練自己的推薦？" },
];

const lessonTitle = "第二節：推薦怪圈實驗室";
const behaviors = [
  { key: "skip", label: "略過", kid: "我不想看", score: 0, minutes: 1, hint: "AI幾乎不會記住這個主題" },
  { key: "open", label: "看一下", kid: "點開看看", score: 1, minutes: 5, hint: "AI開始覺得你可能有興趣" },
  { key: "stay", label: "看很久", kid: "停不下來", score: 2, minutes: 12, hint: "AI會更常推薦相似內容" },
  { key: "super", label: "超喜歡", kid: "按讚或分享", score: 3, minutes: 10, hint: "AI會很確定你喜歡這一類" },
];

const firstRoundCards = [
  {
    title: "五分鐘畫恐龍教學",
    desc: "小宇一開始真正想看的影片，可以幫他完成美勞作業。",
    type: "學習影片",
    time: "5 分鐘",
    tags: ["畫畫", "恐龍", "學習"],
  },
  {
    title: "恐龍冷知識",
    desc: "介紹恐龍牙齒、尾巴、走路方式，內容有趣但會把主題拉向恐龍。",
    type: "知識短片",
    time: "4 分鐘",
    tags: ["恐龍", "學習"],
  },
  {
    title: "史上最強怪獸對決",
    desc: "標題很刺激，畫面很熱鬧，但和畫畫目標越來越遠。",
    type: "刺激影片",
    time: "11 分鐘",
    tags: ["恐龍", "刺激"],
  },
  {
    title: "超好笑遊戲失誤合集",
    desc: "朋友常分享的搞笑影片，很容易一部接一部看下去。",
    type: "娛樂影片",
    time: "9 分鐘",
    tags: ["遊戲", "搞笑"],
  },
];

const recommendationMap = {
  恐龍: [
    ["AI生成超真實恐龍圖片", "AI把恐龍畫得像真的一樣，讓人想繼續點。", "AI創作", "6 分鐘", ["AI", "恐龍", "刺激"]],
    ["恐龍逃出博物館動畫", "劇情緊張，影片結束又跳出下一集。", "動畫", "13 分鐘", ["恐龍", "刺激"]],
    ["10種最可怕恐龍排名", "排行榜讓人想知道第一名是誰。", "排行榜", "10 分鐘", ["恐龍", "刺激"]],
    ["恐龍模型開箱", "看完可能會出現玩具與模型廣告。", "開箱", "8 分鐘", ["恐龍", "廣告"]],
  ],
  畫畫: [
    ["用色鉛筆畫恐龍皮膚", "很接近小宇的原始目標，可以學技巧。", "教學", "7 分鐘", ["畫畫", "恐龍", "學習"]],
    ["三步驟畫可愛暴龍", "短時間完成作品，適合回到任務。", "教學", "5 分鐘", ["畫畫", "恐龍", "學習"]],
    ["畫畫比賽作品欣賞", "看看別人的作品，也可能越看越久。", "作品欣賞", "9 分鐘", ["畫畫", "學習"]],
    ["恐龍漫畫分鏡教學", "把恐龍變成故事角色，和第三節AI分身故事有連結。", "漫畫教學", "12 分鐘", ["畫畫", "恐龍", "學習"]],
  ],
  遊戲: [
    ["恐龍生存遊戲實況", "實況很長，容易讓小宇忘記只看五分鐘。", "遊戲實況", "20 分鐘", ["遊戲", "恐龍", "刺激"]],
    ["免費遊戲點數抽獎", "看起來像福利，其實很可能是廣告或誘因。", "抽獎", "3 分鐘", ["遊戲", "廣告"]],
    ["遊戲角色畫法", "把遊戲興趣拉回畫畫，可能是好轉彎。", "畫畫教學", "7 分鐘", ["遊戲", "畫畫", "學習"]],
    ["玩家最愛恐龍坐騎", "排行榜加上遊戲畫面，會讓推薦更偏遊戲。", "排行榜", "8 分鐘", ["遊戲", "恐龍"]],
  ],
  搞笑: [
    ["恐龍配音爆笑合集", "笑點強，容易被分享。", "搞笑影片", "8 分鐘", ["搞笑", "恐龍"]],
    ["老師看到會傻眼的作業反應", "標題吸睛，但和任務沒有關係。", "搞笑影片", "6 分鐘", ["搞笑", "刺激"]],
    ["朋友最愛迷因挑戰", "同學可能一直叫小宇看下一個。", "迷因", "7 分鐘", ["搞笑", "遊戲"]],
    ["畫畫失敗也可愛", "搞笑中還有畫畫元素，是比較健康的轉向。", "輕鬆短片", "5 分鐘", ["搞笑", "畫畫"]],
  ],
  刺激: [
    ["不看會後悔的恐龍追逐", "刺激標題會放大好奇心。", "誇張標題", "12 分鐘", ["刺激", "恐龍"]],
    ["最驚人的AI怪獸合成", "AI影像很酷，但可能讓小宇越滑越遠。", "AI影像", "9 分鐘", ["AI", "刺激"]],
    ["極限倒數挑戰", "倒數感讓人想立刻點。", "挑戰影片", "6 分鐘", ["刺激", "遊戲"]],
    ["安靜畫畫十分鐘", "把節奏降下來，幫小宇回到學習。", "專注影片", "10 分鐘", ["畫畫", "學習"]],
  ],
  AI: [
    ["AI畫出恐龍老師", "AI生成內容很新奇，適合討論真假與創作責任。", "AI創作", "6 分鐘", ["AI", "畫畫", "恐龍"]],
    ["AI猜你喜歡什麼", "直接點出推薦系統如何蒐集行為。", "AI知識", "5 分鐘", ["AI", "學習"]],
    ["AI怪獸圖片大賽", "新奇又刺激，可能推高停留時間。", "AI挑戰", "8 分鐘", ["AI", "刺激"]],
    ["用AI做作業可以嗎", "回到媒體素養與判斷。", "AI討論", "7 分鐘", ["AI", "學習"]],
  ],
  廣告: [
    ["恐龍模型限時折扣", "平台可能因為小宇的恐龍分數推商品。", "廣告", "2 分鐘", ["廣告", "恐龍"]],
    ["遊戲點數今天免費領", "限時、免費、立刻點，都是誘因。", "廣告", "3 分鐘", ["廣告", "遊戲"]],
    ["色鉛筆組開箱推薦", "和畫畫有關，但仍要辨認是不是廣告。", "開箱", "6 分鐘", ["廣告", "畫畫"]],
    ["買玩具前先看這支", "看似提醒，也可能引導消費。", "商品影片", "7 分鐘", ["廣告", "恐龍"]],
  ],
  學習: [
    ["五分鐘整理恐龍重點", "短而清楚，符合小宇原本的時間限制。", "學習影片", "5 分鐘", ["學習", "恐龍"]],
    ["如何判斷推薦是不是廣告", "把觀看經驗變成媒體素養問題。", "媒體素養", "6 分鐘", ["學習", "廣告"]],
    ["畫完恐龍後自我檢查", "幫小宇完成任務，而不是繼續滑。", "學習單", "4 分鐘", ["學習", "畫畫"]],
    ["AI推薦怎麼運作", "把遊戲經驗連到AI課。", "AI知識", "8 分鐘", ["學習", "AI"]],
  ],
};

const eventCards = [
  { title: "誇張標題卡", desc: "不看會後悔！最恐怖恐龍影片", tags: ["刺激", "恐龍"], score: 2, minutes: 8 },
  { title: "限時獎勵卡", desc: "今天登入就送恐龍遊戲點數", tags: ["廣告", "遊戲"], score: 3, minutes: 5 },
  { title: "朋友分享卡", desc: "這個恐龍影片超好笑，你一定要看！", tags: ["搞笑", "恐龍"], score: 2, minutes: 6 },
  { title: "AI神圖卡", desc: "AI畫出世界上最真實的恐龍", tags: ["AI", "恐龍"], score: 2, minutes: 7 },
  { title: "自動播放卡", desc: "下一支影片在5秒後自動開始", tags: ["刺激", "恐龍"], score: 1, minutes: 12 },
  { title: "相似推薦卡", desc: "你看過恐龍，所以再給你更多恐龍", tags: ["恐龍", "刺激"], score: 2, minutes: 8 },
  { title: "情緒推高卡", desc: "越驚訝、越害怕、越想看下一個", tags: ["刺激"], score: 3, minutes: 9 },
  { title: "選擇權提醒卡", desc: "先停一下：這是我想看的，還是平台想我看的？", tags: ["學習", "畫畫"], score: 2, minutes: 0 },
];

const choiceTools = [
  {
    title: "暫停三秒卡",
    desc: "先不點，問自己：我現在還在完成原本任務嗎？",
    effect: "pause",
    add: { 學習: 2 },
  },
  {
    title: "換主題搜尋卡",
    desc: "主動搜尋「三步驟畫恐龍」，不要只接收下一支推薦。",
    effect: "search",
    add: { 畫畫: 3, 學習: 3 },
  },
  {
    title: "時間提醒卡",
    desc: "設定五分鐘鈴響，時間到就回到作業或休息。",
    effect: "timer",
    add: { 學習: 3 },
  },
  {
    title: "我來選，不讓它推卡",
    desc: "關掉自動播放，讓小宇重新拿回選擇權。",
    effect: "control",
    add: { 學習: 2, 畫畫: 2 },
  },
];

const discussionsByGroup = [
  ["小宇最後看的內容，和一開始目標一樣嗎？", "哪個選擇讓小宇離目標最近？", "如果你是小宇，下一步會怎麼做？"],
  ["平台是看見小宇的心裡想法，還是看見他的行為資料？", "哪個行為讓分數變高最多？", "推薦越準一定越好嗎？"],
  ["哪一張卡最像廣告或商業誘因？", "廣告商為什麼希望小宇繼續看？", "遇到限時、免費、抽獎時要先想什麼？"],
  ["推薦內容越來越相似，有什麼好處與壞處？", "哪張選擇權工具最能跳出怪圈？", "我們可以訂出哪些班級觀看公約？"],
  ["如果AI一直推同一類內容，小宇可能錯過什麼？", "你覺得「很懂我」和「限制我」差在哪裡？", "要怎麼讓推薦裡出現更多不同選擇？"],
  ["小宇可以用哪些行為告訴AI：我想換方向？", "哪些按鈕或設定可以幫我們拿回選擇權？", "請設計一句提醒自己的推薦使用口訣。"],
];

const teacherPrompts = {
  0: "玩法：每組先選一張影片，再選小宇的反應。右邊的AI推薦機器會立刻改變。",
  1: "第1關：小宇看到第一批影片。請每組選一張，再選「略過、看一下、看很久、超喜歡」。",
  2: "第2關：AI會看最高分標籤，推更多相似內容。請觀察：它還記得小宇原本想畫恐龍嗎？",
  3: "第3關：抽一張怪圈事件卡。想一想：這張卡會讓小宇更清醒，還是更停不下來？",
  4: "第4關：選一張選擇權工具卡，幫小宇跳出怪圈，回到自己的目標。",
};

let activeGroup = 0;
let state = groups.map(() => createGroupState());
let submissions = loadSubmissions();
let dashboardUnlocked = sessionStorage.getItem("recommendationLabTeacherUnlocked") === "true";
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

function createGroupState() {
  return {
    round: 0,
    scores: Object.fromEntries(tags.map((tag) => [tag, 0])),
    time: 0,
    path: [],
    draftAnswers: ["", "", ""],
  };
}

function loadSubmissions() {
  try {
    const saved = localStorage.getItem("recommendationLabSubmissions");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveSubmissions() {
  localStorage.setItem("recommendationLabSubmissions", JSON.stringify(submissions));
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadLessonRecord() {
  try {
    const saved = localStorage.getItem("recommendationLabLessonRecord");
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
  localStorage.setItem("recommendationLabLessonRecord", JSON.stringify(lessonRecord));
}

function getTopTag(groupState = state[activeGroup]) {
  const entries = Object.entries(groupState.scores).sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : null;
}

function cardsFromRows(rows) {
  return rows.map(([title, desc, type, time, cardTags]) => ({ title, desc, type, time, tags: cardTags }));
}

function addScores(groupState, cardTags, score) {
  cardTags.forEach((tag) => {
    if (groupState.scores[tag] !== undefined) {
      groupState.scores[tag] += score;
    }
  });
}

function setRound(round) {
  state[activeGroup].round = round;
  render();
}

function handleBehavior(card, behavior) {
  const groupState = state[activeGroup];
  addScores(groupState, card.tags, behavior.score);
  groupState.time += behavior.minutes;
  groupState.path.push(`${roundText(groupState.round)}：小宇看到「${card.title}」，選擇「${behavior.label}」。AI把 ${card.tags.join("、")} 記得更清楚。`);
  render();
}

function handleEvent(card) {
  const groupState = state[activeGroup];
  addScores(groupState, card.tags, card.score);
  groupState.time += card.minutes;
  groupState.path.push(`第3回合：出現「${card.title}」，${card.desc}`);
  render();
}

function handleTool(tool) {
  const groupState = state[activeGroup];
  Object.entries(tool.add).forEach(([tag, value]) => {
    groupState.scores[tag] += value;
  });

  if (tool.effect === "timer") {
    groupState.time = Math.min(groupState.time, 5);
  }

  groupState.path.push(`第4回合：小宇使用「${tool.title}」，開始拿回選擇權。`);
  render();
}

function handleAnswerInput(index, value) {
  state[activeGroup].draftAnswers[index] = value;
}

function submitGroupAnswers() {
  const groupState = state[activeGroup];
  const questions = discussionsByGroup[activeGroup];
  const answers = groupState.draftAnswers.map((answer) => answer.trim());
  const hasAnswer = answers.some(Boolean);

  if (!hasAnswer) {
    document.querySelector("#submitHint").textContent = "請至少寫下一個想法，再按提交。";
    return;
  }

  submissions[activeGroup] = {
    lessonTitle,
    lessonDate: lessonRecord.date,
    className: lessonRecord.className,
    groupName: groups[activeGroup].name,
    time: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    topTag: getTopTag(groupState) || "尚未產生",
    watchTime: groupState.time,
    path: [...groupState.path],
    responses: questions.map((question, index) => ({
      question,
      answer: answers[index] || "尚未填寫",
    })),
  };

  saveSubmissions();
  document.querySelector("#submitHint").textContent = `${groups[activeGroup].name}已提交，老師可以在下方後台查看。`;
  renderSubmissionBoard();
  uploadGroupSubmission(submissions[activeGroup]);
}

function roundText(round) {
  return `第${round}回合`;
}

function getCardsForRound(round) {
  if (round === 1) return firstRoundCards;
  const topTag = getTopTag() || "畫畫";
  const rows = recommendationMap[topTag] || recommendationMap["學習"];
  return cardsFromRows(rows);
}

function getAdSuggestion(topTag) {
  const suggestions = {
    恐龍: "恐龍模型、恐龍展覽、恐龍玩具",
    畫畫: "色鉛筆、畫冊、線上畫畫課",
    遊戲: "遊戲點數、遊戲實況頻道",
    搞笑: "迷因貼圖、短影音挑戰",
    刺激: "冒險動畫、驚奇排行榜",
    AI: "AI繪圖工具、AI課程",
    廣告: "更多限時優惠與開箱影片",
    學習: "學習平台、閱讀資源、畫畫教材",
  };
  return topTag ? suggestions[topTag] : "尚未判斷";
}

function renderGroupTabs() {
  const tabs = document.querySelector("#groupTabs");
  tabs.innerHTML = "";
  groups.forEach((group) => {
    const button = document.createElement("button");
    button.textContent = group.name;
    button.className = group.id === activeGroup ? "active" : "";
    button.addEventListener("click", () => {
      activeGroup = group.id;
      render();
    });
    tabs.append(button);
  });
}

function renderScoreBoard() {
  const groupState = state[activeGroup];
  const maxScore = Math.max(6, ...Object.values(groupState.scores));
  const board = document.querySelector("#scoreBoard");
  board.innerHTML = "";

  tags.forEach((tag) => {
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <span>${tag}</span>
      <span class="score-track"><span class="score-fill" style="width:${(groupState.scores[tag] / maxScore) * 100}%"></span></span>
      <span>${groupState.scores[tag]}</span>
    `;
    board.append(row);
  });

  const topTag = getTopTag(groupState);
  document.querySelector("#topTag").textContent = topTag || "尚未產生";
  document.querySelector("#adSuggestion").textContent = getAdSuggestion(topTag);
}

function renderContentCards(cards) {
  const area = document.querySelector("#contentArea");
  const template = document.querySelector("#contentCardTemplate");
  const intro = document.createElement("div");
  intro.className = "round-guide";
  intro.innerHTML = `
    <div><strong>1</strong><span>選一張小宇會看到的影片</span></div>
    <div><strong>2</strong><span>選小宇的反應</span></div>
    <div><strong>3</strong><span>看右邊AI推薦機器怎麼改變</span></div>
  `;
  const grid = document.createElement("div");
  grid.className = "content-grid";

  cards.forEach((card) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".card-type").textContent = card.type;
    node.querySelector(".card-time").textContent = card.time;
    node.querySelector("h3").textContent = card.title;
    node.querySelector("p").textContent = card.desc;

    const tagRow = node.querySelector(".tag-row");
    card.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      tagRow.append(chip);
    });

    const behaviorRow = node.querySelector(".behavior-row");
    behaviors.forEach((behavior) => {
      const button = document.createElement("button");
      button.innerHTML = `<strong>${behavior.label}</strong><span>${behavior.kid}</span>`;
      button.title = behavior.hint;
      button.addEventListener("click", () => handleBehavior(card, behavior));
      behaviorRow.append(button);
    });

    grid.append(node);
  });

  area.innerHTML = "";
  area.append(intro);
  area.append(grid);
}

function renderEventCards() {
  const area = document.querySelector("#contentArea");
  const layout = document.createElement("div");
  layout.className = "event-layout";

  eventCards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "event-card";
    article.innerHTML = `
      <strong>${card.title}</strong>
      <p>${card.desc}</p>
      <div class="tag-row">${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <button class="choice-btn">這張出現了</button>
    `;
    article.querySelector("button").addEventListener("click", () => handleEvent(card));
    layout.append(article);
  });

  area.innerHTML = "";
  area.append(layout);
}

function renderToolCards() {
  const area = document.querySelector("#contentArea");
  const layout = document.createElement("div");
  layout.className = "tool-layout";

  choiceTools.forEach((tool) => {
    const article = document.createElement("article");
    article.className = "tool-card";
    article.innerHTML = `
      <strong>${tool.title}</strong>
      <p>${tool.desc}</p>
      <button class="choice-btn">幫小宇使用</button>
    `;
    article.querySelector("button").addEventListener("click", () => handleTool(tool));
    layout.append(article);
  });

  area.innerHTML = "";
  area.append(layout);
}

function renderStartMessage() {
  const area = document.querySelector("#contentArea");
  area.innerHTML = `
    <div class="wide-message">
      <h2>今天你們是推薦偵探</h2>
      <p>任務很簡單：小宇只想看5分鐘畫恐龍。每組幫他做選擇，看看AI推薦機器會不會把他帶進「越看越像、越看越久」的怪圈。</p>
      <div class="start-steps">
        <span>選影片</span>
        <span>選反應</span>
        <span>看AI猜什麼</span>
        <span>想辦法跳出來</span>
      </div>
    </div>
  `;
}

function renderDiscussion() {
  const groupState = state[activeGroup];
  const list = document.querySelector("#pathList");
  list.innerHTML = "";
  const path = groupState.path.length ? groupState.path : ["尚未開始紀錄。請先選擇內容卡與觀看行為。"];
  path.slice(-8).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });

  const cards = document.querySelector("#discussionCards");
  cards.innerHTML = "";
  discussionsByGroup[activeGroup].forEach((question, index) => {
    const card = document.createElement("article");
    card.className = "discussion-card";
    card.innerHTML = `
      <strong>想一想 ${index + 1}</strong>
      <p>${question}</p>
      <textarea rows="3" placeholder="把小組想法寫在這裡">${groupState.draftAnswers[index] || ""}</textarea>
    `;
    card.querySelector("textarea").addEventListener("input", (event) => {
      handleAnswerInput(index, event.target.value);
    });
    cards.append(card);
  });

  const actions = document.createElement("div");
  actions.className = "submit-row";
  actions.innerHTML = `
    <button id="submitAnswers" class="primary-btn">提交本組想法</button>
    <span id="submitHint">${submissions[activeGroup] ? "本組已有提交紀錄，可修改後再次提交。" : "填完後按提交，老師後台會看見。"}</span>
  `;
  cards.append(actions);
  actions.querySelector("#submitAnswers").addEventListener("click", submitGroupAnswers);
}

function renderSubmissionBoard() {
  renderDashboardLock();
  if (!dashboardUnlocked) return;

  renderLessonRecord();
  renderSubmissionOverview();
  const board = document.querySelector("#submissionBoard");
  board.innerHTML = "";

  groups.forEach((group) => {
    const submission = submissions[group.id];
    const card = document.createElement("article");
    card.className = `submission-card ${submission ? "submitted" : ""}`;

    if (!submission) {
      card.innerHTML = `
        <div class="submission-head">
          <strong>${group.name}</strong>
          <span>尚未提交</span>
        </div>
        <p class="empty-submission">等待小組完成「想一想」。</p>
      `;
      board.append(card);
      return;
    }

    card.innerHTML = `
      <div class="submission-head">
        <strong>${submission.groupName}</strong>
        <span>${submission.time} 提交</span>
      </div>
      <p class="record-line">${submission.lessonDate || lessonRecord.date}｜${submission.className || lessonRecord.className || "未填班級"}</p>
      <div class="submission-meta">
        <span>AI最想推：${submission.topTag || "尚未產生"}</span>
        <span>觀看時間：${submission.watchTime ?? 0}分鐘</span>
      </div>
      <div class="submission-answers">
        ${(submission.responses || [])
          .map(
            (item, index) => `
              <div>
                <b>想一想 ${index + 1}</b>
                <p class="question">${item.question}</p>
                <p>${item.answer || "尚未填寫"}</p>
              </div>
            `
          )
          .join("")}
      </div>
    `;
    board.append(card);
  });
}

function renderSubmissionOverview() {
  const overview = document.querySelector("#submissionOverview");
  if (!overview) return;
  overview.innerHTML = "";

  groups.forEach((group) => {
    const submission = submissions[group.id];
    const card = document.createElement("article");
    card.className = `status-card ${submission ? "submitted" : ""}`;
    card.innerHTML = submission
      ? `
        <strong>${group.name}</strong>
        <span>已提交</span>
        <p>${submission.time || "未記錄時間"}</p>
        <small>AI最想推：${submission.topTag || "尚未產生"}</small>
      `
      : `
        <strong>${group.name}</strong>
        <span>尚未提交</span>
        <p>${group.focus}</p>
        <small>等待學生送出</small>
      `;
    overview.append(card);
  });
}

function renderDashboardLock() {
  const lock = document.querySelector("#dashboardLock");
  const content = document.querySelector("#dashboardContent");
  const status = document.querySelector("#dashboardStatus");
  lock.classList.toggle("hidden", dashboardUnlocked);
  content.classList.toggle("hidden", !dashboardUnlocked);
  status.textContent = dashboardUnlocked ? "已解鎖，可查看各組提交內容" : "需要教師密碼";
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
  return groups.map((group) => {
    const submission = submissions[group.id];
    const responses = submission?.responses || [];
    return {
      課程: lessonTitle,
      上課日期: submission?.lessonDate || lessonRecord.date || getToday(),
      班級: submission?.className || lessonRecord.className || "",
      組別: group.name,
      觀察焦點: group.focus,
      提交時間: submission?.time || "",
      AI最想推: submission?.topTag || "",
      觀看時間: submission?.watchTime ?? "",
      推薦路徑: submission?.path?.join(" / ") || "",
      想一想1題目: responses[0]?.question || "",
      想一想1答案: responses[0]?.answer || "",
      想一想2題目: responses[1]?.question || "",
      想一想2答案: responses[1]?.answer || "",
      想一想3題目: responses[2]?.question || "",
      想一想3答案: responses[2]?.answer || "",
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
  downloadFile(`推薦怪圈實驗室_${lessonRecord.date || getToday()}_${lessonRecord.className || "未填班級"}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8");
}

function downloadJsonBackup() {
  downloadFile(`推薦怪圈實驗室_${lessonRecord.date || getToday()}_${lessonRecord.className || "未填班級"}.json`, JSON.stringify(getBackupPayload(), null, 2), "application/json;charset=utf-8");
}

function getRowsForSubmission(submission) {
  const responses = submission.responses || [];
  return [
    {
      課程: lessonTitle,
      上課日期: submission.lessonDate || lessonRecord.date || getToday(),
      班級: submission.className || lessonRecord.className || "",
      組別: submission.groupName,
      觀察焦點: groups.find((group) => group.name === submission.groupName)?.focus || "",
      提交時間: submission.time || "",
      AI最想推: submission.topTag || "",
      觀看時間: submission.watchTime ?? "",
      推薦路徑: submission.path?.join(" / ") || "",
      想一想1題目: responses[0]?.question || "",
      想一想1答案: responses[0]?.answer || "",
      想一想2題目: responses[1]?.question || "",
      想一想2答案: responses[1]?.answer || "",
      想一想3題目: responses[2]?.question || "",
      想一想3答案: responses[2]?.answer || "",
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
  if (rows.length === 1) {
    return submitRowsWithJsonp(rows);
  }
  return fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      lessonTitle,
      lessonDate: lessonRecord.date || getToday(),
      className: lessonRecord.className || "",
      activityKey: "activity2",
      exportedAt: new Date().toISOString(),
      rows,
    }),
  })
    .then(() => true)
    .catch(() => false);
}

function submitRowsWithJsonp(rows) {
  const endpoint = lessonRecord.cloudEndpoint?.trim();
  const callbackName = `recommendationLabSubmit_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const url = new URL(endpoint);
  url.searchParams.set("mode", "submit");
  url.searchParams.set("callback", callbackName);
  url.searchParams.set(
    "payload",
    JSON.stringify({
      lessonTitle,
      lessonDate: lessonRecord.date || getToday(),
      className: lessonRecord.className || "",
      activityKey: "activity2",
      exportedAt: new Date().toISOString(),
      rows,
    })
  );

  return new Promise((resolve) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      cleanup();
      resolve(false);
    }, 9000);

    function cleanup() {
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(Boolean(payload?.ok));
    };

    script.id = callbackName;
    script.src = url.toString();
    script.onerror = () => {
      cleanup();
      resolve(false);
    };
    document.body.append(script);
  });
}

function uploadGroupSubmission(submission) {
  const hint = document.querySelector("#submitHint");
  if (!lessonRecord.cloudEndpoint?.trim()) {
    hint.textContent = "本組已提交在這台裝置，但目前不是學生雲端連結，資料不會進老師雲端後台。請用老師提供的學生連結重新進入。";
    return;
  }
  hint.textContent = `${submission.groupName}已提交，正在送到老師後台...`;
  postRowsToCloud(getRowsForSubmission(submission)).then((ok) => {
    hint.textContent = ok ? `${submission.groupName}已提交，已送出雲端收件箱。` : `${submission.groupName}已提交本機；雲端送出失敗，請告訴老師。`;
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
    status.textContent = `已送出 ${submittedRows.length} 筆已提交資料，請到活動二收件箱確認。`;
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
  const callbackName = `recommendationLabSync_${Date.now()}`;
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
      status.textContent = `已同步 ${payload.rows?.length || 0} 筆活動二資料到教師後台。`;
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
    if (!isMeaningfulCloudRow(row)) return;

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
        groupName: row["組別"],
        time: row["提交時間"] || "",
        topTag: row["AI最想推"] || "",
        watchTime: row["觀看時間"] || "",
        path: row["推薦路徑"] ? row["推薦路徑"].split(" / ") : [],
        responses: [
          { question: row["想一想1題目"] || "", answer: row["想一想1答案"] || "" },
          { question: row["想一想2題目"] || "", answer: row["想一想2答案"] || "" },
          { question: row["想一想3題目"] || "", answer: row["想一想3答案"] || "" },
        ],
      };
    }
    const group = groups.find((item) => item.name === submission.groupName);
    if (group) submissions[group.id] = submission;
  });
}

function isMeaningfulCloudRow(row) {
  return Boolean(
    row["資料JSON"] ||
      row["提交時間"] ||
      row["AI最想推"] ||
      row["觀看時間"] ||
      row["推薦路徑"] ||
      row["想一想1答案"] ||
      row["想一想2答案"] ||
      row["想一想3答案"]
  );
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

function renderRoundButtons() {
  document.querySelectorAll(".round-buttons button").forEach((button) => {
    const isActive = Number(button.dataset.round) === state[activeGroup].round;
    button.classList.toggle("active", isActive);
  });
}

function render() {
  const groupState = state[activeGroup];
  document.querySelector("#roundLabel").textContent = groupState.round === 0 ? "第0回合" : `第${groupState.round}回合`;
  document.querySelector("#activeGroupTitle").textContent = `${groups[activeGroup].name}實驗桌`;
  document.querySelector("#activeRole").textContent = `觀察焦點：${groups[activeGroup].focus}`;
  document.querySelector("#teacherPrompt").textContent = teacherPrompts[groupState.round];
  document.querySelector("#taskTitle").textContent = getTaskTitle(groupState.round);
  document.querySelector("#timeSpent").textContent = `${groupState.time} 分鐘`;

  renderGroupTabs();
  renderRoundButtons();
  renderScoreBoard();
  renderDiscussion();
  renderSubmissionBoard();

  if (groupState.round === 0) {
    renderStartMessage();
  } else if (groupState.round === 3) {
    renderEventCards();
  } else if (groupState.round === 4) {
    renderToolCards();
  } else {
    renderContentCards(getCardsForRound(groupState.round));
  }
}

function getTaskTitle(round) {
  return {
    0: "先記住小宇的真正目標",
    1: "第1關：第一批影片來了",
    2: "第2關：AI開始推相似影片",
    3: "第3關：怪圈事件出現",
    4: "第4關：幫小宇拿回選擇權",
  }[round];
}

document.querySelector("#startGame").addEventListener("click", () => {
  state[activeGroup].round = 1;
  render();
});

document.querySelector("#resetGame").addEventListener("click", () => {
  state = groups.map(() => createGroupState());
  activeGroup = 0;
  render();
});

document.querySelectorAll(".round-buttons button").forEach((button) => {
  button.addEventListener("click", () => setRound(Number(button.dataset.round)));
});

document.querySelector("#showAllSubmissions").addEventListener("click", () => {
  document.querySelector(".teacher-dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#unlockDashboard").addEventListener("click", () => {
  const input = document.querySelector("#teacherPassword");
  const hint = document.querySelector("#passwordHint");

  if (input.value.trim() === "888") {
    dashboardUnlocked = true;
    sessionStorage.setItem("recommendationLabTeacherUnlocked", "true");
    input.value = "";
    hint.textContent = "已進入教師後台。";
    render();
    return;
  }

  hint.textContent = "密碼不正確，請再試一次。";
  input.select();
});

document.querySelector("#teacherPassword").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.querySelector("#unlockDashboard").click();
  }
});

document.querySelector("#lockDashboard").addEventListener("click", () => {
  dashboardUnlocked = false;
  sessionStorage.removeItem("recommendationLabTeacherUnlocked");
  render();
});

document.querySelector("#clearSubmissions").addEventListener("click", () => {
  submissions = {};
  saveSubmissions();
  render();
});

bindLessonRecordInputs();

document.querySelector("#downloadCsv").addEventListener("click", downloadCsvBackup);
document.querySelector("#downloadJson").addEventListener("click", downloadJsonBackup);
document.querySelector("#uploadCloud").addEventListener("click", uploadCloudBackup);
document.querySelector("#syncCloud").addEventListener("click", readCloudRows);
document.querySelector("#copyStudentLink").addEventListener("click", copyStudentShareLink);

render();
