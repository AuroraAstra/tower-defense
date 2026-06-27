const GAME_VERSION = "0.8.0";
const AUTO_WAVE_DELAY = 7;
const SAVE_KEY = "homewatch_tower_defense_save_v1";
const PROFILE_STORE_KEY = "homewatch_player_profiles_v1";
const ACTIVE_PROFILE_KEY = "homewatch_active_profile_v1";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  level: document.querySelector("#levelStat"),
  wave: document.querySelector("#waveStat"),
  life: document.querySelector("#lifeStat"),
  coin: document.querySelector("#coinStat"),
  countdown: document.querySelector("#countdownStat"),
  towerUnlock: document.querySelector("#towerUnlockStat"),
  levelScreen: document.querySelector("#levelScreen"),
  startLevelMap: document.querySelector("#startLevelMap"),
  continueBtn: document.querySelector("#continueBtn"),
  playerName: document.querySelector("#playerName"),
  playerInput: document.querySelector("#playerInput"),
  registerBtn: document.querySelector("#registerBtn"),
  medal: document.querySelector("#medalStat"),
  shopGrid: document.querySelector("#shopGrid"),
  briefing: document.querySelector("#briefing"),
  briefingTitle: document.querySelector("#briefingTitle"),
  briefingCloseBtn: document.querySelector("#briefingCloseBtn"),
  rulesList: document.querySelector("#rulesList"),
  challengeList: document.querySelector("#challengeList"),
  tacticList: document.querySelector("#tacticList"),
  startBriefingBtn: document.querySelector("#startBriefingBtn"),
  gameSurface: document.querySelector(".game-surface"),
  hud: document.querySelector(".hud"),
  buildMenu: document.querySelector("#buildMenu"),
  pauseMenu: document.querySelector("#pauseMenu"),
  levelMap: document.querySelector("#levelMap"),
  waveBtn: document.querySelector("#waveBtn"),
  restartBtn: document.querySelector("#restartBtn"),
  levelsBtn: document.querySelector("#levelsBtn"),
  pauseBtn: document.querySelector("#pauseBtn"),
  resumeBtn: document.querySelector("#resumeBtn"),
  pauseRestartBtn: document.querySelector("#pauseRestartBtn"),
  backToLevelsBtn: document.querySelector("#backToLevelsBtn"),
  challengeTrack: document.querySelector("#challengeTrack"),
  toast: document.querySelector("#toast"),
  draftPanel: document.querySelector("#draftPanel"),
  randomBuildBtn: document.querySelector("#randomBuildBtn"),
  mergeBtn: document.querySelector("#mergeBtn"),
  redeployBtn: document.querySelector("#redeployBtn"),
  combatNote: document.querySelector("#combatNote"),
};

const towerOrder = ["bottle", "snow", "sun", "fan", "rocket"];
const towerTypes = {
  bottle: {
    name: "瓶子炮",
    unlockLevel: 1,
    cost: 45,
    color: "#62caff",
    range: 118,
    fireRate: 0.82,
    damage: 20,
    splash: 0,
    pierce: 1,
    slow: 0,
    shieldBonus: 1,
    armorPierce: 0,
    role: "单体高爆发",
    tag: "Burst",
  },
  snow: {
    name: "雪花塔",
    unlockLevel: 2,
    cost: 65,
    color: "#78eba7",
    range: 112,
    fireRate: 1,
    damage: 11,
    splash: 18,
    pierce: 1,
    slow: 0.5,
    slowDuration: 1.9,
    shieldBonus: 1.8,
    armorPierce: 1,
    role: "控制辅助",
    tag: "CC",
  },
  sun: {
    name: "太阳花",
    unlockLevel: 3,
    cost: 80,
    color: "#ffc75a",
    range: 96,
    fireRate: 1.14,
    damage: 20,
    splash: 62,
    pierce: 1,
    slow: 0,
    shieldBonus: 0.9,
    armorPierce: 0,
    role: "群体范围伤害",
    tag: "AOE",
  },
  fan: {
    name: "风扇塔",
    unlockLevel: 4,
    cost: 95,
    color: "#d6a3ff",
    range: 148,
    fireRate: 0.58,
    damage: 15,
    splash: 26,
    pierce: 3,
    slow: 0,
    shieldBonus: 0.8,
    armorPierce: 2,
    role: "穿透压制",
    tag: "Pierce",
  },
  rocket: {
    name: "火箭塔",
    unlockLevel: 5,
    cost: 120,
    color: "#ff6f91",
    range: 188,
    fireRate: 1.68,
    damage: 46,
    splash: 78,
    pierce: 1,
    slow: 0,
    shieldBonus: 1.25,
    armorPierce: 6,
    role: "远程爆破",
    tag: "Burst",
  },
};

const pathSets = [
  [
    [0.02, 0.2],
    [0.25, 0.2],
    [0.25, 0.55],
    [0.52, 0.55],
    [0.52, 0.28],
    [0.8, 0.28],
    [0.8, 0.74],
    [0.96, 0.74],
  ],
  [
    [0.02, 0.78],
    [0.2, 0.78],
    [0.2, 0.34],
    [0.42, 0.34],
    [0.42, 0.64],
    [0.64, 0.64],
    [0.64, 0.22],
    [0.84, 0.22],
    [0.84, 0.56],
    [0.96, 0.56],
  ],
  [
    [0.02, 0.42],
    [0.22, 0.42],
    [0.22, 0.18],
    [0.45, 0.18],
    [0.45, 0.78],
    [0.67, 0.78],
    [0.67, 0.34],
    [0.88, 0.34],
    [0.88, 0.68],
    [0.96, 0.68],
  ],
  [
    [0.03, 0.62],
    [0.18, 0.62],
    [0.18, 0.24],
    [0.38, 0.24],
    [0.38, 0.48],
    [0.58, 0.48],
    [0.58, 0.78],
    [0.78, 0.78],
    [0.78, 0.36],
    [0.96, 0.36],
  ],
  [
    [0.02, 0.3],
    [0.16, 0.3],
    [0.16, 0.72],
    [0.36, 0.72],
    [0.36, 0.2],
    [0.57, 0.2],
    [0.57, 0.58],
    [0.76, 0.58],
    [0.76, 0.18],
    [0.96, 0.18],
  ],
];

const buildSets = [
  [
    [0.15, 0.4],
    [0.36, 0.36],
    [0.42, 0.7],
    [0.62, 0.43],
    [0.7, 0.13],
    [0.72, 0.64],
    [0.89, 0.5],
  ],
  [
    [0.1, 0.55],
    [0.29, 0.52],
    [0.36, 0.18],
    [0.5, 0.47],
    [0.54, 0.82],
    [0.72, 0.43],
    [0.74, 0.08],
    [0.91, 0.34],
  ],
  [
    [0.12, 0.2],
    [0.14, 0.62],
    [0.34, 0.36],
    [0.36, 0.7],
    [0.56, 0.56],
    [0.58, 0.13],
    [0.76, 0.55],
    [0.78, 0.2],
    [0.92, 0.48],
  ],
  [
    [0.09, 0.38],
    [0.28, 0.16],
    [0.32, 0.48],
    [0.48, 0.68],
    [0.62, 0.28],
    [0.72, 0.62],
    [0.88, 0.18],
    [0.9, 0.58],
  ],
  [
    [0.08, 0.52],
    [0.25, 0.58],
    [0.28, 0.14],
    [0.48, 0.38],
    [0.5, 0.78],
    [0.68, 0.36],
    [0.72, 0.74],
    [0.88, 0.34],
    [0.88, 0.08],
  ],
];

const propSets = [
  [
    ["box", 0.1, 0.68],
    ["stump", 0.34, 0.16],
    ["crystal", 0.62, 0.78],
  ],
  [
    ["box", 0.08, 0.22],
    ["stump", 0.34, 0.76],
    ["crystal", 0.57, 0.36],
    ["box", 0.9, 0.76],
  ],
  [
    ["stump", 0.08, 0.82],
    ["box", 0.31, 0.56],
    ["crystal", 0.56, 0.34],
    ["box", 0.75, 0.8],
    ["crystal", 0.93, 0.18],
  ],
  [
    ["box", 0.08, 0.12],
    ["crystal", 0.26, 0.72],
    ["stump", 0.48, 0.18],
    ["box", 0.68, 0.58],
  ],
  [
    ["crystal", 0.1, 0.82],
    ["box", 0.3, 0.44],
    ["stump", 0.5, 0.08],
    ["crystal", 0.67, 0.84],
    ["box", 0.88, 0.52],
  ],
];

const levelNames = [
  "晨光草场",
  "糖果河湾",
  "风车小径",
  "雾灯港口",
  "矿石山坡",
  "霜叶林地",
  "齿轮峡谷",
  "星砂废墟",
  "熔岩外环",
  "王城门前",
];

function createLevels() {
  return Array.from({ length: 10 }, (_, index) => {
    const levelNumber = index + 1;
    const route = index % pathSets.length;
    const earlyEase = Math.max(0, 3 - index) * 0.06;
    const hpScale = Math.pow(1.18, index) * (1 - earlyEase);
    const waveCount = 5;
    return {
      name: levelNames[index],
      coins: 205 + index * 24 + Math.max(0, 3 - index) * 10,
      lives: Math.max(14, 24 - Math.floor(index / 2)),
      path: pathSets[route],
      build: buildSets[route],
      props: propSets[route].map(([type, x, y], propIndex) => ({
        type,
        hp: Math.round((105 + levelNumber * 28 + propIndex * 22) * hpScale),
        reward: 36 + levelNumber * 6 + propIndex * 8,
        at: [x, y],
      })),
      waves: Array.from({ length: waveCount }, (_, waveIndex) =>
        createWave(levelNumber, waveIndex, hpScale),
      ),
    };
  });
}

