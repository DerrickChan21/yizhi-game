/**
 * 益智游戏 - 数据层
 * 兼容iOS 9
 */

function GameStorage() {
  this.PROGRESS_KEY = 'puzzle_game_progress';
  this.CONFIG_KEY = 'puzzle_game_config';
  this.VERSION = '1.0';
}

GameStorage.prototype.getProgress = function() {
  try {
    var data = localStorage.getItem(this.PROGRESS_KEY);
    if (!data) return this.getDefaultProgress();
    var progress = JSON.parse(data);
    if (!this.validateProgress(progress)) return this.getDefaultProgress();
    return progress;
  } catch (e) {
    console.error('读取进度失败:', e);
    return this.getDefaultProgress();
  }
};

GameStorage.prototype.saveProgress = function(progress) {
  try {
    progress.lastUpdate = new Date().toISOString();
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch (e) {
    console.error('保存进度失败:', e);
    return false;
  }
};

GameStorage.prototype.getDefaultProgress = function() {
  return {
    version: this.VERSION,
    lastUpdate: new Date().toISOString(),
    levels: {
      'color_1': { status: 'unlocked', stars: 0, bestStars: 0, attempts: 0, bestTime: null, lastPlayTime: null, questionResults: [] },
      'color_2': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'color_3': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'color_4': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'color_5': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'shape_1': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'shape_2': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'shape_3': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'shape_4': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'shape_5': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'number_1': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'number_2': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'number_3': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'number_4': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
      'number_5': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 }
    },
    stats: { totalPlays: 0, totalStars: 0, totalCorrect: 0, totalQuestions: 0, totalTime: 0, lastPlayTime: null, averageAccuracy: 0 },
    badges: [],
    lastBadge: null,
    playHistory: []
  };
};

GameStorage.prototype.validateProgress = function(progress) {
  if (!progress.version || !progress.levels || !progress.stats) return false;
  var fields = ['version', 'lastUpdate', 'levels', 'stats'];
  for (var i = 0; i < fields.length; i++) {
    if (!(fields[i] in progress)) return false;
  }
  return true;
};

GameStorage.prototype.updateLevelProgress = function(levelId, stars, time, correctCount, totalCount) {
  var progress = this.getProgress();
  var level = progress.levels[levelId];
  if (!level) return false;
  level.attempts++;
  level.stars = stars;
  level.lastPlayTime = new Date().toISOString();
  if (stars > level.bestStars) level.bestStars = stars;
  if (!level.bestTime || time < level.bestTime) level.bestTime = time;
  if (stars >= 1) level.status = 'completed';
  progress.stats.totalPlays++;
  progress.stats.totalStars += stars;
  progress.stats.totalCorrect += correctCount;
  progress.stats.totalQuestions += totalCount;
  progress.stats.totalTime += time;
  progress.stats.lastPlayTime = new Date().toISOString();
  if (progress.stats.totalQuestions > 0) {
    progress.stats.averageAccuracy = progress.stats.totalCorrect / progress.stats.totalQuestions;
  }
  progress.playHistory.push({ date: new Date().toISOString().split('T')[0], level: levelId, stars: stars, time: time, accuracy: totalCount > 0 ? correctCount / totalCount : 0 });
  if (progress.playHistory.length > 50) progress.playHistory = progress.playHistory.slice(-50);
  this.unlockNextLevel(progress, levelId);
  return this.saveProgress(progress);
};

GameStorage.prototype.unlockNextLevel = function(progress, currentLevelId) {
  var match = currentLevelId.match(/(\w+)_(\d+)/);
  if (!match) return;
  var nextLevelId = match[1] + '_' + (parseInt(match[2]) + 1);
  if (progress.levels[nextLevelId] && progress.levels[nextLevelId].status === 'locked') {
    progress.levels[nextLevelId].status = 'unlocked';
  }
};

GameStorage.prototype.getConfig = function() {
  try {
    var data = localStorage.getItem(this.CONFIG_KEY);
    if (!data) return this.getDefaultConfig();
    return JSON.parse(data);
  } catch (e) { return this.getDefaultConfig(); }
};

GameStorage.prototype.saveConfig = function(config) {
  try { localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config)); return true; } catch (e) { return false; }
};

GameStorage.prototype.getDefaultConfig = function() {
  return { audioEnabled: true, musicVolume: 0.7, sfxVolume: 0.8, difficulty: 'normal' };
};

GameStorage.prototype.resetLevel = function(levelId) {
  var progress = this.getProgress();
  if (progress.levels[levelId]) {
    progress.levels[levelId] = { status: levelId === 'color_1' ? 'unlocked' : 'locked', stars: 0, bestStars: 0, attempts: 0, bestTime: null, lastPlayTime: null, questionResults: [] };
    return this.saveProgress(progress);
  }
  return false;
};

GameStorage.prototype.resetPlanet = function(planet) {
  var progress = this.getProgress();
  var levelIds = Object.keys(progress.levels);
  for (var i = 0; i < levelIds.length; i++) {
    if (levelIds[i].indexOf(planet + '_') === 0) {
      progress.levels[levelIds[i]] = { status: levelIds[i] === planet + '_1' ? 'unlocked' : 'locked', stars: 0, bestStars: 0, attempts: 0, bestTime: null, lastPlayTime: null, questionResults: [] };
    }
  }
  return this.saveProgress(progress);
};

GameStorage.prototype.resetAll = function() {
  return this.saveProgress(this.getDefaultProgress());
};

