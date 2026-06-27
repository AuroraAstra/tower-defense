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
  intelligenceList: document.querySelector("#intelligenceList"),
  rulesList: document.querySelector("#rulesList"),
  challengeList: document.querySelector("#challengeList"),
  tacticList: document.querySelector("#tacticList"),
  startBriefingBtn: document.querySelector("#startBriefingBtn"),
  gameSurface: document.querySelector(".game-surface"),
  storyOverlay: document.querySelector("#storyOverlay"),
  storyOverlayText: document.querySelector("#storyOverlayText"),
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
  towerDetail: document.querySelector("#towerDetail"),
  buffTrack: document.querySelector("#buffTrack"),
  exportSaveBtn: document.querySelector("#exportSaveBtn"),
  importSaveBtn: document.querySelector("#importSaveBtn"),
  importSaveInput: document.querySelector("#importSaveInput"),
  soundBtn: document.querySelector("#soundBtn"),
  debugBtn: document.querySelector("#debugBtn"),
  debugPanel: document.querySelector("#debugPanel"),
  debugCloseBtn: document.querySelector("#debugCloseBtn"),
  debugInfo: document.querySelector("#debugInfo"),
  debugCoinsBtn: document.querySelector("#debugCoinsBtn"),
  debugClearBtn: document.querySelector("#debugClearBtn"),
  debugUnlockBtn: document.querySelector("#debugUnlockBtn"),
  debugBossBtn: document.querySelector("#debugBossBtn"),
  mobileTabs: document.querySelectorAll(".mobile-tabs button"),
  hudPages: document.querySelectorAll(".hud-page"),
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
  draftsTaken: 0,
  draftOpen: false,
  activeHudTab: "stats",
  soundEnabled: true,
  audioReady: false,
  debugUnlocked: false,
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
let lastTowerDetailKey = "";
let lastBuffTrackKey = "";

const traitInfo = {
  swift: {
    name: "高速",
    text: "移速更快，弯道覆盖和减速更关键。",
    recommend: "雪花塔、风扇塔",
  },
  shield: {
    name: "护盾",
    text: "先消耗蓝色护盾，护盾倍率高的塔更有效。",
    recommend: "雪花塔、火箭塔",
  },
  armor: {
    name: "护甲",
    text: "每次受击会抵消部分伤害，需要破甲压低减免。",
    recommend: "风扇塔、火箭塔、破甲弹芯",
  },
  regen: {
    name: "回血",
    text: "持续恢复生命，适合集中火力快速击杀。",
    recommend: "瓶子炮、火箭塔",
  },
  boss: {
    name: "Boss",
    text: "生命、体型和进屋伤害更高，会鼓舞小怪并震慑附近防御塔。",
    recommend: "高等级瓶子炮、火箭塔",
  },
};

const sfx = {
  context: null,
  master: null,
};

const VFX = {
  particles: [],
  shake: 0,
};

function debugEnabled() {
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "1";
}

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

function currentSavePayload() {
  return {
    app: "homewatch-tower-defense",
    version: GAME_VERSION,
    exportedAt: new Date().toISOString(),
    activeProfile: state.profileName,
    profiles: migrateLegacySave(loadProfiles()),
  };
}