function createWave(levelNumber, waveIndex, hpScale) {
  const bossWave = waveIndex === 4;
  const traits = [];
  if (levelNumber >= 2 && waveIndex === 1) traits.push("swift");
  if (levelNumber >= 3 && waveIndex >= 2) traits.push("shield");
  if (levelNumber >= 5 && waveIndex >= 3) traits.push("armor");
  if (levelNumber >= 7 && waveIndex >= 3) traits.push("regen");
  if (bossWave) traits.push("boss");

  const traitHpBonus =
    traits.includes("shield") * 0.15 +
    traits.includes("armor") * 0.18 +
    traits.includes("regen") * 0.12 +
    traits.includes("boss") * 1.45;
  const baseHp = 58 + levelNumber * 28;
  const earlyEase = Math.max(0, 4 - levelNumber) * 0.055;
  const hp = Math.round(baseHp * hpScale * (1 + waveIndex * 0.32 + traitHpBonus) * (1 - earlyEase));
  const speed = bossWave
    ? 43 + levelNumber * 2.2
    : 55 + levelNumber * 3.4 + waveIndex * 3.6 + (traits.includes("swift") ? 16 : 0);
  const count = bossWave
    ? 1 + Math.floor(levelNumber / 5)
    : 6 + levelNumber + waveIndex * 3 - (levelNumber <= 3 ? 1 : 0);
  return {
    count,
    hp,
    speed,
    reward: Math.max(7, 9 + Math.floor(levelNumber * 0.85) + waveIndex),
    gap: bossWave ? 1.2 : Math.max(0.34, 0.82 - levelNumber * 0.025 - waveIndex * 0.045),
    size: bossWave ? 22 + levelNumber * 0.7 : 12 + levelNumber * 0.35 + waveIndex * 0.5,
    shield: traits.includes("shield") ? Math.round(hp * (0.22 + levelNumber * 0.012)) : 0,
    armor: traits.includes("armor") ? 2 + Math.floor(levelNumber / 2) : 0,
    regen: traits.includes("regen") ? 2 + levelNumber * 0.8 : 0,
    traits,
  };
}

function createEndlessWave(waveIndex) {
  const waveNumber = waveIndex + 1;
  const bossWave = waveNumber % 5 === 0;
  const cycle = Math.floor(waveIndex / 5);
  const earlyEase = Math.max(0, 10 - waveIndex) * 0.035;
  const traits = [];
  if (waveNumber >= 4 && waveNumber % 2 === 1) traits.push("swift");
  if (waveNumber >= 6) traits.push("shield");
  if (waveNumber >= 10) traits.push("armor");
  if (waveNumber >= 14 && waveNumber % 3 !== 1) traits.push("regen");
  if (bossWave) traits.push("boss");

  const growth = Math.pow(1.085, waveIndex);
  const baseHp = bossWave ? 220 + cycle * 86 : 76 + waveIndex * 14;
  const hp = Math.round(baseHp * growth * (bossWave ? 1.16 + cycle * 0.065 : 1) * (1 - earlyEase));
  const speed = bossWave
    ? Math.min(94, 43 + cycle * 3.2)
    : Math.min(128, 56 + waveIndex * 1.55 + (traits.includes("swift") ? 12 : 0));
  const count = bossWave ? 1 + Math.floor(cycle / 4) : Math.min(40, 7 + Math.floor(waveIndex * 1.35));

  return {
    count,
    hp,
    speed,
    reward: Math.round((bossWave ? 42 + cycle * 10 : 12 + waveIndex * 1.2) * (1 + cycle * 0.04)),
    gap: bossWave ? 1.08 : Math.max(0.3, 0.84 - waveIndex * 0.008),
    size: bossWave ? Math.min(42, 25 + cycle * 1.2) : Math.min(22, 13 + waveIndex * 0.18),
    shield: traits.includes("shield") ? Math.round(hp * Math.min(0.42, 0.14 + waveIndex * 0.006)) : 0,
    armor: traits.includes("armor") ? Math.min(28, 3 + Math.floor(waveIndex / 4)) : 0,
    regen: traits.includes("regen") ? Math.min(46, 2 + waveIndex * 0.7) : 0,
    traits,
  };
}

const levels = createLevels();
const rules = [
  "怪物会沿道路进攻房屋，房屋耐久归零则挑战失败。",
  "每关 5 波，倒计时结束会自动刷波，也可以手动提前开波。",
  "清理地图道具会获得金币；防御塔可升级，战役模式最高 3 级。",
  "每波结束或清理关键道具后可获得三选一被动 Buff，强化火力网、经济或克制能力。",
  "可用随机召唤建塔，也可将两个同类型同等级塔合成为随机高阶塔。",
  "特殊怪拥有高速、护盾、护甲、回血或 Boss 特性，需要搭配不同防御塔克制。",
];

const tacticCards = [
  {
    id: "frost",
    name: "霜线预案",
    text: "开局金币 +25，雪花塔费用 -10，所有减速时长再 +0.35 秒。",
  },
  {
    id: "salvage",
    name: "清障合同",
    text: "清理道具奖励 +35%，适合先打资源再铺塔。",
  },
  {
    id: "overdrive",
    name: "抢攻节拍",
    text: "立即开波按钮额外奖励 +18 金币，但自动倒计时缩短 2 秒。",
  },
];

const draftCards = [
  {
    id: "burstProtocol",
    name: "单体爆发协议",
    text: "瓶子炮与火箭塔伤害 +18%，用于压制精英与 Boss。",
    kind: "towerRole",
  },
  {
    id: "aoeExpansion",
    name: "范围溅射扩容",
    text: "群伤塔溅射半径 +16，太阳花与火箭塔获得额外清场能力。",
    kind: "towerRole",
  },
  {
    id: "controlNet",
    name: "控制火力网",
    text: "减速时长 +0.45 秒，风扇塔额外轻微推迟敌人进度。",
    kind: "control",
  },
  {
    id: "salvageLoop",
    name: "以战养战",
    text: "击杀金币 +15%，道具奖励 +12%，强化局内经济循环。",
    kind: "economy",
  },
  {
    id: "rapidFoundry",
    name: "快速铸塔",
    text: "随机召唤费用 -12，建造与升级的资源压力更低。",
    kind: "economy",
  },
  {
    id: "armorCrack",
    name: "破甲弹芯",
    text: "所有防御塔破甲 +3，护甲怪受到的边际压制降低。",
    kind: "counter",
  },
  {
    id: "rangeMapping",
    name: "火力网测绘",
    text: "所有塔射程 +12，转弯处覆盖时间更长。",
    kind: "coverage",
  },
  {
    id: "mergeCatalyst",
    name: "合成催化",
    text: "合成后的新塔等级额外 +1，战役模式仍受等级上限限制。",
    kind: "merge",
  },
];

const shopItems = [
  {
    id: "coinSeed",
    name: "储蓄罐",
    text: "每局开局金币 +30。",
    cost: 6,
  },
  {
    id: "homeGuard",
    name: "加固围栏",
    text: "每局房屋耐久 +3。",
    cost: 8,
  },
  {
    id: "snowMastery",
    name: "雪花专精",
    text: "雪花塔费用 -5，减速时长 +0.25 秒。",
    cost: 10,
  },
];

const endlessBuildSet = [
  [0.08, 0.52],
  [0.18, 0.12],
  [0.22, 0.48],
  [0.28, 0.86],
  [0.38, 0.42],
  [0.46, 0.08],
  [0.48, 0.76],
  [0.58, 0.36],
  [0.63, 0.68],
  [0.72, 0.18],
  [0.73, 0.82],
  [0.84, 0.36],
  [0.88, 0.08],
  [0.9, 0.62],
];
const endlessLevel = {
  name: "无尽守望",
  coins: 350,
  lives: 34,
  path: pathSets[4],
  build: endlessBuildSet,
  props: propSets[4].map(([type, x, y], propIndex) => ({
    type,
    hp: 145 + propIndex * 34,
    reward: 44 + propIndex * 12,
    at: [x, y],
  })),
};

const state = {
  profileName: "访客",
  medals: 0,
  shop: {},
  mode: "campaign",
  levelIndex: 0,
  unlockedLevel: 0,
  screen: "levels",
  waveIndex: 0,
  countdown: AUTO_WAVE_DELAY,
  lives: levels[0].lives,
  coins: levels[0].coins,
  selectedBuild: null,
  selectedTower: null,
  buildMenuSite: null,
  waveActive: false,
  paused: false,
  ended: false,
  levelCleared: false,
  spawnTimer: 0,
  spawned: 0,
  lastTime: 0,
  enemies: [],
  towers: [],
  bullets: [],
  sparks: [],
  props: [],
  draftChoices: [],
  draftOffered: false,
  draftOpen: false,
  buffs: {},
  pendingMode: "campaign",
  pendingLevelIndex: 0,
  selectedTactic: "frost",
  runTactic: "frost",
  challengeDefs: [],
  challenges: [],
  runStats: {
    livesLost: 0,
    propsCleared: 0,
    towersBuilt: 0,
    snowBuilt: 0,
    slowsApplied: 0,
    manualWaves: 0,
    merges: 0,
    randomSummons: 0,
    redeploys: 0,
  },
};

let lastLevelMapKey = "";
let lastStartLevelMapKey = "";
let lastBuildMenuKey = "";
let lastChallengeTrackKey = "";

function clampLevelIndex(index) {
  return Math.max(0, Math.min(levels.length - 1, Number(index) || 0));
}

