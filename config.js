// Core game configuration and level generation.
const GAME_VERSION = "0.9.0";
const AUTO_WAVE_DELAY = 30;
const SAVE_KEY = "homewatch_tower_defense_save_v1";
const PROFILE_STORE_KEY = "homewatch_player_profiles_v1";
const ACTIVE_PROFILE_KEY = "homewatch_active_profile_v1";

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
    ["box", 0.09, 0.47],
    ["stump", 0.31, 0.27],
    ["crystal", 0.66, 0.72],
  ],
  [
    ["box", 0.3, 0.24],
    ["stump", 0.23, 0.59],
    ["crystal", 0.58, 0.43],
    ["box", 0.85, 0.43],
  ],
  [
    ["stump", 0.18, 0.27],
    ["box", 0.29, 0.77],
    ["crystal", 0.5, 0.47],
    ["box", 0.7, 0.64],
    ["crystal", 0.86, 0.23],
  ],
  [
    ["box", 0.14, 0.29],
    ["crystal", 0.4, 0.72],
    ["stump", 0.55, 0.21],
    ["box", 0.84, 0.5],
  ],
  [
    ["crystal", 0.14, 0.62],
    ["box", 0.32, 0.51],
    ["stump", 0.42, 0.33],
    ["crystal", 0.66, 0.66],
    ["box", 0.82, 0.43],
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
  "镜像农场",
  "回声水库",
  "灰烬花园",
  "断层集市",
  "神经温室",
  "脉冲铁桥",
  "空洞钟楼",
  "记忆荒原",
  "核心外壁",
  "终层中枢",
];

function createLevels() {
  return Array.from({ length: 20 }, (_, index) => {
    const levelNumber = index + 1;
    const route = index % pathSets.length;
    const earlyEase = Math.max(0, 5 - levelNumber) * 0.04;
    const hpScale = Math.pow(1.065, index) * (1 - earlyEase);
    const waveCount = 5;
    return {
      name: levelNames[index],
      coins: 255 + index * 34 + Math.max(0, 4 - levelNumber) * 16,
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
  if (levelNumber >= 2 && waveIndex === 1 && levelNumber !== 3) traits.push("swift");
  if (levelNumber >= 4 && waveIndex >= 2) traits.push("shield");
  if (levelNumber >= 5 && waveIndex >= 3) traits.push("armor");
  if (levelNumber >= 7 && waveIndex >= 3) traits.push("regen");
  if (bossWave) traits.push("boss");

  const traitHpBonus =
    traits.includes("shield") * 0.05 +
    traits.includes("armor") * 0.08 +
    traits.includes("regen") * 0.05 +
    traits.includes("boss") * 0.95;
  const baseHp = 58 + levelNumber * 28;
  const earlyEase = Math.max(0, 5 - levelNumber) * 0.038;
  const hp = Math.round(baseHp * hpScale * (1 + waveIndex * 0.16 + traitHpBonus) * (1 - earlyEase));
  const speedEase = levelNumber <= 4 ? 0.86 + levelNumber * 0.025 : 1;
  const speed = bossWave
    ? (43 + levelNumber * 2.2) * speedEase
    : (55 + levelNumber * 3.4 + waveIndex * 3.6 + (traits.includes("swift") ? 16 : 0)) * speedEase;
  const earlyCountEase =
    levelNumber <= 3 ? 3 : levelNumber <= 5 ? 2 : Math.min(10, 2 + Math.floor((levelNumber - 5) / 2));
  const count = bossWave
    ? Math.min(3, 1 + Math.floor(levelNumber / 6))
    : 6 + levelNumber + waveIndex * 3 - (levelNumber <= 3 ? 1 : 0) - earlyCountEase;
  return {
    count,
    hp,
    speed,
    reward: Math.max(7, 9 + Math.floor(levelNumber * 0.85) + waveIndex),
    gap: bossWave ? 1.2 : Math.max(0.34, 0.82 - levelNumber * 0.025 - waveIndex * 0.045) + (levelNumber <= 4 ? 0.18 : 0),
    size: bossWave ? 22 + levelNumber * 0.7 : 12 + levelNumber * 0.35 + waveIndex * 0.5,
    shield: traits.includes("shield") ? Math.round(hp * (0.11 + levelNumber * 0.004)) : 0,
    armor: traits.includes("armor") ? 1 + Math.floor(levelNumber / 3) : 0,
    regen: traits.includes("regen") ? 1 + levelNumber * 0.32 : 0,
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
  "清理地图道具会获得金币；防御塔可升级，战役模式中期后会提高等级上限。",
  "每波结束或清理关键道具后可获得三选一被动 Buff，强化火力网、经济或克制能力。",
  "可用随机召唤建塔，也可将两个同类型同等级塔合成为随机高阶塔。",
  "特殊怪拥有高速、护盾、护甲、回血或 Boss 特性；Boss 会鼓舞小怪并震慑附近防御塔。",
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