GameStorage.prototype.getPlanetStats = function(planet) {
  var progress = this.getProgress();
  var totalStars = 0, maxStars = 0, completedLevels = 0, totalLevels = 0;
  var levelIds = Object.keys(progress.levels);
  for (var i = 0; i < levelIds.length; i++) {
    if (levelIds[i].indexOf(planet + '_') === 0) {
      totalLevels++; maxStars += 3;
      totalStars += progress.levels[levelIds[i]].bestStars;
      if (progress.levels[levelIds[i]].status === 'completed') completedLevels++;
    }
  }
  return { totalStars: totalStars, maxStars: maxStars, completedLevels: completedLevels, totalLevels: totalLevels };
};

GameStorage.prototype.checkPlanetUnlock = function(progress, planet) {
  if (planet === 'color') return this.getPlanetStats(planet).completedLevels >= 5;
  if (planet === 'shape') return this.getPlanetStats('color').completedLevels >= 5;
  if (planet === 'number') return this.getPlanetStats('shape').completedLevels >= 5;
  return false;
};

GameStorage.prototype.unlockBadge = function(badgeId) {
  var progress = this.getProgress();
  if (progress.badges.indexOf(badgeId) !== -1) return null;
  progress.badges.push(badgeId);
  progress.lastBadge = { id: badgeId, unlockedAt: new Date().toISOString() };
  this.saveProgress(progress);
  return progress.lastBadge;
};

GameStorage.prototype.checkAchievementBadges = function() {
  var progress = this.getProgress();
  var unlocked = [];
  if (progress.stats.totalStars >= 10 && progress.badges.indexOf('star_10') === -1) unlocked.push(this.unlockBadge('star_10'));
  if (progress.stats.totalStars >= 30 && progress.badges.indexOf('star_30') === -1) unlocked.push(this.unlockBadge('star_30'));
  var completedLevels = 0;
  var levelIds = Object.keys(progress.levels);
  for (var i = 0; i < levelIds.length; i++) {
    if (progress.levels[levelIds[i]].status === 'completed') completedLevels++;
  }
  if (completedLevels >= 5 && progress.badges.indexOf('level_5') === -1) unlocked.push(this.unlockBadge('level_5'));
  if (completedLevels >= 15 && progress.badges.indexOf('level_15') === -1) unlocked.push(this.unlockBadge('level_15'));
  var perfectLevels = 0;
  for (var i = 0; i < levelIds.length; i++) {
    if (progress.levels[levelIds[i]].bestStars === 3) perfectLevels++;
  }
  if (perfectLevels >= 5 && progress.badges.indexOf('perfect_5') === -1) unlocked.push(this.unlockBadge('perfect_5'));
  if (progress.stats.totalTime >= 1800 && progress.badges.indexOf('play_30min') === -1) unlocked.push(this.unlockBadge('play_30min'));
  return unlocked.filter(function(b) { return b !== null; });
};

GameStorage.prototype.getUnlockedBadges = function() {
  return this.getProgress().badges;
};

GameStorage.prototype.getLastBadge = function() {
  return this.getProgress().lastBadge;
};

GameStorage.getBadgeData = function(badgeId) {
  var badgeMap = {
    'color_1': { emoji: '', name: '红色新手', description: '完成颜色识别基础关' },
    'color_2': { emoji: '', name: '颜色学徒', description: '掌握颜色分类' },
    'color_3': { emoji: '', name: '颜色达人', description: '学会颜色配对' },
    'color_4': { emoji: '', name: '颜色专家', description: '区分深浅色' },
    'color_5': { emoji: '', name: '颜色大师', description: '颜色知识全掌握' },
    'shape_1': { emoji: '', name: '形状新手', description: '认识基础形状' },
    'shape_2': { emoji: '', name: '形状学徒', description: '学会形状分类' },
    'shape_3': { emoji: '', name: '形状达人', description: '掌握形状配对' },
    'shape_4': { emoji: '', name: '形状专家', description: '学会形状组合' },
    'shape_5': { emoji: '', name: '形状大师', description: '形状知识全掌握' },
    'number_1': { emoji: '1️', name: '数字新手', description: '认识数字1-5' },
    'number_2': { emoji: '', name: '数字学徒', description: '学会数数' },
    'number_3': { emoji: '', name: '数字达人', description: '比较大小' },
    'number_4': { emoji: '', name: '数字专家', description: '学会简单加法' },
    'number_5': { emoji: '', name: '数字大师', description: '数字知识全掌握' },
    'star_10': { emoji: '', name: '星星收集者', description: '累计获得10颗星' },
    'star_30': { emoji: '', name: '星星达人', description: '累计获得30颗星' },
    'level_5': { emoji: '', name: '关卡征服者', description: '完成5个关卡' },
    'level_15': { emoji: '', name: '学习小能手', description: '完成所有15个关卡' },
    'perfect_5': { emoji: '', name: '完美主义者', description: '5个关卡满星' },
    'play_30min': { emoji: '', name: '游戏达人', description: '累计游戏30分钟' },
    'first_play': { emoji: '', name: '初次尝试', description: '首次进入游戏' },
    'color_master': { emoji: '', name: '颜色大师(成就)', description: '颜色星球全满星' },
    'shape_master': { emoji: '', name: '形状大师(成就)', description: '形状星球全满星' },
    'number_master': { emoji: '', name: '数字大师(成就)', description: '数字星球全满星' }
  };
  return badgeMap[badgeId] || { emoji: '🎖️', name: '未知徽章', description: '' };
};

var gameStorage = new GameStorage();