function normalizeProfileName(name) {
  const cleaned = String(name || "").trim().replace(/\s+/g, " ").slice(0, 14);
  return cleaned || "访客";
}

function defaultProfile(name = "访客") {
  return {
    name: normalizeProfileName(name),
    version: GAME_VERSION,
    unlockedLevel: 0,
    levelIndex: 0,
    medals: 0,
    shop: {},
  };
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILE_STORE_KEY);
    const profiles = raw ? JSON.parse(raw) : {};
    if (profiles && typeof profiles === "object") return profiles;
  } catch (error) {
    localStorage.removeItem(PROFILE_STORE_KEY);
  }
  return {};
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(profiles));
}

function migrateLegacySave(profiles) {
  if (Object.keys(profiles).length > 0) return profiles;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return profiles;
    const save = JSON.parse(raw);
    profiles["访客"] = {
      ...defaultProfile("访客"),
      unlockedLevel: clampLevelIndex(save.unlockedLevel),
      levelIndex: Math.min(clampLevelIndex(save.levelIndex), clampLevelIndex(save.unlockedLevel)),
    };
    saveProfiles(profiles);
  } catch (error) {
    localStorage.removeItem(SAVE_KEY);
  }
  return profiles;
}

function loadSave() {
  const profiles = migrateLegacySave(loadProfiles());
  const activeName = normalizeProfileName(localStorage.getItem(ACTIVE_PROFILE_KEY) || "访客");
  const profile = profiles[activeName] || profiles["访客"] || defaultProfile(activeName);
  profiles[profile.name] = profile;
  saveProfiles(profiles);
  state.profileName = profile.name;
  state.unlockedLevel = clampLevelIndex(profile.unlockedLevel);
  state.levelIndex = Math.min(clampLevelIndex(profile.levelIndex), state.unlockedLevel);
  state.medals = Math.max(0, Number(profile.medals) || 0);
  state.shop = profile.shop && typeof profile.shop === "object" ? profile.shop : {};
  localStorage.setItem(ACTIVE_PROFILE_KEY, state.profileName);
  renderShop.key = "";
}

function saveProgress() {
  const profiles = migrateLegacySave(loadProfiles());
  const data = {
    name: state.profileName,
    version: GAME_VERSION,
    unlockedLevel: state.unlockedLevel,
    levelIndex: state.levelIndex,
    medals: state.medals,
    shop: state.shop,
  };
  profiles[state.profileName] = data;
  saveProfiles(profiles);
  localStorage.setItem(ACTIVE_PROFILE_KEY, state.profileName);
}

function switchProfile(name) {
  const profileName = normalizeProfileName(name);
  const profiles = migrateLegacySave(loadProfiles());
  if (!profiles[profileName]) profiles[profileName] = defaultProfile(profileName);
  saveProfiles(profiles);
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileName);
  loadSave();
  closeBriefing();
  resetLevel(state.levelIndex);
  setScreen("levels");
  showToast(`已切换到 ${state.profileName}`);
  updateUi();
}

function level() {
  return state.mode === "endless" ? endlessLevel : levels[state.levelIndex];
}

function currentWave() {
  return state.mode === "endless" ? createEndlessWave(state.waveIndex) : level().waves[state.waveIndex];
}

function resize() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function width() {
  return canvas.getBoundingClientRect().width;
}

function height() {
  return canvas.getBoundingClientRect().height;
}

function point(pair) {
  return { x: pair[0] * width(), y: pair[1] * height() };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function showToast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.remove("hide");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => ui.toast.classList.add("hide"), 1700);
}

function setScreen(screen) {
  state.screen = screen;
  const inGame = screen === "game";
  ui.levelScreen.classList.toggle("hide", inGame);
  ui.gameSurface.classList.toggle("hide", !inGame);
  ui.hud.classList.toggle("hide", !inGame);
  if (inGame) window.scrollTo(0, 0);
  if (!inGame) {
    hideBuildMenu();
    ui.draftPanel.classList.add("hide");
    state.draftOpen = false;
    if (screen === "levels") closeBriefing();
    setPaused(false);
  }
  resize();
  updateUi();
}

function setPaused(paused) {
  state.paused = paused;
  ui.pauseBtn.textContent = state.paused ? "▶" : "Ⅱ";
  ui.pauseMenu.classList.toggle("hide", !state.paused);
  updateUi();
}

function unlockedTowerCount() {
  if (state.mode === "endless") return towerOrder.length;
  const playableLevel = state.unlockedLevel + 1;
  return towerOrder.filter((key) => towerTypes[key].unlockLevel <= playableLevel).length;
}

function isTowerUnlocked(type) {
  if (state.mode === "endless") return true;
  return towerTypes[type].unlockLevel <= state.unlockedLevel + 1;
}

function tactic() {
  return tacticCards.find((card) => card.id === state.runTactic) || tacticCards[0];
}

function autoWaveDelay() {
  return tactic().id === "overdrive" ? Math.max(4, AUTO_WAVE_DELAY - 2) : AUTO_WAVE_DELAY;
}

function tacticStartingCoins() {
  return tactic().id === "frost" ? 25 : 0;
}

function shopStartingCoins() {
  return state.shop.coinSeed ? 30 : 0;
}

function shopLivesBonus() {
  return state.shop.homeGuard ? 3 : 0;
}

function tacticPropRewardMultiplier() {
  return (tactic().id === "salvage" ? 1.35 : 1) + buffCount("salvageLoop") * 0.12;
}

function tacticManualWaveBonus() {
  return tactic().id === "overdrive" ? 18 : 0;
}

function tacticTowerCost(type) {
  const discount =
    (tactic().id === "frost" && type === "snow" ? 10 : 0) +
    (state.shop.snowMastery && type === "snow" ? 5 : 0);
  return Math.max(1, towerTypes[type].cost - discount);
}

function tacticSlowBonus() {
  return (tactic().id === "frost" ? 0.35 : 0) + (state.shop.snowMastery ? 0.25 : 0);
}

function buffCount(id) {
  return state.buffs[id] || 0;
}

function randomSummonCost() {
  return Math.max(35, 72 - buffCount("rapidFoundry") * 12);
}

function unlockedTowerPool() {
  return towerOrder.filter(isTowerUnlocked);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function maxTowerLevel() {
  return state.mode === "endless" ? Infinity : 3;
}

function clampTowerLevel(level) {
  return state.mode === "endless" ? level : Math.min(maxTowerLevel(), level);
}

function draftPool() {
  return draftCards.filter((card) => buffCount(card.id) < 3);
}

function createDraftChoices(count = 3) {
  const pool = draftPool();
  const choices = [];
  while (choices.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(index, 1)[0]);
  }
  return choices;
}

function challengeSet(mode, index) {
  if (mode === "endless") {
    return [
      {
        id: "endless10",
        name: "长线守望",
        text: "守住 10 波",
        reward: 120,
        progress: () => Math.min(state.waveIndex, 10),
        target: 10,
      },
      {
        id: "snow12",
        name: "霜冻封路",
        text: "用雪花塔造成 12 次减速",
        reward: 70,
        progress: () => Math.min(state.runStats.slowsApplied, 12),
        target: 12,
      },
      {
        id: "noLoss5",
        name: "五波无损",
        text: "前 5 波不损失房屋耐久",
        reward: 90,
        progress: () => (state.waveIndex >= 5 && state.runStats.livesLost === 0 ? 1 : 0),
        target: 1,
      },
    ];
  }

  const levelNumber = index + 1;
  const challenges = [
    {
      id: "noLoss",
      name: "完整守望",
      text: "通关时不损失房屋耐久",
      reward: 45 + levelNumber * 5,
      progress: () => (state.levelCleared && state.runStats.livesLost === 0 ? 1 : 0),
      target: 1,
    },
    {
      id: "clearProps",
      name: "清障专家",
      text: "通关前清理所有地图道具",
      reward: 35 + levelNumber * 4,
      progress: () => Math.min(state.runStats.propsCleared, level().props.length),
      target: () => level().props.length,
    },
  ];

  if (levelNumber >= 2) {
    challenges.push({
      id: "snowSlow",
      name: "冰线控制",
      text: "用雪花塔造成 6 次减速",
      reward: 55 + levelNumber * 4,
      progress: () => Math.min(state.runStats.slowsApplied, 6),
      target: 6,
    });
  } else {
    challenges.push({
      id: "fewTowers",
      name: "精打细算",
      text: "最多建造 4 座塔通关",
      reward: 45,
      progress: () => (state.levelCleared && state.runStats.towersBuilt <= 4 ? 1 : 0),
      target: 1,
    });
  }

  if (levelNumber >= 4) {
    challenges.push({
      id: "mergePlay",
      name: "合成试验",
      text: "本关完成 1 次同阶合成",
      reward: 45 + levelNumber * 3,
      progress: () => Math.min(state.runStats.merges, 1),
      target: 1,
    });
  }

  return challenges;
}

function challengeTarget(challenge) {
  return typeof challenge.target === "function" ? challenge.target() : challenge.target;
}

function challengeProgress(challenge) {
  return Math.max(0, Math.min(challengeTarget(challenge), challenge.progress()));
}

function challengeMedalReward(challenge) {
  return Math.max(1, Math.ceil(challenge.reward / 35));
}

function resetRunStats() {
  state.runStats = {
    livesLost: 0,
    propsCleared: 0,
    towersBuilt: 0,
    snowBuilt: 0,
    slowsApplied: 0,
    manualWaves: 0,
    merges: 0,
    randomSummons: 0,
    redeploys: 0,
  };
}