function exportSave() {
  saveProgress();
  const payload = currentSavePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `homewatch-save-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("存档已导出");
}

function normalizeImportedProfiles(payload) {
  const source = payload?.profiles || payload;
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const profiles = {};
  Object.values(source).forEach((profile) => {
    if (!profile || typeof profile !== "object") return;
    const name = normalizeProfileName(profile.name);
    profiles[name] = {
      ...defaultProfile(name),
      unlockedLevel: clampLevelIndex(profile.unlockedLevel),
      levelIndex: Math.min(clampLevelIndex(profile.levelIndex), clampLevelIndex(profile.unlockedLevel)),
      medals: Math.max(0, Number(profile.medals) || 0),
      shop: profile.shop && typeof profile.shop === "object" ? profile.shop : {},
    };
  });
  return Object.keys(profiles).length ? profiles : null;
}

function importSaveFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(String(reader.result || "{}"));
      const profiles = normalizeImportedProfiles(payload);
      if (!profiles) throw new Error("Invalid save");
      const active = normalizeProfileName(payload.activeProfile || Object.keys(profiles)[0]);
      saveProfiles(profiles);
      localStorage.setItem(ACTIVE_PROFILE_KEY, profiles[active] ? active : Object.keys(profiles)[0]);
      loadSave();
      closeBriefing();
      resetLevel(state.levelIndex);
      setScreen("levels");
      showToast("存档已导入");
    } catch (error) {
      showToast("存档文件无效");
    } finally {
      ui.importSaveInput.value = "";
    }
  });
  reader.readAsText(file);
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

function fmtNumber(value, digits = 0) {
  return Number(value).toFixed(digits).replace(/\.0+$/, "");
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

function pushLog(text) {
  state.systemLog = text;
  if (ui.combatNote && !state.selectedTower && state.selectedBuild === null) {
    ui.combatNote.textContent = text;
  }
  showStoryOverlay(text);
}

function storyTag(text) {
  const match = String(text).match(/^\[([^\]]+)\]/);
  return match ? match[1] : "NEURO-GRID";
}

function storyBody(text) {
  return String(text).replace(/^\[[^\]]+\]\s*/, "");
}

function showStoryOverlay(text) {
  if (!ui.storyOverlay || !ui.storyOverlayText) return;
  const tag = ui.storyOverlay.querySelector(".story-overlay__tag");
  if (tag) tag.textContent = storyTag(text);
  ui.storyOverlayText.textContent = storyBody(text);
  ui.storyOverlay.classList.remove("hide");
  ui.storyOverlay.style.animation = "none";
  ui.storyOverlay.offsetHeight;
  ui.storyOverlay.style.animation = "";
  clearTimeout(showStoryOverlay.timer);
  showStoryOverlay.timer = setTimeout(() => ui.storyOverlay.classList.add("hide"), 3400);
}

function triggerStory(levelNumber) {
  if (state.mode === "endless") {
    pushLog("[NEURO-GRID] 无尽协议接管火力网");
    return;
  }
  pushLog(`[NEURO-GRID] 第 ${levelNumber} 层防线接入`);
  if (levelNumber === 1) pushLog("[NEURO-GRID] 系统初始化完成");
  if (levelNumber === 3) pushLog("[WARNING] 神经污染扩散");
  if (levelNumber === 6) pushLog("[CRITICAL] 系统开始自我重组");
  if (levelNumber === 10) pushLog("[ERROR] 你正在被系统学习");
  if (levelNumber === 12) pushLog("[WARNING] 记忆分区出现重复玩家指纹");
  if (levelNumber === 15) pushLog("[CRITICAL] 防御塔开始预测你的建造顺序");
  if (levelNumber === 18) pushLog("[ERROR] 家园核心确认：玩家即为防线意识");
  if (levelNumber === 20) pushLog("[NEURO-GRID] 终层协议启动，系统等待与你合并");
}

function addShake(intensity) {
  VFX.shake = Math.max(VFX.shake, intensity);
}

function vfxTypeForStats(stats) {
  if (stats.name === towerTypes.snow.name) return "ice";
  if (stats.name === towerTypes.sun.name) return "heat";
  if (stats.name === towerTypes.rocket.name) return "corrupt";
  return "neuro";
}

function spawnParticle(x, y, color, scale = 1) {
  const angle = Math.random() * Math.PI * 2;
  const speed = (0.8 + Math.random() * 2.8) * scale;
  VFX.particles.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0.55 + Math.random() * 0.45,
    size: 1.5 + Math.random() * 2.7 * scale,
    color,
  });
}

function triggerVFX(x, y, type = "neuro", burst = 14) {
  const colors = {
    neuro: "#4ef0b3",
    ice: "#4cc9ff",
    heat: "#ffb703",
    corrupt: "#ff3d5a",
  };
  const color = colors[type] || colors.neuro;
  for (let i = 0; i < burst; i += 1) {
    spawnParticle(x, y, color, type === "corrupt" ? 1.25 : 1);
  }
  addShake(type === "corrupt" ? 7 : 4);
}

function triggerHitVFX(x, y, type = "neuro") {
  const colors = {
    neuro: "#4ef0b3",
    ice: "#4cc9ff",
    heat: "#ffb703",
    corrupt: "#ff3d5a",
  };
  for (let i = 0; i < 4; i += 1) spawnParticle(x, y, colors[type] || colors.neuro, 0.55);
  if (type === "corrupt") addShake(1.5);
}

function updateParticles(dt) {
  for (const particle of VFX.particles) {
    particle.x += particle.vx * 58 * dt;
    particle.y += particle.vy * 58 * dt;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.life -= dt * 1.65;
  }
  VFX.particles = VFX.particles.filter((particle) => particle.life > 0);
  VFX.shake = Math.max(0, VFX.shake - dt * 22);
}

function applyShake(ctx, intensity) {
  if (!intensity) return;
  ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
}

function ensureAudio() {
  if (!state.soundEnabled) return null;
  if (!sfx.context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    sfx.context = new AudioContext();
    sfx.master = sfx.context.createGain();
    sfx.master.gain.value = 0.08;
    sfx.master.connect(sfx.context.destination);
  }
  if (sfx.context.state === "suspended") sfx.context.resume();
  state.audioReady = true;
  return sfx.context;
}

function playTone(freq, duration = 0.08, type = "sine", gain = 1, slide = 1) {
  const audio = ensureAudio();
  if (!audio || !sfx.master) return;
  const osc = audio.createOscillator();
  const envelope = audio.createGain();
  const now = audio.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq * slide), now + duration);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.7 * gain, now + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(envelope);
  envelope.connect(sfx.master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playSound(name) {
  if (!state.soundEnabled) return;
  const patterns = {
    build: () => {
      playTone(520, 0.07, "triangle", 0.9, 1.24);
      setTimeout(() => playTone(720, 0.06, "triangle", 0.7, 1.1), 45);
    },
    shoot: () => playTone(760, 0.035, "square", 0.3, 0.78),
    hit: () => playTone(180, 0.045, "sawtooth", 0.28, 0.62),
    wave: () => playTone(240, 0.16, "sawtooth", 1, 1.85),
    boss: () => {
      playTone(92, 0.22, "sawtooth", 1.1, 0.55);
      setTimeout(() => playTone(138, 0.2, "square", 0.75, 0.7), 70);
    },
    clear: () => {
      playTone(440, 0.08, "triangle", 0.8, 1.2);
      setTimeout(() => playTone(660, 0.1, "triangle", 0.8, 1.28), 75);
      setTimeout(() => playTone(880, 0.12, "triangle", 0.75, 1.18), 150);
    },
    fail: () => playTone(150, 0.24, "sawtooth", 0.9, 0.48),
    reward: () => playTone(980, 0.09, "triangle", 0.65, 1.35),
    ui: () => playTone(360, 0.045, "triangle", 0.35, 1.12),
  };
  patterns[name]?.();
}

function setSoundEnabled(enabled) {
  state.soundEnabled = enabled;
  if (!enabled && sfx.context?.state === "running") sfx.context.suspend();
  ui.soundBtn.textContent = `音效 ${enabled ? "开" : "关"}`;
  localStorage.setItem("homewatch_sound_enabled_v1", enabled ? "1" : "0");
}

function setHudTab(tab) {
  state.activeHudTab = tab;
  ui.mobileTabs.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  ui.hudPages.forEach((page) => page.classList.toggle("active", page.dataset.hudPage === tab));
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
  const pool = unlockedTowerPool();
  const averageCost =
    pool.reduce((sum, type) => sum + tacticTowerCost(type), 0) / Math.max(1, pool.length);
  const randomDiscount = state.mode === "endless" ? 0.72 : 0.68;
  return Math.max(22, Math.round(averageCost * randomDiscount) - buffCount("rapidFoundry") * 8);
}

function unlockedTowerPool() {
  return towerOrder.filter(isTowerUnlocked);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function maxTowerLevel() {
  if (state.mode === "endless") return Infinity;
  if (state.levelIndex >= 15) return 7;
  if (state.levelIndex >= 10) return 6;
  if (state.levelIndex >= 5) return 4;
  return 3;
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
  VFX.particles = [];
  VFX.shake = 0;
  state.props = makeProps();
  state.draftChoices = [];
  state.draftsTaken = 0;
  state.draftOpen = false;
  state.buffs = {};
  ui.draftPanel.classList.add("hide");
  resetRunStats();
  createRunChallenges();
  hideBuildMenu();
  triggerStory(state.mode === "campaign" ? state.levelIndex + 1 : 0);
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
  const boss = wave.traits.includes("boss");
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
    visualSeed: Math.random(),
    slowUntil: 0,
    slowFactor: 1,
    bossPulse: boss ? 4 : 0,
    bossAuraUntil: 0,
    kind: "enemy",
  });
  if (boss) playSound("boss");
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
  pushLog(
    wave.traits.includes("boss")
      ? "[CRITICAL] 大型污染源进入能量路径"
      : `[NEURO-GRID] ${label} 污染体接近`,
  );
  showToast(`${label}${wave.traits.includes("boss") ? " Boss 来袭" : "开始"}`);
  playSound(wave.traits.includes("boss") ? "boss" : "wave");
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
    pushLog("[NEURO-GRID] 二十级防线闭环，系统与你完成同步");
    showToast("20 关全部通关");
    playSound("clear");
  } else if (state.unlockedLevel > previousUnlocked) {
    const newlyUnlockedTower = towerOrder.find(
      (key) => towerTypes[key].unlockLevel === state.unlockedLevel + 1,
    );
    showToast(
      newlyUnlockedTower
        ? `解锁第 ${state.levelIndex + 2} 关和 ${towerTypes[newlyUnlockedTower].name}`
        : `解锁第 ${state.levelIndex + 2} 关`,
    );
    playSound("clear");
  } else {
    pushLog("[NEURO-GRID] 污染波形已被压制");
    showToast("关卡通过");
    playSound("clear");
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
      offerDraft(`第 ${state.waveIndex} 波奖励`, "wave");
      updateUi();
    } else {
      state.coins += 24 + state.levelIndex * 4 + state.waveIndex * 3;
      if (state.waveIndex >= level().waves.length) {
        clearCurrentLevel();
      } else {
        state.countdown = autoWaveDelay();
        showToast(`${autoWaveDelay()} 秒后自动刷下一波`);
        offerDraft(`第 ${state.waveIndex} 波奖励`, "wave");
        updateUi();
      }
    }
  }
}

function maxDraftOffers() {
  return state.mode === "endless" ? Infinity : 2;
}

function canOfferDraft(source = "wave") {
  if (state.ended || state.levelCleared || state.draftOpen) return false;
  if (state.draftsTaken >= maxDraftOffers()) return false;
  if (source === "crystal") return state.draftsTaken === 0;
  if (state.mode === "endless") return state.waveIndex > 0 && state.waveIndex % 3 === 0;
  return state.waveIndex > 0 && state.waveIndex % 2 === 0;
}

function offerDraft(reason = "战术成长", source = "wave") {
  if (!canOfferDraft(source)) return;
  if (state.ended || state.levelCleared || state.draftOpen) return;
  const choices = createDraftChoices();
  if (choices.length === 0) return;
  state.draftChoices = choices;
  state.draftOpen = true;
  renderDraft(reason);
}

function chooseDraft(id) {
  const card = state.draftChoices.find((item) => item.id === id);
  if (!card) return;
  state.buffs = { ...state.buffs, [id]: buffCount(id) + 1 };
  state.draftsTaken += 1;
  state.draftChoices = [];
  state.draftOpen = false;
  ui.draftPanel.classList.add("hide");
  showToast(`${card.name} Lv.${buffCount(id)}`);
  playSound("reward");
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
  playSound("build");
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
  playSound("build");
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
  playSound("reward");
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
  playSound("build");
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
  return Math.floor(towerTypes[tower.type].cost * (0.62 + tower.level * 0.46));
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
  triggerHitVFX(target.x, target.y, target.kind === "prop" ? "heat" : vfxTypeForStats(stats));
  playSound("hit");
}

function triggerBossPulse(boss, now) {
  boss.bossPulse = 4.8;
  boss.bossAuraUntil = now + 0.55;
  let inspired = 0;
  for (const enemy of state.enemies) {
    if (enemy === boss || enemy.dead || enemy.escaped || distance(enemy, boss) > 150) continue;
    enemy.inspiredUntil = now + 2.2;
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.08);
    inspired += 1;
  }
  for (const tower of state.towers) {
    if (distance(tower, boss) > 160) continue;
    tower.stunnedUntil = Math.max(tower.stunnedUntil || 0, now + 0.85);
    tower.cooldown = Math.max(tower.cooldown, 0.55);
  }
  state.sparks.push({ x: boss.x, y: boss.y, r: 82, ttl: 0.5, color: "#ff6f91" });
  triggerVFX(boss.x, boss.y, "corrupt", 22);
  playSound("boss");
  showToast(inspired ? `Boss 鼓舞 ${inspired} 个小怪` : "Boss 震慑火力网");
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
  if (state.waveIndex > 0 && !state.waveActive && canAutoWave && state.buildMenuSite === null) {
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
  updateParticles(dt);
  finishWaveIfDone();
  updateUi();
}

function updateEnemies(dt, now) {
  const path = level().path.map(point);
  for (const enemy of state.enemies) {
    if (enemy.traits.includes("boss")) {
      enemy.bossPulse -= dt;
      if (enemy.bossPulse <= 0) triggerBossPulse(enemy, now);
    }
    if (enemy.regen > 0 && enemy.hp > 0) {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regen * dt);
    }
    const inspiredSpeed = enemy.inspiredUntil > now ? 1.22 : 1;
    const speed = enemy.speed * inspiredSpeed * (enemy.slowUntil > now ? enemy.slowFactor : 1);
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
      triggerVFX(end.x, end.y, "corrupt", enemy.traits.includes("boss") ? 22 : 12);
      pushLog("[WARNING] 污染体穿透防线，家园核心受损");
      if (state.lives <= 0) {
        state.lives = 0;
        state.ended = true;
        state.waveActive = false;
        pushLog("[ERROR] 家园核心离线，防御人格等待重启");
        showToast("房屋被攻破");
        playSound("fail");
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
      triggerVFX(enemy.x, enemy.y, enemy.traits.includes("boss") ? "corrupt" : "neuro", enemy.traits.includes("boss") ? 28 : 14);
      if (enemy.traits.includes("boss")) pushLog("[NEURO-GRID] 大型污染源已裂解");
      playSound(enemy.traits.includes("boss") ? "clear" : "reward");
    }
  }
  state.enemies = state.enemies.filter((enemy) => !enemy.dead && !enemy.escaped);
}

function updateTowers(dt, now) {
  for (const tower of state.towers) {
    if ((tower.stunnedUntil || 0) > now) continue;
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
      playSound("shoot");
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
      triggerVFX(prop.x, prop.y, prop.type === "crystal" ? "ice" : "heat", prop.type === "crystal" ? 20 : 14);
      showToast(`清理道具 +${reward}`);
      playSound("reward");
      if (prop.type === "crystal" && !state.draftOpen) offerDraft("水晶道具奖励", "crystal");
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
  ctx.save();
  applyShake(ctx, VFX.shake);
  drawBackdrop(w, h);
  drawNeuralBackground(ctx, performance.now());
  drawEnergyPath(ctx, level().path.map(point), performance.now());
  drawHouse();
  drawProps();
  drawBuildSites();
  drawTowers();
  drawEnemies();
  drawBullets();
  drawSparks();
  drawParticles(ctx);
  drawWaveCountdown();
  ctx.restore();
  if (state.paused) drawBanner("已暂停", "倒计时和战斗已暂停");
  if (state.levelCleared) {
    drawBanner(
      state.levelIndex >= levels.length - 1 ? "全部通关" : "关卡通过",
      state.levelIndex >= levels.length - 1 ? "点击重新开始按钮再来一局" : "点击“下一关”继续推进防线",
    );
  }
  if (state.ended && state.lives <= 0) drawBanner("房屋被攻破", "点击“重新挑战”再守一次");
}

function drawBackdrop(w, h) {
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "#050d0b");
  grd.addColorStop(0.52, "#0a1c17");
  grd.addColorStop(1, "#091416");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#4ef0b3";
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
  drawEnergyPath(ctx, level().path.map(point), performance.now());
}

function drawNeuralBackground(ctx, t) {
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = "#4ef0b3";
  ctx.lineWidth = 1.25;

  for (let i = 0; i < 7; i += 1) {
    const y = 80 + i * 110;
    ctx.beginPath();
    ctx.moveTo(0, y);

    for (let x = 0; x < ctx.canvas.width; x += 25) {
      const wave =
        Math.sin(x * 0.015 + t * 0.002 + i) * 14 +
        Math.cos(x * 0.01 + t * 0.001) * 6;
      ctx.lineTo(x, y + wave);
    }

    ctx.stroke();
  }

  ctx.restore();
}

function drawEnergyPath(ctx, path, t) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(78, 240, 179, 0.38)";
  ctx.shadowBlur = 26;

  ctx.strokeStyle = "rgba(78, 240, 179, 0.16)";
  ctx.lineWidth = 66;
  ctx.beginPath();
  path.forEach((p, index) => (index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();

  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(76, 201, 255, 0.2)";
  ctx.lineWidth = 48;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(78, 240, 179, 0.78)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 14]);
  ctx.lineDashOffset = -t * 0.035;
  ctx.stroke();
  ctx.setLineDash([]);

  path.forEach((p, index) => {
    const pulse = Math.sin(t * 0.003 + index) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(78, 240, 179, ${0.3 + pulse * 0.6})`;
    ctx.shadowColor = "#4ef0b3";
    ctx.shadowBlur = 10 + pulse * 12;
    ctx.arc(p.x, p.y, 3 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
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
    if ((tower.stunnedUntil || 0) > performance.now() / 1000) {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#ff6f91";
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "900 12px Inter, sans-serif";
      ctx.fillText("震慑", tower.x, tower.y - 32);
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
  const now = performance.now() / 1000;
  for (const enemy of state.enemies) {
    const radius = enemy.size;
    const seed = enemy.visualSeed ?? 0;
    const slowed = enemy.slowUntil > now;
    const bob = Math.sin(now * 4.8 + seed * 9) * Math.min(2.2, radius * 0.1);
    const squish = 1 + Math.sin(now * 8.5 + seed * 12) * 0.055;
    const x = enemy.x;
    const y = enemy.y + bob;

    ctx.save();
    ctx.translate(x, y);
    drawEnemyShadow(radius);
    ctx.scale(1 / squish, squish);
    drawEnemyBody(enemy, radius, slowed);
    if (enemy.traits.includes("swift")) drawEnemyWinglets(radius, now + seed * 10);
    if (enemy.traits.includes("regen")) drawEnemySprout(radius, now + seed * 8);
    if (enemy.armor) drawEnemyArmor(radius);
    if (enemy.shield > 0) drawEnemyShield(radius, enemy.shield / enemy.maxShield, now + seed * 4);
    if (enemy.traits.includes("boss")) drawEnemyCrown(radius, now + seed * 5);
    drawEnemyFace(enemy, radius, slowed, now + seed * 6);
    ctx.restore();

    if (enemy.traits.includes("boss")) {
      if (enemy.bossAuraUntil > now) {
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = "#ff6f91";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.textAlign = "center";
      ctx.font = "900 11px Inter, sans-serif";
      ctx.fillText("BOSS", x, y + radius + 16);
    }
    if (enemy.inspiredUntil > now && !enemy.traits.includes("boss")) {
      ctx.fillStyle = "#ffd15a";
      ctx.textAlign = "center";
      ctx.font = "900 10px Inter, sans-serif";
      ctx.fillText("鼓舞", x, y + radius + 14);
    }
    drawBar(x - radius, y - radius - 13, radius * 2, 5, enemy.hp / enemy.maxHp, "#78eba7");
    if (enemy.maxShield > 0) {
      drawBar(x - radius, y - radius - 20, radius * 2, 4, enemy.shield / enemy.maxShield, "#62caff");
    }
  }
}

function enemyPalette(enemy, slowed) {
  if (slowed) {
    return {
      body: "#183f4b",
      shade: "#07151a",
      outline: "#9df7ff",
      core: "#4cc9ff",
      accent: "#62caff",
    };
  }
  if (enemy.traits.includes("boss")) {
    return {
      body: "#32101d",
      shade: "#090609",
      outline: "#ff3d5a",
      core: "#ff3d5a",
      accent: "#ffb703",
    };
  }
  if (enemy.traits.includes("regen")) {
    return {
      body: "#143525",
      shade: "#06110c",
      outline: "#4ef0b3",
      core: "#4ef0b3",
      accent: "#8cff6d",
    };
  }
  if (enemy.traits.includes("swift")) {
    return {
      body: "#322511",
      shade: "#090706",
      outline: "#ffb703",
      core: "#ffb703",
      accent: "#ff3d5a",
    };
  }
  if (enemy.shield > 0) {
    return {
      body: "#122d3b",
      shade: "#060c12",
      outline: "#4cc9ff",
      core: "#4cc9ff",
      accent: "#4ef0b3",
    };
  }
  return {
    body: "#22151b",
    shade: "#07070a",
    outline: "#ff3d5a",
    core: "#4ef0b3",
    accent: "#86bfb0",
  };
}

function drawEnemyShadow(radius) {
  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = "#03070b";
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.78, radius * 1.02, radius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemyBody(enemy, radius, slowed) {
  const palette = enemyPalette(enemy, slowed);
  const boss = enemy.traits.includes("boss");
  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.28,
    -radius * 0.34,
    radius * 0.08,
    radius * 0.16,
    radius * 0.16,
    radius * 1.3,
  );
  bodyGradient.addColorStop(0, palette.core);
  bodyGradient.addColorStop(0.2, palette.body);
  bodyGradient.addColorStop(1, palette.shade);

  ctx.shadowColor = palette.outline;
  ctx.shadowBlur = boss ? 20 : 10;
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = boss ? 4 : 2.5;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.12, -radius * (boss ? 1.2 : 0.98));
  ctx.bezierCurveTo(radius * 0.62, -radius * 1.08, radius * 1.08, -radius * 0.52, radius * 0.88, radius * 0.08);
  ctx.bezierCurveTo(radius * 1.12, radius * 0.56, radius * 0.36, radius * 1.02, -radius * 0.08, radius * 0.86);
  ctx.bezierCurveTo(-radius * 0.62, radius * 1.12, -radius * 1.08, radius * 0.44, -radius * 0.86, -radius * 0.14);
  ctx.bezierCurveTo(-radius * 1.03, -radius * 0.68, -radius * 0.52, -radius * 1.04, -radius * 0.12, -radius * (boss ? 1.2 : 0.98));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawCorruptionTendrils(radius, palette, boss);
  drawCorruptionCracks(radius, palette, enemy.visualSeed ?? 0);
  drawCorruptionCore(radius, palette, boss);
}

function drawCorruptionTendrils(radius, palette, boss = false) {
  ctx.save();
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = Math.max(1.6, radius * 0.09);
  ctx.lineCap = "round";
  ctx.globalAlpha = boss ? 0.82 : 0.64;
  const count = boss ? 8 : 5;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + radius * 0.03;
    const start = radius * (0.52 + (i % 2) * 0.12);
    const end = radius * (boss ? 1.36 : 1.08);
    const curl = Math.sin(performance.now() * 0.004 + i) * radius * 0.14;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * start, Math.sin(angle) * start);
    ctx.quadraticCurveTo(
      Math.cos(angle + 0.35) * (start + end) * 0.5 + curl,
      Math.sin(angle + 0.35) * (start + end) * 0.5,
      Math.cos(angle) * end,
      Math.sin(angle) * end,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawCorruptionCracks(radius, palette, seed = 0) {
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = Math.max(1, radius * 0.055);
  ctx.globalAlpha = 0.72;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i += 1) {
    const angle = seed * 6 + i * 1.55;
    const x = Math.cos(angle) * radius * 0.18;
    const y = Math.sin(angle) * radius * 0.18;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(Math.cos(angle + 0.45) * radius * 0.62, Math.sin(angle + 0.45) * radius * 0.58);
    ctx.lineTo(Math.cos(angle + 0.2) * radius * 0.82, Math.sin(angle + 0.2) * radius * 0.76);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCorruptionCore(radius, palette, boss = false) {
  ctx.save();
  const pulse = 0.72 + Math.sin(performance.now() * 0.006) * 0.18;
  ctx.shadowColor = palette.core;
  ctx.shadowBlur = boss ? 26 : 16;
  ctx.fillStyle = palette.core;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(0, -radius * 0.08, radius * (boss ? 0.34 : 0.28), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#050d0b";
  ctx.beginPath();
  ctx.arc(radius * 0.05, -radius * 0.08, radius * (boss ? 0.16 : 0.12), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemyWinglets(radius, time) {
  const flap = Math.sin(time * 11) * radius * 0.12;
  ctx.save();
  ctx.strokeStyle = "#ffb703";
  ctx.lineWidth = Math.max(2, radius * 0.12);
  ctx.lineCap = "round";
  ctx.shadowColor = "#ffb703";
  ctx.shadowBlur = 10;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * radius * 0.48, -radius * 0.1);
    ctx.lineTo(side * radius * 1.15, -radius * 0.52 + flap);
    ctx.lineTo(side * radius * 0.78, radius * 0.24 - flap);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemySprout(radius, time) {
  const sway = Math.sin(time * 4) * 0.16;
  ctx.save();
  ctx.rotate(sway);
  ctx.strokeStyle = "#4ef0b3";
  ctx.lineWidth = Math.max(2, radius * 0.14);
  ctx.lineCap = "round";
  ctx.shadowColor = "#4ef0b3";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.42);
  ctx.quadraticCurveTo(radius * 0.2, -radius * 0.88, radius * 0.12, -radius * 1.24);
  ctx.stroke();
  ctx.fillStyle = "#4ef0b3";
  ctx.beginPath();
  ctx.arc(radius * 0.12, -radius * 1.24, radius * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemyArmor(radius) {
  ctx.save();
  ctx.fillStyle = "rgba(207, 226, 232, 0.82)";
  ctx.strokeStyle = "#7f8a99";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const x = -radius * 0.5 + i * radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, -radius * 0.72);
    ctx.lineTo(x + radius * 0.22, -radius * 0.46);
    ctx.lineTo(x + radius * 0.1, -radius * 0.08);
    ctx.lineTo(x - radius * 0.22, -radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemyShield(radius, ratio, time) {
  ctx.save();
  ctx.rotate(time * 0.7);
  ctx.globalAlpha = 0.3 + Math.max(0, ratio) * 0.42;
  ctx.strokeStyle = "#62caff";
  ctx.lineWidth = 4;
  ctx.setLineDash([radius * 0.55, radius * 0.24]);
  ctx.beginPath();
  ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#62caff";
  ctx.beginPath();
  ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemyCrown(radius, time) {
  const bounce = Math.sin(time * 5) * radius * 0.04;
  ctx.save();
  ctx.translate(0, -radius * 0.92 + bounce);
  ctx.strokeStyle = "#ff3d5a";
  ctx.lineWidth = Math.max(2.5, radius * 0.12);
  ctx.lineCap = "round";
  ctx.shadowColor = "#ff3d5a";
  ctx.shadowBlur = 18;
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI * 0.8 + i * Math.PI * 0.4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius * 0.28, Math.sin(angle) * radius * 0.12);
    ctx.lineTo(Math.cos(angle) * radius * 0.86, -radius * 0.52 + Math.sin(angle) * radius * 0.24);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemyFace(enemy, radius, slowed, time) {
  const palette = enemyPalette(enemy, slowed);
  ctx.save();
  ctx.strokeStyle = palette.core;
  ctx.lineWidth = Math.max(1.4, radius * 0.08);
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.82;
  ctx.shadowColor = palette.core;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  if (enemy.traits.includes("boss")) {
    ctx.moveTo(-radius * 0.5, radius * 0.32);
    ctx.quadraticCurveTo(0, radius * 0.56 + Math.sin(time * 2) * radius * 0.04, radius * 0.5, radius * 0.28);
  } else {
    ctx.moveTo(-radius * 0.34, radius * 0.24);
    ctx.quadraticCurveTo(0, radius * 0.38, radius * 0.34, radius * 0.2);
  }
  ctx.stroke();
  ctx.restore();
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

function drawParticles(ctx) {
  ctx.save();
  for (const particle of VFX.particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * (0.55 + particle.life), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWaveCountdown() {
  if (state.waveIndex === 0 || state.waveActive || state.levelCleared || state.ended || state.paused) return;
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
    state.waveActive || state.levelCleared || state.ended || state.waveIndex === 0
      ? "--"
      : `${Math.max(0, Math.ceil(state.countdown))}s`;
  ui.towerUnlock.textContent =
    state.mode === "endless" ? "全开" : `${unlockedTowerCount()}/${towerOrder.length}`;
  ui.continueBtn.textContent = `继续第 ${state.levelIndex + 1} 关`;
  ui.waveBtn.textContent = waveButtonText();
  ui.waveBtn.disabled = state.waveActive || state.paused || state.draftOpen;
  updateCombatControls();
  renderTowerDetail();
  renderBuffTrack();
  renderShop();
  renderChallengeTrack();
  renderDebugInfo();
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
    ui.combatNote.textContent =
      state.systemLog ||
      (activeBuffs ? `已获得 ${activeBuffs} 层局内 Buff` : "选择建造点或防御塔后进行操作");
  }
}

function towerDetailRows(tower) {
  const stats = towerStats(tower);
  return [
    ["伤害", fmtNumber(stats.damage, 1)],
    ["攻速", `${fmtNumber(1 / stats.fireRate, 2)}/秒`],
    ["射程", fmtNumber(stats.range)],
    ["溅射", stats.splash > 0 ? fmtNumber(stats.splash) : "无"],
    ["穿透", `${stats.pierce} 个目标`],
    ["破甲", fmtNumber(stats.armorPierce, 1)],
    ["破盾", `${fmtNumber(stats.shieldBonus, 2)}x`],
    ["减速", stats.slow ? `${Math.round((1 - stats.slow) * 100)}% · ${fmtNumber(stats.slowDuration, 1)}s` : "无"],
  ];
}

function renderTowerDetail() {
  if (!ui.towerDetail) return;
  const tower = state.selectedTower;
  const key = tower
    ? `${tower.type}|${tower.level}|${state.coins}|${JSON.stringify(state.buffs)}|${state.mode}`
    : `empty|${state.selectedBuild}|${state.mode}|${state.unlockedLevel}`;
  if (key === lastTowerDetailKey) return;
  lastTowerDetailKey = key;

  if (!tower) {
    const unlocked = unlockedTowerPool()
      .map((type) => towerTypes[type].name)
      .join("、");
    ui.towerDetail.innerHTML = `
      <div class="detail-empty">选择一座塔查看伤害、射程、破甲、破盾和减速效果。</div>
      <div class="detail-hint">当前可召唤：${unlocked || "暂无"}</div>
    `;
    return;
  }

  const type = towerTypes[tower.type];
  const rows = towerDetailRows(tower)
    .map(([label, value]) => `<span>${label}</span><strong>${value}</strong>`)
    .join("");
  const upgradeText =
    tower.level >= maxTowerLevel()
      ? "已满级"
      : `升级费用 ${upgradeCost(tower)} 金币${state.coins >= upgradeCost(tower) ? " · 可升级" : ""}`;
  ui.towerDetail.innerHTML = `
    <div class="tower-detail__head">
      <span class="tower-dot ${tower.type}"></span>
      <div><strong>${type.name} Lv.${tower.level}</strong><span>${type.role}</span></div>
    </div>
    <div class="tower-detail__grid">${rows}</div>
    <div class="detail-hint">${upgradeText}</div>
  `;
}

function renderBuffTrack() {
  if (!ui.buffTrack) return;
  const key = JSON.stringify(state.buffs);
  if (key === lastBuffTrackKey) return;
  lastBuffTrackKey = key;
  const active = Object.entries(state.buffs).filter(([, count]) => count > 0);
  if (active.length === 0) {
    ui.buffTrack.innerHTML = '<div class="detail-empty">通关波次或清理水晶后，在三选一中获得局内 Buff。</div>';
    return;
  }
  ui.buffTrack.innerHTML = active
    .map(([id, count]) => {
      const card = draftCards.find((item) => item.id === id);
      return `<div class="buff-chip"><strong>${card?.name || id}</strong><span>Lv.${count} · ${card?.text || ""}</span></div>`;
    })
    .join("");
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
  if (state.waveIndex === 0) return "开始波次";
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

function briefingTraits(mode, targetLevel) {
  if (mode === "endless") return ["swift", "shield", "armor", "regen", "boss"];
  return [...new Set(targetLevel.waves.flatMap((wave) => wave.traits))];
}

function renderIntelligence(mode, targetLevel) {
  if (!ui.intelligenceList) return;
  const traits = briefingTraits(mode, targetLevel);
  ui.intelligenceList.innerHTML = "";
  const summary = document.createElement("div");
  summary.className = "intel-card";
  const waveText = mode === "endless" ? "无限波，每 5 波 Boss" : `${targetLevel.waves.length} 波`;
  const traitText = traits.length
    ? traits.map((trait) => traitInfo[trait]?.name || trait).join("、")
    : "基础怪";
  summary.innerHTML = `<strong>${waveText}</strong><span>敌人词条：${traitText}</span>`;
  ui.intelligenceList.append(summary);

  traits.forEach((trait) => {
    const info = traitInfo[trait];
    if (!info) return;
    const card = document.createElement("div");
    card.className = "intel-card";
    card.innerHTML = `<strong>${info.name}</strong><span>${info.text}</span><span>推荐：${info.recommend}</span>`;
    ui.intelligenceList.append(card);
  });
}

function renderBriefing() {
  const mode = state.pendingMode;
  const index = state.pendingLevelIndex;
  const targetLevel = mode === "endless" ? endlessLevel : levels[index];
  const challengeDefs = challengeSet(mode, index);
  ui.briefingTitle.textContent =
    mode === "endless" ? `${targetLevel.name} · 持久战` : `第 ${index + 1} 关：${targetLevel.name}`;

  renderIntelligence(mode, targetLevel);

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

function renderDebugInfo() {
  if (!ui.debugInfo) return;
  const wave = currentWave();
  ui.debugInfo.textContent = JSON.stringify(
    {
      version: GAME_VERSION,
      profile: state.profileName,
      screen: state.screen,
      mode: state.mode,
      level: state.mode === "endless" ? "endless" : state.levelIndex + 1,
      waveIndex: state.waveIndex,
      waveActive: state.waveActive,
      countdown: Math.max(0, Number(state.countdown.toFixed(2))),
      lives: state.lives,
      coins: state.coins,
      towers: state.towers.length,
      enemies: state.enemies.length,
      nextTraits: wave?.traits || [],
      buffs: state.buffs,
    },
    null,
    2,
  );
}

function setDebugOpen(open) {
  if (open && !debugEnabled() && !state.debugUnlocked) return;
  ui.debugPanel.classList.toggle("hide", !open);
  if (open) renderDebugInfo();
}

function syncDebugAccess() {
  const enabled = debugEnabled() || state.debugUnlocked;
  ui.debugBtn.classList.toggle("hide", !enabled);
  if (!enabled) ui.debugPanel.classList.add("hide");
}

function debugAddCoins() {
  state.coins += 500;
  showToast("调试：金币 +500");
  playSound("reward");
  updateUi();
}

function debugClearLevel() {
  if (state.screen !== "game") setScreen("game");
  if (state.mode === "endless") {
    state.waveActive = false;
    state.waveIndex += 1;
    state.countdown = autoWaveDelay();
    state.enemies = [];
    state.bullets = [];
    showToast("调试：无尽波次完成");
  } else {
    clearCurrentLevel();
  }
  updateUi();
}

function debugUnlockAll() {
  state.unlockedLevel = levels.length - 1;
  saveProgress();
  showToast("调试：已解锁全部关卡");
  updateUi();
}

function debugSpawnBoss() {
  if (state.screen !== "game") setScreen("game");
  const base = currentWave() || createEndlessWave(state.waveIndex);
  spawnEnemy({
    ...base,
    count: 1,
    hp: Math.max(base.hp || 260, 260 + state.levelIndex * 90),
    shield: Math.max(base.shield || 0, 80 + state.levelIndex * 24),
    armor: Math.max(base.armor || 0, 4 + state.levelIndex),
    regen: Math.max(base.regen || 0, 3 + state.levelIndex),
    speed: Math.min(base.speed || 48, 58),
    size: Math.max(base.size || 26, 28),
    reward: Math.max(base.reward || 30, 70),
    traits: [...new Set([...(base.traits || []), "boss"])],
  });
  showToast("调试：Boss 已召唤");
  updateUi();
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
  ensureAudio();
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

document.addEventListener("pointerdown", ensureAudio, { once: true });
ui.waveBtn.addEventListener("click", () => {
  playSound("ui");
  startWave();
});
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
ui.exportSaveBtn.addEventListener("click", exportSave);
ui.importSaveBtn.addEventListener("click", () => ui.importSaveInput.click());
ui.importSaveInput.addEventListener("change", () => importSaveFile(ui.importSaveInput.files?.[0]));
ui.soundBtn.addEventListener("click", () => setSoundEnabled(!state.soundEnabled));
ui.debugBtn.addEventListener("click", () => setDebugOpen(true));
ui.debugCloseBtn.addEventListener("click", () => setDebugOpen(false));
ui.debugCoinsBtn.addEventListener("click", debugAddCoins);
ui.debugClearBtn.addEventListener("click", debugClearLevel);
ui.debugUnlockBtn.addEventListener("click", debugUnlockAll);
ui.debugBossBtn.addEventListener("click", debugSpawnBoss);
ui.mobileTabs.forEach((button) => {
  button.addEventListener("click", () => setHudTab(button.dataset.tab));
});
ui.briefingCloseBtn.addEventListener("click", closeBriefing);
ui.startBriefingBtn.addEventListener("click", startBriefedRun);
ui.pauseBtn.addEventListener("click", () => setPaused(!state.paused));
ui.resumeBtn.addEventListener("click", () => setPaused(false));
ui.pauseRestartBtn.addEventListener("click", restartCurrentRun);
ui.backToLevelsBtn.addEventListener("click", () => setScreen("levels"));
window.addEventListener("keydown", (event) => {
  if (event.key === "`" || event.key === "~") {
    state.debugUnlocked = true;
    ui.debugBtn.classList.remove("hide");
    setDebugOpen(true);
  }
});

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
setSoundEnabled(localStorage.getItem("homewatch_sound_enabled_v1") !== "0");
setHudTab(state.activeHudTab);
syncDebugAccess();
setScreen("levels");
requestAnimationFrame(loop);