function createRunChallenges() {
  state.challengeDefs = challengeSet(state.mode, state.levelIndex);
  state.challenges = state.challengeDefs.map((challenge) => ({
    id: challenge.id,
    complete: false,
    paid: false,
  }));
}

function buyShopItem(id) {
  const item = shopItems.find((entry) => entry.id === id);
  if (!item || state.shop[id]) return;
  if (state.medals < item.cost) {
    showToast("星章不足");
    return;
  }
  state.medals -= item.cost;
  state.shop = { ...state.shop, [id]: true };
  saveProgress();
  showToast(`已购买：${item.name}`);
  updateUi();
}

function firstUnlockedTower() {
  return towerOrder.find(isTowerUnlocked) || "bottle";
}

function canUpgrade(tower) {
  return tower.level < maxTowerLevel() && state.coins >= upgradeCost(tower);
}

function makeProps() {
  return level().props.map((prop, index) => {
    const p = point(prop.at);
    return {
      ...prop,
      ...p,
      id: `prop-${state.levelIndex}-${index}`,
      maxHp: prop.hp,
      kind: "prop",
      dead: false,
    };
  });
}

function resetSharedRun() {
  state.waveIndex = 0;
  state.countdown = autoWaveDelay();
  state.lives = level().lives + shopLivesBonus();
  state.coins = level().coins + tacticStartingCoins() + shopStartingCoins();
  state.selectedBuild = null;
  state.selectedTower = null;
  state.buildMenuSite = null;
  state.waveActive = false;
  setPaused(false);
  state.ended = false;
  state.levelCleared = false;
  state.spawnTimer = 0;
  state.spawned = 0;
  state.enemies = [];
  state.towers = [];
  state.bullets = [];
  state.sparks = [];
  state.props = makeProps();
  state.draftChoices = [];
  state.draftOffered = false;
  state.draftOpen = false;
  state.buffs = {};
  ui.draftPanel.classList.add("hide");
  resetRunStats();
  createRunChallenges();
  hideBuildMenu();
}

function resetLevel(index = state.levelIndex) {
  state.mode = "campaign";
  state.levelIndex = index;
  state.runTactic = state.selectedTactic;
  resetSharedRun();
  saveProgress();
  showToast(`第 ${index + 1} 关：${level().name} · ${tactic().name}`);
  updateUi();
}

function resetEndless() {
  state.mode = "endless";
  state.runTactic = state.selectedTactic;
  resetSharedRun();
  showToast(`无尽模式：每 5 波 Boss · ${tactic().name}`);
  updateUi();
}

function openBriefing(mode, index = state.levelIndex) {
  if (mode === "campaign" && index > state.unlockedLevel) return;
  state.pendingMode = mode;
  state.pendingLevelIndex = clampLevelIndex(index);
  renderBriefing();
  ui.briefing.classList.remove("hide");
  ui.briefing.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeBriefing() {
  ui.briefing.classList.add("hide");
}

function startBriefedRun() {
  closeBriefing();
  setScreen("game");
  if (state.pendingMode === "endless") {
    resetEndless();
  } else {
    resetLevel(state.pendingLevelIndex);
  }
}

function selectLevel(index) {
  if (index > state.unlockedLevel) {
    return;
  }
  openBriefing("campaign", index);
}

function startEndless() {
  openBriefing("endless");
}

function restartCurrentRun() {
  if (state.mode === "endless") {
    resetEndless();
  } else {
    resetLevel(state.levelIndex);
  }
}

function nextLevel() {
  if (state.levelIndex >= levels.length - 1) {
    resetLevel(0);
    return;
  }
  resetLevel(state.levelIndex + 1);
}

function spawnEnemy(wave) {
  const start = point(level().path[0]);
  state.enemies.push({
    x: start.x,
    y: start.y,
    segment: 0,
    progress: 0,
    hp: wave.hp,
    maxHp: wave.hp,
    shield: wave.shield,
    maxShield: wave.shield,
    armor: wave.armor,
    regen: wave.regen,
    speed: wave.speed,
    size: wave.size,
    reward: wave.reward,
    traits: wave.traits,
    slowUntil: 0,
    slowFactor: 1,
    kind: "enemy",
  });
}

function startWave() {
  if (state.draftOpen) return;
  if (state.ended && !state.levelCleared) {
    restartCurrentRun();
    return;
  }
  if (state.mode === "campaign" && state.ended && state.levelIndex >= levels.length - 1) {
    resetLevel(0);
    return;
  }
  if (state.mode === "campaign" && state.levelCleared) {
    nextLevel();
    return;
  }
  if (state.waveActive) return;
  if (state.mode === "campaign" && state.waveIndex >= level().waves.length) return;

  if (state.countdown > 0 && tacticManualWaveBonus() > 0) {
    state.coins += tacticManualWaveBonus();
    state.runStats.manualWaves += 1;
    showToast(`抢攻奖励 +${tacticManualWaveBonus()}`);
  }
  state.waveActive = true;
  state.countdown = 0;
  state.spawnTimer = 0;
  state.spawned = 0;
  state.selectedBuild = null;
  const wave = currentWave();
  const label = state.mode === "endless" ? `无尽第 ${state.waveIndex + 1} 波` : `第 ${state.waveIndex + 1} 波`;
  showToast(`${label}${wave.traits.includes("boss") ? " Boss 来袭" : "开始"}`);
  updateUi();
}

function clearCurrentLevel() {
  state.waveActive = false;
  state.levelCleared = true;
  state.enemies = [];
  state.bullets = [];
  const previousUnlocked = state.unlockedLevel;
  state.unlockedLevel = Math.max(
    state.unlockedLevel,
    Math.min(levels.length - 1, state.levelIndex + 1),
  );
  saveProgress();

  if (state.levelIndex >= levels.length - 1) {
    state.ended = true;
    showToast("10 关全部通关");
  } else if (state.unlockedLevel > previousUnlocked) {
    const newlyUnlockedTower = towerOrder.find(
      (key) => towerTypes[key].unlockLevel === state.unlockedLevel + 1,
    );
    showToast(
      newlyUnlockedTower
        ? `解锁第 ${state.levelIndex + 2} 关和 ${towerTypes[newlyUnlockedTower].name}`
        : `解锁第 ${state.levelIndex + 2} 关`,
    );
  } else {
    showToast("关卡通过");
  }
  evaluateChallenges(true);
  updateUi();
}

function challengeState(challenge) {
  return state.challenges.find((item) => item.id === challenge.id);
}

function evaluateChallenges(final = false) {
  for (const challenge of state.challengeDefs) {
    const current = challengeState(challenge);
    if (!current || current.complete) continue;
    const target = challengeTarget(challenge);
    const progress = challengeProgress(challenge);
    const complete = progress >= target;
    const finalOnly = challenge.id === "noLoss" || challenge.id === "fewTowers";
    if (complete && (final || !finalOnly)) {
      current.complete = true;
      if (!current.paid) {
        current.paid = true;
        const medals = challengeMedalReward(challenge);
        state.coins += challenge.reward;
        state.medals += medals;
        saveProgress();
        showToast(`挑战完成：${challenge.name} +${challenge.reward} 金币 +${medals} 星章`);
      }
    }
  }
}

function finishWaveIfDone() {
  const wave = currentWave();
  if (!state.waveActive || !wave) return;
  if (state.spawned >= wave.count && state.enemies.length === 0) {
    state.waveActive = false;
    state.waveIndex += 1;
    if (state.mode === "endless") {
      const bonus = Math.round(32 + state.waveIndex * 5.5 + (wave.traits.includes("boss") ? 62 + state.waveIndex * 3 : 0));
      state.coins += bonus;
      state.countdown = autoWaveDelay();
      showToast(`第 ${state.waveIndex} 波守住了 +${bonus}`);
      offerDraft(`第 ${state.waveIndex} 波奖励`);
      updateUi();
    } else {
      state.coins += 24 + state.levelIndex * 4 + state.waveIndex * 3;
      if (state.waveIndex >= level().waves.length) {
        clearCurrentLevel();
      } else {
        state.countdown = autoWaveDelay();
        showToast(`${autoWaveDelay()} 秒后自动刷下一波`);
        offerDraft(`第 ${state.waveIndex} 波奖励`);
        updateUi();
      }
    }
  }
}

function offerDraft(reason = "战术成长") {
  if (state.ended || state.levelCleared || state.draftOpen) return;
  const choices = createDraftChoices();
  if (choices.length === 0) return;
  state.draftChoices = choices;
  state.draftOpen = true;
  state.draftOffered = true;
  renderDraft(reason);
}

function chooseDraft(id) {
  const card = state.draftChoices.find((item) => item.id === id);
  if (!card) return;
  state.buffs = { ...state.buffs, [id]: buffCount(id) + 1 };
  state.draftChoices = [];
  state.draftOpen = false;
  ui.draftPanel.classList.add("hide");
  showToast(`${card.name} Lv.${buffCount(id)}`);
  updateUi();
}

function buildAt(siteIndex, towerType) {
  return placeTower(siteIndex, towerType, {
    cost: tacticTowerCost(towerType),
    source: "build",
    level: 1,
  });
}

function placeTower(siteIndex, towerType, options = {}) {
  const site = point(level().build[siteIndex]);
  const existing = state.towers.find((tower) => tower.siteIndex === siteIndex);
  if (existing) {
    state.selectedTower = existing;
    state.selectedBuild = null;
    hideBuildMenu();
    updateUi();
    return;
  }
  const type = towerTypes[towerType];
  if (!type) return;
  if (!isTowerUnlocked(towerType)) {
    showToast(`通关第 ${type.unlockLevel - 1} 关解锁 ${type.name}`);
    return;
  }
  const cost = Math.max(0, Number(options.cost) || 0);
  if (state.coins < cost) {
    showToast("金币不足");
    return;
  }
  state.coins -= cost;
  state.towers.push({
    ...site,
    type: towerType,
    siteIndex,
    level: clampTowerLevel(options.level || 1),
    cooldown: 0,
    angle: 0,
    kind: "tower",
  });
  state.runStats.towersBuilt += 1;
  if (options.source === "random") state.runStats.randomSummons += 1;
  if (towerType === "snow") state.runStats.snowBuilt += 1;
  state.selectedTower = state.towers[state.towers.length - 1];
  state.selectedBuild = null;
  hideBuildMenu();
  showToast(options.message || `${type.name} 建造完成`);
  updateUi();
  return state.selectedTower;
}

function upgradeTower(tower = state.selectedTower) {
  if (!tower) return;
  const cost = upgradeCost(tower);
  if (tower.level >= maxTowerLevel()) {
    showToast("已经满级");
    return;
  }
  if (state.coins < cost) {
    showToast("金币不足");
    return;
  }
  state.coins -= cost;
  tower.level += 1;
  state.selectedTower = tower;
  showToast(`${towerTypes[tower.type].name} 升至 Lv.${tower.level}`);
  updateUi();
}

function sellTower(message = "出售") {
  const tower = state.selectedTower;
  if (!tower) return;
  const refund = Math.floor(towerTypes[tower.type].cost * (0.55 + tower.level * 0.16));
  state.coins += refund;
  state.towers = state.towers.filter((item) => item !== tower);
  state.selectedTower = null;
  showToast(`${message} +${refund}`);
  updateUi();
}

function randomSummonAtSelectedSite() {
  if (state.selectedBuild === null) {
    showToast("先选择一个空建造点");
    return;
  }
  const siteIndex = state.selectedBuild;
  const occupied = state.towers.some((tower) => tower.siteIndex === siteIndex);
  if (occupied) {
    showToast("该位置已有防御塔");
    return;
  }
  const pool = unlockedTowerPool();
  if (pool.length === 0) return;
  const type = randomFrom(pool);
  placeTower(siteIndex, type, {
    cost: randomSummonCost(),
    source: "random",
    message: `随机召唤：${towerTypes[type].name}`,
  });
}

function mergeCandidates(tower = state.selectedTower) {
  if (!tower) return [];
  return state.towers.filter(
    (item) => item !== tower && item.type === tower.type && item.level === tower.level,
  );
}

function canMerge(tower = state.selectedTower) {
  return Boolean(tower && mergeCandidates(tower).length > 0);
}

function mergeSelectedTower() {
  const tower = state.selectedTower;
  if (!tower) {
    showToast("先选择一座防御塔");
    return;
  }
  const partner = mergeCandidates(tower).sort((a, b) => distance(tower, a) - distance(tower, b))[0];
  if (!partner) {
    showToast("需要同类型同等级的另一座塔");
    return;
  }
  const nextType = randomFrom(unlockedTowerPool());
  const nextLevel = clampTowerLevel(tower.level + 1 + (buffCount("mergeCatalyst") > 0 ? 1 : 0));
  state.towers = state.towers.filter((item) => item !== tower && item !== partner);
  const merged = {
    x: tower.x,
    y: tower.y,
    type: nextType,
    siteIndex: tower.siteIndex,
    level: nextLevel,
    cooldown: 0,
    angle: tower.angle,
    kind: "tower",
  };
  state.towers.push(merged);
  state.selectedTower = merged;
  state.runStats.merges += 1;
  state.sparks.push({ x: merged.x, y: merged.y, r: 44, ttl: 0.42, color: towerTypes[nextType].color });
  showToast(`合成成功：${towerTypes[nextType].name} Lv.${nextLevel}`);
  evaluateChallenges();
  updateUi();
}

function redeploySelectedTower() {
  if (!state.selectedTower) {
    showToast("先选择一座防御塔");
    return;
  }
  state.runStats.redeploys += 1;
  sellTower("撤退回收");
}

function upgradeCost(tower) {
  if (state.mode === "endless") {
    return Math.floor(towerTypes[tower.type].cost * 0.9 * Math.pow(1.31, tower.level - 1));
  }
  return Math.floor(towerTypes[tower.type].cost * (0.78 + tower.level * 0.58));
}

function towerStats(tower) {
  const type = towerTypes[tower.type];
  const levelBonus = tower.level - 1;
  const roleDamageBonus =
    type.tag === "Burst" && buffCount("burstProtocol") > 0
      ? 1 + buffCount("burstProtocol") * 0.18
      : 1;
  const rangeBonus = buffCount("rangeMapping") * 12;
  const splashBonus =
    (type.splash > 0 || type.tag === "AOE") && buffCount("aoeExpansion") > 0
      ? buffCount("aoeExpansion") * 16
      : 0;
  const controlBonus = buffCount("controlNet") * 0.45;
  const armorBonus = buffCount("armorCrack") * 3;
  if (state.mode === "endless") {
    return {
      ...type,
      range: type.range + Math.min(132, levelBonus * 10) + rangeBonus,
      damage: type.damage * Math.pow(1.17, levelBonus) * roleDamageBonus,
      fireRate: Math.max(0.2, type.fireRate * Math.pow(0.955, levelBonus)),
      splash: type.splash + Math.min(96, levelBonus * 7) + splashBonus,
      slowDuration:
        (type.slowDuration || 0) +
        Math.min(1.8, levelBonus * 0.16) +
        (type.slow ? tacticSlowBonus() + controlBonus : 0),
      armorPierce: type.armorPierce + levelBonus * 2.2 + armorBonus,
      shieldBonus: type.shieldBonus + levelBonus * 0.08,
      knockback: tower.type === "fan" ? 0.012 * buffCount("controlNet") : 0,
    };
  }
  const damageScale = 1 + levelBonus * 0.36;
  return {
    ...type,
    range: type.range + levelBonus * 18 + rangeBonus,
    damage: type.damage * damageScale * roleDamageBonus,
    fireRate: Math.max(0.34, type.fireRate * (1 - levelBonus * 0.08)),
    splash: type.splash + levelBonus * 10 + splashBonus,
    slowDuration:
      (type.slowDuration || 0) + levelBonus * 0.32 + (type.slow ? tacticSlowBonus() + controlBonus : 0),
    armorPierce: type.armorPierce + levelBonus * 2 + armorBonus,
    shieldBonus: type.shieldBonus + levelBonus * 0.12,
    knockback: tower.type === "fan" ? 0.012 * buffCount("controlNet") : 0,
  };
}

function activeTargets() {
  return [...state.enemies, ...state.props.filter((prop) => !prop.dead)];
}

function applyDamage(target, damage, stats, now) {
  let incoming = damage;
  if (target.kind === "enemy" && target.shield > 0) {
    const shieldDamage = incoming * stats.shieldBonus;
    target.shield -= shieldDamage;
    if (target.shield < 0) {
      incoming = -target.shield / Math.max(0.1, stats.shieldBonus);
      target.shield = 0;
    } else {
      incoming = 0;
    }
  }

  if (incoming > 0) {
    const armor = target.kind === "enemy" ? Math.max(0, target.armor - stats.armorPierce) : 0;
    target.hp -= Math.max(1, incoming - armor);
  }

  if (target.kind === "enemy" && stats.slow) {
    target.slowUntil = Math.max(target.slowUntil, now + (stats.slowDuration || 1.25));
    target.slowFactor = stats.slow;
    if (stats.name === towerTypes.snow.name) {
      state.runStats.slowsApplied += 1;
      evaluateChallenges();
    }
  }

  if (target.kind === "enemy" && stats.knockback > 0) {
    target.progress = Math.max(0, target.progress - stats.knockback);
  }

  state.sparks.push({
    x: target.x,
    y: target.y,
    r: target.kind === "prop" ? 10 : 6,
    ttl: 0.22,
    color: target.kind === "prop" ? "#ffc75a" : stats.color,
  });
}

function update(dt, now) {
  if (state.screen !== "game") return;
  if (state.draftOpen) {
    updateUi();
    return;
  }
  if (state.paused || state.ended) return;

  const canAutoWave =
    state.mode === "endless" || (!state.levelCleared && state.waveIndex < level().waves.length);
  if (!state.waveActive && canAutoWave) {
    state.countdown -= dt;
    if (state.countdown <= 0) startWave();
  }

  const wave = currentWave();
  if (state.waveActive && wave) {
    state.spawnTimer -= dt;
    if (state.spawned < wave.count && state.spawnTimer <= 0) {
      spawnEnemy(wave);
      state.spawned += 1;
      state.spawnTimer = wave.gap;
    }
  }

  updateEnemies(dt, now);
  updateTowers(dt, now);
  updateBullets(dt, now);
  updateSparks(dt);
  finishWaveIfDone();
  updateUi();
}

function updateEnemies(dt, now) {
  const path = level().path.map(point);
  for (const enemy of state.enemies) {
    if (enemy.regen > 0 && enemy.hp > 0) {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regen * dt);
    }
    const speed = enemy.speed * (enemy.slowUntil > now ? enemy.slowFactor : 1);
    let travel = speed * dt;
    while (travel > 0 && enemy.segment < path.length - 1) {
      const from = path[enemy.segment];
      const to = path[enemy.segment + 1];
      const length = distance(from, to);
      const remain = length * (1 - enemy.progress);
      if (travel < remain) {
        enemy.progress += travel / length;
        travel = 0;
      } else {
        travel -= remain;
        enemy.segment += 1;
        enemy.progress = 0;
      }
    }
    if (enemy.segment >= path.length - 1) {
      enemy.escaped = true;
      const damage = enemy.traits.includes("boss") ? 4 : 1;
      state.lives -= damage;
      state.runStats.livesLost += damage;
      const end = path[path.length - 1];
      state.sparks.push({ x: end.x, y: end.y, r: 30, ttl: 0.32, color: "#ff6f91" });
      if (state.lives <= 0) {
        state.lives = 0;
        state.ended = true;
        state.waveActive = false;
        showToast("房屋被攻破");
      }
      continue;
    }
    const from = path[enemy.segment];
    const to = path[enemy.segment + 1];
    enemy.x = from.x + (to.x - from.x) * enemy.progress;
    enemy.y = from.y + (to.y - from.y) * enemy.progress;
  }

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0 && !enemy.dead) {
      enemy.dead = true;
      state.coins += Math.round(enemy.reward * (1 + buffCount("salvageLoop") * 0.15));
      state.sparks.push({ x: enemy.x, y: enemy.y, r: enemy.size + 8, ttl: 0.35, color: "#ffc75a" });
    }
  }
  state.enemies = state.enemies.filter((enemy) => !enemy.dead && !enemy.escaped);
}

function updateTowers(dt) {
  for (const tower of state.towers) {
    const stats = towerStats(tower);
    tower.cooldown -= dt;
    const enemyTarget = state.enemies
      .filter((enemy) => distance(tower, enemy) <= stats.range)
      .sort((a, b) => b.segment + b.progress - (a.segment + a.progress))[0];
    const propTarget = enemyTarget
      ? null
      : state.props
          .filter((prop) => !prop.dead && distance(tower, prop) <= stats.range)
          .sort((a, b) => a.hp - b.hp || distance(tower, a) - distance(tower, b))[0];
    const target = enemyTarget || propTarget;
    if (target) {
      tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
    }
    if (target && tower.cooldown <= 0) {
      tower.cooldown = stats.fireRate;
      state.bullets.push({
        x: tower.x,
        y: tower.y,
        target,
        speed: tower.type === "rocket" ? 430 : 560,
        stats,
        color: stats.color,
      });
    }
  }
}

function targetStillAlive(target) {
  if (target.kind === "enemy") return state.enemies.includes(target);
  if (target.kind === "prop") return state.props.includes(target) && !target.dead;
  return false;
}

function impactTargets(bullet) {
  const stats = bullet.stats;
  const targets = activeTargets()
    .filter((target) => targetStillAlive(target))
    .filter((target) => {
      if (target === bullet.target) return true;
      return stats.splash > 0 && distance(target, bullet.target) <= stats.splash;
    })
    .sort((a, b) => distance(a, bullet.target) - distance(b, bullet.target));
  return targets.slice(0, Math.max(1, stats.pierce));
}

function updateBullets(dt, now) {
  for (const bullet of state.bullets) {
    if (!targetStillAlive(bullet.target)) {
      bullet.dead = true;
      continue;
    }
    const dx = bullet.target.x - bullet.x;
    const dy = bullet.target.y - bullet.y;
    const len = Math.hypot(dx, dy);
    const step = bullet.speed * dt;
    if (len <= step) {
      bullet.dead = true;
      const targets = impactTargets(bullet);
      for (const target of targets) {
        applyDamage(target, bullet.stats.damage, bullet.stats, now);
      }
      if (bullet.stats.splash > 0) {
        state.sparks.push({
          x: bullet.target.x,
          y: bullet.target.y,
          r: bullet.stats.splash,
          ttl: 0.18,
          color: bullet.color,
        });
      }
    } else {
      bullet.x += (dx / len) * step;
      bullet.y += (dy / len) * step;
    }
  }
  state.bullets = state.bullets.filter((bullet) => !bullet.dead);
  clearDestroyedProps();
}

function clearDestroyedProps() {
  for (const prop of state.props) {
    if (prop.hp <= 0 && !prop.dead) {
      prop.dead = true;
      const reward = Math.round(prop.reward * tacticPropRewardMultiplier());
      state.coins += reward;
      state.runStats.propsCleared += 1;
      state.sparks.push({ x: prop.x, y: prop.y, r: 32, ttl: 0.42, color: "#ffc75a" });
      showToast(`清理道具 +${reward}`);
      if (prop.type === "crystal" && !state.draftOpen) offerDraft("水晶道具奖励");
    }
  }
  state.props = state.props.filter((prop) => !prop.dead);
  evaluateChallenges();
}

function updateSparks(dt) {
  for (const spark of state.sparks) {
    spark.ttl -= dt;
    spark.r += 34 * dt;
  }
  state.sparks = state.sparks.filter((spark) => spark.ttl > 0);
}

function draw() {
  const w = width();
  const h = height();
  ctx.clearRect(0, 0, w, h);
  drawBackdrop(w, h);
  drawPath();
  drawHouse();
  drawProps();
  drawBuildSites();
  drawTowers();
  drawEnemies();
  drawBullets();
  drawSparks();
  drawWaveCountdown();
  if (state.paused) drawBanner("已暂停", "倒计时和战斗已暂停");
  if (state.levelCleared) drawBanner(state.levelIndex >= levels.length - 1 ? "全部通关" : "关卡通过", "点击右侧按钮进入下一关");
  if (state.ended && state.lives <= 0) drawBanner("房屋被攻破", "点击右侧按钮重新挑战");
}

function drawBackdrop(w, h) {
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "#182d28");
  grd.addColorStop(0.52, "#15242b");
  grd.addColorStop(1, "#263126");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#57705f";
  ctx.lineWidth = 1;
  const grid = Math.max(38, Math.min(58, w / 18));
  for (let x = 0; x < w; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPath() {
  const path = level().path.map(point);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#665044";
  ctx.lineWidth = 62;
  ctx.beginPath();
  path.forEach((p, index) => (index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.strokeStyle = "#be8b5b";
  ctx.lineWidth = 48;
  ctx.stroke();
  ctx.strokeStyle = "#f7d68a";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 14]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawHouse() {
  const end = point(level().path[level().path.length - 1]);
  ctx.save();
  ctx.translate(end.x - 12, end.y - 16);
  ctx.fillStyle = "#7b4b2d";
  ctx.strokeStyle = "#2b1d16";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-34, -2);
  ctx.lineTo(0, -34);
  ctx.lineTo(34, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f2d28d";
  roundedRect(-26, -2, 52, 42, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#473024";
  roundedRect(-8, 12, 16, 28, 5);
  ctx.fill();
  ctx.fillStyle = "#62caff";
  roundedRect(-21, 6, 11, 12, 3);
  roundedRect(10, 6, 11, 12, 3);
  ctx.fill();
  ctx.restore();
}

function drawProps() {
  for (const prop of state.props) {
    ctx.save();
    ctx.translate(prop.x, prop.y);
    if (prop.type === "box") drawBoxProp();
    if (prop.type === "stump") drawStumpProp();
    if (prop.type === "crystal") drawCrystalProp();
    ctx.restore();
    drawBar(prop.x - 24, prop.y - 34, 48, 6, prop.hp / prop.maxHp, "#ffc75a");
  }
}

function drawBoxProp() {
  ctx.fillStyle = "#b7793f";
  ctx.strokeStyle = "#5f3a22";
  ctx.lineWidth = 3;
  roundedRect(-23, -20, 46, 40, 7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#f0c071";
  ctx.beginPath();
  ctx.moveTo(-20, -2);
  ctx.lineTo(20, -2);
  ctx.moveTo(0, -19);
  ctx.lineTo(0, 19);
  ctx.stroke();
}

function drawStumpProp() {
  ctx.fillStyle = "#7f5331";
  ctx.strokeStyle = "#3f291b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#c6945e";
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.moveTo(-18, -4);
  ctx.lineTo(14, 7);
  ctx.stroke();
}

function drawCrystalProp() {
  ctx.fillStyle = "#96f0ff";
  ctx.strokeStyle = "#2c7891";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(24, -4);
  ctx.lineTo(12, 25);
  ctx.lineTo(-16, 25);
  ctx.lineTo(-24, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBuildSites() {
  level().build.map(point).forEach((site, index) => {
    const occupied = state.towers.some((tower) => tower.siteIndex === index);
    const selected = state.selectedBuild === index;
    ctx.fillStyle = occupied ? "#25313c" : "#315d65";
    ctx.strokeStyle = selected ? "#ffffff" : occupied ? "#526271" : "#62caff";
    ctx.lineWidth = selected ? 4 : 2;
    roundedRect(site.x - 24, site.y - 24, 48, 48, 8);
    ctx.fill();
    ctx.stroke();
    if (!occupied) {
      ctx.fillStyle = "#62caff";
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(site.x, site.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
}

function drawTowers() {
  for (const tower of state.towers) {
    const stats = towerStats(tower);
    const selected = state.selectedTower === tower;
    if (selected) {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = stats.color;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, stats.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = stats.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, stats.range, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(tower.x, tower.y);
    ctx.rotate(tower.angle);
    drawTowerBody(stats.color, tower.type);
    ctx.restore();
    drawTowerLevel(tower);
    if (canUpgrade(tower)) drawUpgradeBadge(tower);
  }
}

function drawTowerBody(color, type) {
  ctx.fillStyle = "#fbf4dc";
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  if (type === "sun") {
    for (let i = 0; i < 8; i += 1) {
      ctx.rotate(Math.PI / 4);
      roundedRect(15, -4, 14, 8, 4);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "rocket") {
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(32, 0);
    ctx.lineTo(0, 14);
    ctx.closePath();
    ctx.fill();
  } else {
    roundedRect(2, -7, type === "fan" ? 34 : 28, 14, 7);
    ctx.fill();
  }
}

function drawTowerLevel(tower) {
  ctx.fillStyle = "#1d2523";
  roundedRect(tower.x - 24, tower.y + 20, 48, 15, 7);
  ctx.fill();
  if (state.mode === "endless") {
    ctx.fillStyle = "#ffc75a";
    ctx.textAlign = "center";
    ctx.font = "900 10px Inter, sans-serif";
    ctx.fillText(`Lv.${tower.level}`, tower.x, tower.y + 31);
    return;
  }
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < tower.level ? "#ffc75a" : "#526271";
    ctx.beginPath();
    ctx.arc(tower.x - 10 + i * 10, tower.y + 28, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawUpgradeBadge(tower) {
  const cost = upgradeCost(tower);
  const x = tower.x;
  const y = tower.y - 43;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ffc75a";
  roundedRect(x - 34, y - 14, 68, 28, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#151b21";
  ctx.textAlign = "center";
  ctx.font = "900 13px Inter, sans-serif";
  ctx.fillText(`↑ ${cost}`, x, y + 5);
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    const radius = enemy.size;
    const slowed = enemy.slowUntil > performance.now() / 1000;
    ctx.fillStyle = slowed ? "#8fffe0" : enemy.traits.includes("boss") ? "#ff6f91" : "#ff9f6e";
    ctx.strokeStyle = enemy.armor ? "#d9dfe6" : "#111820";
    ctx.lineWidth = enemy.armor ? 5 : 3;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (enemy.shield > 0) {
      ctx.strokeStyle = "#62caff";
      ctx.globalAlpha = 0.68;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#111820";
    ctx.beginPath();
    ctx.arc(enemy.x - radius * 0.35, enemy.y - radius * 0.15, 2.4, 0, Math.PI * 2);
    ctx.arc(enemy.x + radius * 0.35, enemy.y - radius * 0.15, 2.4, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.traits.includes("boss")) {
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "900 11px Inter, sans-serif";
      ctx.fillText("BOSS", enemy.x, enemy.y + radius + 15);
    }
    drawBar(enemy.x - radius, enemy.y - radius - 13, radius * 2, 5, enemy.hp / enemy.maxHp, "#78eba7");
    if (enemy.maxShield > 0) {
      drawBar(enemy.x - radius, enemy.y - radius - 20, radius * 2, 4, enemy.shield / enemy.maxShield, "#62caff");
    }
  }
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.stats.pierce > 1 ? 4 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawSparks() {
  for (const spark of state.sparks) {
    ctx.globalAlpha = Math.max(0, spark.ttl * 2.8);
    ctx.strokeStyle = spark.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawWaveCountdown() {
  if (state.waveActive || state.levelCleared || state.ended || state.paused) return;
  const remaining = Math.max(0, Math.ceil(state.countdown));
  const next = currentWave();
  const label = next?.traits.includes("boss") ? `${remaining} 秒后 Boss` : `${remaining} 秒后自动刷波`;
  const w = width();
  ctx.fillStyle = "rgba(13, 18, 23, 0.7)";
  roundedRect(w / 2 - 92, 18, 184, 46, 8);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "900 18px Inter, sans-serif";
  ctx.fillText(label, w / 2, 48);
}

function drawBanner(title, subtitle) {
  const w = width();
  const h = height();
  ctx.fillStyle = "rgba(8, 12, 18, 0.58)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.max(28, Math.min(54, w / 16))}px Inter, sans-serif`;
  ctx.fillText(title, w / 2, h / 2);
  ctx.font = "800 20px Inter, sans-serif";
  ctx.fillText(subtitle, w / 2, h / 2 + 42);
}

function drawBar(x, y, w, h, ratio, color) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.52)";
  roundedRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundedRect(x, y, w * Math.max(0, Math.min(1, ratio)), h, h / 2);
  ctx.fill();
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function updateUi() {
  ui.playerName.textContent = state.profileName;
  ui.medal.textContent = String(state.medals);
  ui.level.textContent = state.mode === "endless" ? "无尽" : String(state.levelIndex + 1);
  if (state.mode === "endless") {
    const visibleWave = state.waveIndex + (state.waveActive ? 1 : 0);
    ui.wave.textContent = String(visibleWave);
  } else {
    const visibleWave = Math.min(
      level().waves.length,
      state.waveIndex + (state.waveActive ? 1 : 0),
    );
    ui.wave.textContent = `${visibleWave}/${level().waves.length}`;
  }
  ui.life.textContent = String(state.lives);
  ui.coin.textContent = String(state.coins);
  ui.countdown.textContent =
    state.waveActive || state.levelCleared || state.ended
      ? "--"
      : `${Math.max(0, Math.ceil(state.countdown))}s`;
  ui.towerUnlock.textContent =
    state.mode === "endless" ? "全开" : `${unlockedTowerCount()}/${towerOrder.length}`;
  ui.continueBtn.textContent = `继续第 ${state.levelIndex + 1} 关`;
  ui.waveBtn.textContent = waveButtonText();
  ui.waveBtn.disabled = state.waveActive || state.paused || state.draftOpen;
  updateCombatControls();
  renderShop();
  renderChallengeTrack();
  updateLevelMap();
  updateStartLevelMap();
  if (state.buildMenuSite !== null) renderBuildMenu(state.buildMenuSite);
}

function updateCombatControls() {
  const hasBuild = state.selectedBuild !== null;
  const buildOccupied =
    hasBuild && state.towers.some((tower) => tower.siteIndex === state.selectedBuild);
  const selectedTower = state.selectedTower;
  ui.randomBuildBtn.textContent = `随机召唤 ${randomSummonCost()}`;
  ui.randomBuildBtn.disabled =
    state.screen !== "game" ||
    state.paused ||
    state.draftOpen ||
    !hasBuild ||
    buildOccupied ||
    state.coins < randomSummonCost();
  ui.mergeBtn.disabled =
    state.screen !== "game" || state.paused || state.draftOpen || !canMerge(selectedTower);
  ui.redeployBtn.disabled = state.screen !== "game" || state.paused || state.draftOpen || !selectedTower;

  if (selectedTower) {
    const stats = towerStats(selectedTower);
    const mergeReady = canMerge(selectedTower) ? "可合成" : "需同类同级";
    ui.combatNote.textContent = `${towerTypes[selectedTower.type].name} Lv.${selectedTower.level} · ${stats.role} · ${mergeReady}`;
  } else if (hasBuild && !buildOccupied) {
    ui.combatNote.textContent = `空建造点 · 可指定建塔或随机召唤，费用 ${randomSummonCost()}`;
  } else {
    const activeBuffs = Object.values(state.buffs).reduce((sum, count) => sum + count, 0);
    ui.combatNote.textContent = activeBuffs
      ? `已获得 ${activeBuffs} 层局内 Buff`
      : "选择建造点或防御塔后进行操作";
  }
}

function waveButtonText() {
  if (state.ended && state.lives <= 0) return "重新挑战";
  if (state.mode === "endless") {
    if (state.waveActive) return "波次进行中";
    return `立即开波 (${Math.max(0, Math.ceil(state.countdown))}s)`;
  }
  if (state.ended && state.levelIndex >= levels.length - 1) return "重新开始";
  if (state.levelCleared) return state.levelIndex >= levels.length - 1 ? "重新开始" : "下一关";
  if (state.waveActive) return "波次进行中";
  return `立即开波 (${Math.max(0, Math.ceil(state.countdown))}s)`;
}

function updateLevelMap() {
  const key = `${state.mode}|${state.levelIndex}|${state.unlockedLevel}|${state.waveActive}|${state.paused}`;
  if (key === lastLevelMapKey) return;
  lastLevelMapKey = key;
  ui.levelMap.innerHTML = "";
  levels.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "level-node";
    button.textContent = `${index + 1}`;
    button.title = item.name;
    if (state.mode === "campaign" && index === state.levelIndex) button.classList.add("active");
    if (index > state.unlockedLevel) button.classList.add("locked");
    button.disabled = index > state.unlockedLevel || state.waveActive || state.paused;
    button.addEventListener("click", () => selectLevel(index));
    ui.levelMap.append(button);
  });
}

function updateStartLevelMap() {
  const key = `${state.mode}|${state.levelIndex}|${state.unlockedLevel}|${state.screen}`;
  if (key === lastStartLevelMapKey) return;
  lastStartLevelMapKey = key;
  ui.startLevelMap.innerHTML = "";
  levels.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "start-level-card";
    button.innerHTML = `<strong>${index + 1}</strong><span>${item.name}</span>`;
    if (index <= state.unlockedLevel) button.classList.add("available");
    if (index === state.levelIndex) button.classList.add("current");
    if (index > state.unlockedLevel) button.classList.add("locked");
    button.disabled = index > state.unlockedLevel;
    button.addEventListener("click", () => selectLevel(index));
    ui.startLevelMap.append(button);
  });

  const endlessButton = document.createElement("button");
  endlessButton.type = "button";
  endlessButton.className = "start-level-card endless-card available";
  if (state.mode === "endless") endlessButton.classList.add("current");
  endlessButton.innerHTML = "<strong>∞</strong><span>无尽模式</span>";
  endlessButton.addEventListener("click", startEndless);
  ui.startLevelMap.append(endlessButton);
}

function renderBriefing() {
  const mode = state.pendingMode;
  const index = state.pendingLevelIndex;
  const targetLevel = mode === "endless" ? endlessLevel : levels[index];
  const challengeDefs = challengeSet(mode, index);
  ui.briefingTitle.textContent =
    mode === "endless" ? `${targetLevel.name} · 持久战` : `第 ${index + 1} 关：${targetLevel.name}`;

  ui.rulesList.innerHTML = "";
  rules.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    ui.rulesList.append(item);
  });

  ui.challengeList.innerHTML = "";
  challengeDefs.forEach((challenge) => {
    const card = document.createElement("div");
    card.className = "challenge-card";
    card.innerHTML = `<strong>${challenge.name}</strong><span>${challenge.text} · 奖励 ${challenge.reward} 金币 +${challengeMedalReward(challenge)} 星章</span>`;
    ui.challengeList.append(card);
  });

  ui.tacticList.innerHTML = "";
  tacticCards.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tactic-card";
    if (card.id === state.selectedTactic) button.classList.add("active");
    button.innerHTML = `<strong>${card.name}</strong><span>${card.text}</span>`;
    button.addEventListener("click", () => {
      state.selectedTactic = card.id;
      renderBriefing();
    });
    ui.tacticList.append(button);
  });
}

function renderShop() {
  if (!ui.shopGrid) return;
  const key = `${state.medals}|${Object.keys(state.shop).sort().join(",")}`;
  if (renderShop.key === key) return;
  renderShop.key = key;
  ui.shopGrid.innerHTML = "";
  shopItems.forEach((item) => {
    const owned = Boolean(state.shop[item.id]);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shop-item";
    if (owned) button.classList.add("owned");
    button.disabled = owned || state.medals < item.cost;
    button.innerHTML = `
      <span><strong>${item.name}</strong><span>${item.text}</span></span>
      <span class="shop-item__cost">${owned ? "已拥有" : `${item.cost} 星章`}</span>
    `;
    button.addEventListener("click", () => buyShopItem(item.id));
    ui.shopGrid.append(button);
  });
}

function renderChallengeTrack() {
  if (!ui.challengeTrack) return;
  if (state.screen !== "game" || state.challengeDefs.length === 0) {
    ui.challengeTrack.innerHTML = "";
    lastChallengeTrackKey = "";
    return;
  }
  const key = state.challengeDefs
    .map((challenge) => {
      const current = challengeState(challenge);
      return `${challenge.id}:${challengeProgress(challenge)}/${challengeTarget(challenge)}:${current?.complete ? 1 : 0}`;
    })
    .join("|");
  if (key === lastChallengeTrackKey) return;
  lastChallengeTrackKey = key;
  ui.challengeTrack.innerHTML = "";
  state.challengeDefs.forEach((challenge) => {
    const current = challengeState(challenge);
    const target = challengeTarget(challenge);
    const progress = challengeProgress(challenge);
    const chip = document.createElement("div");
    chip.className = "challenge-chip";
    if (current?.complete) chip.classList.add("complete");
    const status = current?.complete ? "完成" : `${progress}/${target}`;
    chip.innerHTML = `<strong>${challenge.name}</strong><span>${status} · +${challenge.reward} 金币 +${challengeMedalReward(challenge)} 星章</span>`;
    ui.challengeTrack.append(chip);
  });
}

function renderDraft(reason) {
  ui.draftPanel.innerHTML = "";
  const box = document.createElement("div");
  box.className = "draft-panel__box";
  const active = Object.entries(state.buffs)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const card = draftCards.find((item) => item.id === id);
      return `${card?.name || id} Lv.${count}`;
    })
    .join(" · ");
  box.innerHTML = `
    <div>
      <p>${reason}</p>
      <h2>选择一项局内 Buff</h2>
      <p>${active || "当前尚未获得被动加成"}</p>
    </div>
  `;
  const list = document.createElement("div");
  list.className = "draft-options";
  state.draftChoices.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "draft-card";
    button.innerHTML = `<strong>${card.name}</strong><span>${card.text}</span><span>当前 Lv.${buffCount(card.id)}</span>`;
    button.addEventListener("click", () => chooseDraft(card.id));
    list.append(button);
  });
  box.append(list);
  ui.draftPanel.append(box);
  ui.draftPanel.classList.remove("hide");
}

function renderBuildMenu(siteIndex) {
  if (state.screen !== "game") return;
  const site = point(level().build[siteIndex]);
  const key = `${state.mode}|${siteIndex}|${state.coins}|${state.unlockedLevel}|${randomSummonCost()}|${Math.round(width())}|${Math.round(height())}`;
  if (!ui.buildMenu.classList.contains("hide") && key === lastBuildMenuKey) return;
  lastBuildMenuKey = key;
  ui.buildMenu.innerHTML = "";
  const randomButton = document.createElement("button");
  randomButton.type = "button";
  randomButton.className = "build-option";
  randomButton.disabled = state.coins < randomSummonCost();
  randomButton.innerHTML = `
    <span class="tower-dot random"></span>
    <span><strong>随机召唤</strong><small>随机获得已解锁基础塔</small></span>
    <span class="build-cost">${randomSummonCost()}</span>
  `;
  randomButton.addEventListener("click", randomSummonAtSelectedSite);
  ui.buildMenu.append(randomButton);

  const available = unlockedTowerPool();
  available.forEach((key) => {
    const type = towerTypes[key];
    const cost = tacticTowerCost(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "build-option";
    button.disabled = state.coins < cost;
    button.innerHTML = `
      <span class="tower-dot ${key}"></span>
      <span><strong>${type.name}</strong><small>${type.role}</small></span>
      <span class="build-cost">${cost}</span>
    `;
    button.addEventListener("click", () => buildAt(siteIndex, key));
    ui.buildMenu.append(button);
  });

  ui.buildMenu.classList.remove("hide");
  const surfaceWidth = width();
  const surfaceHeight = height();
  const menuWidth = ui.buildMenu.offsetWidth || 230;
  const menuHeight = ui.buildMenu.offsetHeight || 180;
  const left = Math.max(12, Math.min(surfaceWidth - menuWidth - 12, site.x + 34));
  const top = Math.max(12, Math.min(surfaceHeight - menuHeight - 12, site.y - 26));
  ui.buildMenu.style.left = `${left}px`;
  ui.buildMenu.style.top = `${top}px`;
}

function showBuildMenu(siteIndex) {
  state.buildMenuSite = siteIndex;
  state.selectedBuild = siteIndex;
  state.selectedTower = null;
  renderBuildMenu(siteIndex);
  updateUi();
}

function hideBuildMenu() {
  state.buildMenuSite = null;
  state.selectedBuild = null;
  lastBuildMenuKey = "";
  ui.buildMenu.classList.add("hide");
}

function upgradeBadgeHit(pos, tower) {
  return canUpgrade(tower) && Math.abs(pos.x - tower.x) <= 36 && Math.abs(pos.y - (tower.y - 43)) <= 17;
}

function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

canvas.addEventListener("pointerdown", (event) => {
  if (state.screen !== "game" || state.paused || state.draftOpen) return;
  const pos = pointerPos(event);
  const upgradeTarget = [...state.towers].reverse().find((tower) => upgradeBadgeHit(pos, tower));
  if (upgradeTarget) {
    hideBuildMenu();
    upgradeTower(upgradeTarget);
    return;
  }
  const tower = [...state.towers].reverse().find((item) => distance(pos, item) <= 32);
  if (tower) {
    state.selectedTower = tower;
    hideBuildMenu();
    updateUi();
    return;
  }
  const siteIndex = level()
    .build.map(point)
    .findIndex((site) => Math.abs(pos.x - site.x) <= 28 && Math.abs(pos.y - site.y) <= 28);
  if (siteIndex !== -1) {
    const occupied = state.towers.some((towerItem) => towerItem.siteIndex === siteIndex);
    if (occupied) return;
    showBuildMenu(siteIndex);
    return;
  }
  hideBuildMenu();
  state.selectedTower = null;
  updateUi();
});

ui.waveBtn.addEventListener("click", startWave);
ui.randomBuildBtn.addEventListener("click", randomSummonAtSelectedSite);
ui.mergeBtn.addEventListener("click", mergeSelectedTower);
ui.redeployBtn.addEventListener("click", redeploySelectedTower);
ui.restartBtn.addEventListener("click", restartCurrentRun);
ui.levelsBtn.addEventListener("click", () => setScreen("levels"));
ui.continueBtn.addEventListener("click", () => selectLevel(state.levelIndex));
ui.registerBtn.addEventListener("click", () => switchProfile(ui.playerInput.value));
ui.playerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") switchProfile(ui.playerInput.value);
});
ui.briefingCloseBtn.addEventListener("click", closeBriefing);
ui.startBriefingBtn.addEventListener("click", startBriefedRun);
ui.pauseBtn.addEventListener("click", () => setPaused(!state.paused));
ui.resumeBtn.addEventListener("click", () => setPaused(false));
ui.pauseRestartBtn.addEventListener("click", restartCurrentRun);
ui.backToLevelsBtn.addEventListener("click", () => setScreen("levels"));

function queueResize() {
  resize();
  requestAnimationFrame(resize);
  clearTimeout(queueResize.timer);
  queueResize.timer = setTimeout(resize, 260);
}

window.addEventListener("resize", queueResize);
window.addEventListener("orientationchange", queueResize);
window.visualViewport?.addEventListener("resize", queueResize);

function loop(timestamp) {
  const now = timestamp / 1000;
  const dt = Math.min(0.04, now - (state.lastTime || now));
  state.lastTime = now;
  update(dt, now);
  draw();
  requestAnimationFrame(loop);
}

resize();
loadSave();
resetLevel(state.levelIndex);
setScreen("levels");
requestAnimationFrame(loop);
