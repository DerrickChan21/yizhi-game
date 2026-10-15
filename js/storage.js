/**
 * 益智游戏 - 数据层
 * 管理LocalStorage存储,进度保存和读取
 */

class GameStorage {
  constructor() {
    this.PROGRESS_KEY = 'puzzle_game_progress';
    this.CONFIG_KEY = 'puzzle_game_config';
    this.VERSION = '1.0';
  }

  /**
   * 获取进度数据
   */
  getProgress() {
    try {
      const data = localStorage.getItem(this.PROGRESS_KEY);
      if (!data) {
        return this.getDefaultProgress();
      }

      const progress = JSON.parse(data);

      // 校验数据完整性
      if (!this.validateProgress(progress)) {
        console.warn('进度数据损坏,使用默认值');
        return this.getDefaultProgress();
      }

      return progress;
    } catch (e) {
      console.error('读取进度失败:', e);
      return this.getDefaultProgress();
    }
  }

  /**
   * 保存进度数据
   */
  saveProgress(progress) {
    try {
      progress.lastUpdate = new Date().toISOString();
      const data = JSON.stringify(progress);
      localStorage.setItem(this.PROGRESS_KEY, data);
      return true;
    } catch (e) {
      console.error('保存进度失败:', e);
      return false;
    }
  }

  /**
   * 获取默认进度
   */
  getDefaultProgress() {
    return {
      version: this.VERSION,
      lastUpdate: new Date().toISOString(),
      levels: {
        // 颜色星球关卡
        'color_1': {
          status: 'unlocked', // locked, unlocked, completed
          stars: 0,
          bestStars: 0,
          attempts: 0,
          bestTime: null,
          lastPlayTime: null,
          questionResults: []
        },
        'color_2': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'color_3': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'color_4': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'color_5': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },

        // 形状星球关卡 (Phase 2)
        'shape_1': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'shape_2': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'shape_3': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'shape_4': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'shape_5': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },

        // 数字星球关卡 (Phase 2)
        'number_1': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'number_2': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'number_3': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'number_4': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 },
        'number_5': { status: 'locked', stars: 0, bestStars: 0, attempts: 0 }
      },
      stats: {
        totalPlays: 0,
        totalStars: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalTime: 0,
        lastPlayTime: null,
        averageAccuracy: 0
      },
      badges: [],
      lastBadge: null,
      playHistory: []
    };
  }

  /**
   * 校验进度数据完整性
   */
  validateProgress(progress) {
    if (!progress.version || !progress.levels || !progress.stats) {
      return false;
    }

    // 检查必要的字段
    const requiredFields = ['version', 'lastUpdate', 'levels', 'stats'];
    for (const field of requiredFields) {
      if (!(field in progress)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 更新关卡进度
   */
  updateLevelProgress(levelId, stars, time, correctCount, totalCount) {
    const progress = this.getProgress();
    const level = progress.levels[levelId];

    if (!level) {
      console.error('关卡不存在:', levelId);
      return false;
    }

    // 更新关卡数据
    level.attempts++;
    level.stars = stars;
    level.lastPlayTime = new Date().toISOString();

    // 更新最佳记录
    if (stars > level.bestStars) {
      level.bestStars = stars;
    }

    if (!level.bestTime || time < level.bestTime) {
      level.bestTime = time;
    }

    // 标记完成状态
    if (stars >= 1) {
      level.status = 'completed';
    }

    // 更新统计
    progress.stats.totalPlays++;
    progress.stats.totalStars += stars;
    progress.stats.totalCorrect += correctCount;
    progress.stats.totalQuestions += totalCount;
    progress.stats.totalTime += time;
    progress.stats.lastPlayTime = new Date().toISOString();

    // 计算平均正确率
    if (progress.stats.totalQuestions > 0) {
      progress.stats.averageAccuracy = progress.stats.totalCorrect / progress.stats.totalQuestions;
    }

    // 添加游玩历史
    progress.playHistory.push({
      date: new Date().toISOString().split('T')[0],
      level: levelId,
      stars: stars,
      time: time,
      accuracy: totalCount > 0 ? correctCount / totalCount : 0
    });

    // 限制历史记录数量(保留最近50条)
    if (progress.playHistory.length > 50) {
      progress.playHistory = progress.playHistory.slice(-50);
    }

    // 解锁下一关
    this.unlockNextLevel(progress, levelId);

    return this.saveProgress(progress);
  }

  /**
   * 解锁下一关
   */
  unlockNextLevel(progress, currentLevelId) {
    // 解析当前关卡ID
    const match = currentLevelId.match(/(\w+)_(\d+)/);
    if (!match) return;

    const planet = match[1];
    const currentLevel = parseInt(match[2]);
    const nextLevel = currentLevel + 1;
    const nextLevelId = `${planet}_${nextLevel}`;

    // 检查是否有下一关
    if (progress.levels[nextLevelId]) {
      // 如果下一关是锁定状态,解锁它
      if (progress.levels[nextLevelId].status === 'locked') {
        progress.levels[nextLevelId].status = 'unlocked';
      }
    }
  }

  /**
   * 获取配置
   */
  getConfig() {
    try {
      const data = localStorage.getItem(this.CONFIG_KEY);
      if (!data) {
        return this.getDefaultConfig();
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('读取配置失败:', e);
      return this.getDefaultConfig();
    }
  }

  /**
   * 保存配置
   */
  saveConfig(config) {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (e) {
      console.error('保存配置失败:', e);
      return false;
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      audioEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      difficulty: 'normal'
    };
  }

  /**
   * 重置关卡进度
   */
  resetLevel(levelId) {
    const progress = this.getProgress();

    if (progress.levels[levelId]) {
      progress.levels[levelId] = {
        status: levelId === 'color_1' ? 'unlocked' : 'locked',
        stars: 0,
        bestStars: 0,
        attempts: 0,
        bestTime: null,
        lastPlayTime: null,
        questionResults: []
      };

      return this.saveProgress(progress);
    }

    return false;
  }

  /**
   * 重置星球进度
   */
  resetPlanet(planet) {
    const progress = this.getProgress();

    // 重置该星球的所有关卡
    Object.keys(progress.levels).forEach(levelId => {
      if (levelId.startsWith(planet + '_')) {
        progress.levels[levelId] = {
          status: levelId === `${planet}_1` ? 'unlocked' : 'locked',
          stars: 0,
          bestStars: 0,
          attempts: 0,
          bestTime: null,
          lastPlayTime: null,
          questionResults: []
        };
      }
    });

    return this.saveProgress(progress);
  }

  /**
   * 重置全部进度
   */
  resetAll() {
    return this.saveProgress(this.getDefaultProgress());
  }

  /**
   * 获取星球统计信息
   */
  getPlanetStats(planet) {
    const progress = this.getProgress();
    let totalStars = 0;
    let maxStars = 0;
    let completedLevels = 0;
    let totalLevels = 0;

    Object.keys(progress.levels).forEach(levelId => {
      if (levelId.startsWith(planet + '_')) {
        totalLevels++;
        maxStars += 3; // 每关最多3星
        const level = progress.levels[levelId];
        totalStars += level.bestStars;
        if (level.status === 'completed') {
          completedLevels++;
        }
      }
    });

    return {
      totalStars,
      maxStars,
      completedLevels,
      totalLevels
    };
  }

  /**
   * 检查是否解锁新星球
   */
  checkPlanetUnlock(progress, planet) {
    const stats = this.getPlanetStats(planet);

    // 颜色星球: 完成所有5关解锁
    if (planet === 'color') {
      return stats.completedLevels >= 5;
    }

    // 形状星球: 需要颜色星球完成
    if (planet === 'shape') {
      const colorStats = this.getPlanetStats('color');
      return colorStats.completedLevels >= 5;
    }

    // 数字星球: 需要形状星球完成
    if (planet === 'number') {
      const shapeStats = this.getPlanetStats('shape');
      return shapeStats.completedLevels >= 5;
    }

    return false;
  }

  /**
   * 解锁徽章
   */
  unlockBadge(badgeId) {
    const progress = this.getProgress();

    // 检查是否已拥有
    if (progress.badges.includes(badgeId)) {
      return null; // 已拥有,不重复解锁
    }

    // 添加徽章
    progress.badges.push(badgeId);
    progress.lastBadge = {
      id: badgeId,
      unlockedAt: new Date().toISOString()
    };

    this.saveProgress(progress);
    return progress.lastBadge;
  }

  /**
   * 检查并解锁成就徽章
   */
  checkAchievementBadges() {
    const progress = this.getProgress();
    const unlocked = [];

    // 星星收集者 - 累计10星
    if (progress.stats.totalStars >= 10 && !progress.badges.includes('star_10')) {
      unlocked.push(this.unlockBadge('star_10'));
    }

    // 星星达人 - 累计30星
    if (progress.stats.totalStars >= 30 && !progress.badges.includes('star_30')) {
      unlocked.push(this.unlockBadge('star_30'));
    }

    // 关卡征服者 - 完成5关
    let completedLevels = 0;
    Object.keys(progress.levels).forEach(levelId => {
      if (progress.levels[levelId].status === 'completed') {
        completedLevels++;
      }
    });

    if (completedLevels >= 5 && !progress.badges.includes('level_5')) {
      unlocked.push(this.unlockBadge('level_5'));
    }

    // 学习小能手 - 完成15关
    if (completedLevels >= 15 && !progress.badges.includes('level_15')) {
      unlocked.push(this.unlockBadge('level_15'));
    }

    // 完美主义者 - 5关满星
    let perfectLevels = 0;
    Object.keys(progress.levels).forEach(levelId => {
      if (progress.levels[levelId].bestStars === 3) {
        perfectLevels++;
      }
    });

    if (perfectLevels >= 5 && !progress.badges.includes('perfect_5')) {
      unlocked.push(this.unlockBadge('perfect_5'));
    }

    // 游戏达人 - 累计30分钟
    if (progress.stats.totalTime >= 1800 && !progress.badges.includes('play_30min')) {
      unlocked.push(this.unlockBadge('play_30min'));
    }

    // 颜色大师成就 - 颜色星球全满星
    if (perfectLevels >= 5 && this.checkPlanetPerfect('color') && !progress.badges.includes('color_master')) {
      unlocked.push(this.unlockBadge('color_master'));
    }

    // 形状大师成就
    if (perfectLevels >= 5 && this.checkPlanetPerfect('shape') && !progress.badges.includes('shape_master')) {
      unlocked.push(this.unlockBadge('shape_master'));
    }

    // 数字大师成就
    if (perfectLevels >= 5 && this.checkPlanetPerfect('number') && !progress.badges.includes('number_master')) {
      unlocked.push(this.unlockBadge('number_master'));
    }

    return unlocked.filter(b => b !== null);
  }

  /**
   * 检查星球是否满星
   */
  checkPlanetPerfect(planet) {
    const progress = this.getProgress();
    let perfectCount = 0;
    let totalCount = 0;

    Object.keys(progress.levels).forEach(levelId => {
      if (levelId.startsWith(planet + '_')) {
        totalCount++;
        if (progress.levels[levelId].bestStars === 3) {
          perfectCount++;
        }
      }
    });

    return totalCount >= 5 && perfectCount >= 5;
  }

  /**
   * 获取所有徽章数据(带降级方案)
   */
  async getAllBadges() {
    try {
      const response = await fetch('data/badges.json');
      if (!response.ok) {
        throw new Error('加载徽章数据失败');
      }
      const data = await response.json();
      return data.badges;
    } catch (e) {
      console.warn('加载徽章数据失败,使用内置数据:', e);
      // 降级方案: 返回内置的徽章列表
      return Object.keys(this.constructor.getBadgeData('').constructor.prototype).map(key => ({
        id: key,
        ...this.constructor.getBadgeData(key)
      }));
    }
  }

  /**
   * 获取已解锁的徽章
   */
  getUnlockedBadges() {
    const progress = this.getProgress();
    return progress.badges;
  }

  /**
   * 获取最近获得的徽章
   */
  getLastBadge() {
    const progress = this.getProgress();
    return progress.lastBadge;
  }

  /**
   * 获取徽章数据(统一数据源)
   */
  static getBadgeData(badgeId) {
    const badgeMap = {
      'color_1': { emoji: '', name: '红色新手', description: '完成颜色识别基础关' },
      'color_2': { emoji: '', name: '颜色学徒', description: '掌握颜色分类' },
      'color_3': { emoji: '', name: '颜色达人', description: '学会颜色配对' },
      'color_4': { emoji: '🎯', name: '颜色专家', description: '区分深浅色' },
      'color_5': { emoji: '👑', name: '颜色大师', description: '颜色知识全掌握' },
      'shape_1': { emoji: '', name: '形状新手', description: '认识基础形状' },
      'shape_2': { emoji: '', name: '形状学徒', description: '学会形状分类' },
      'shape_3': { emoji: '💠', name: '形状达人', description: '掌握形状配对' },
      'shape_4': { emoji: '🔶', name: '形状专家', description: '学会形状组合' },
      'shape_5': { emoji: '', name: '形状大师', description: '形状知识全掌握' },
      'number_1': { emoji: '1️', name: '数字新手', description: '认识数字1-5' },
      'number_2': { emoji: '🔢', name: '数字学徒', description: '学会数数' },
      'number_3': { emoji: '🧮', name: '数字达人', description: '比较大小' },
      'number_4': { emoji: '📊', name: '数字专家', description: '学会简单加法' },
      'number_5': { emoji: '', name: '数字大师', description: '数字知识全掌握' },
      'star_10': { emoji: '⭐', name: '星星收集者', description: '累计获得10颗星' },
      'star_30': { emoji: '🌟', name: '星星达人', description: '累计获得30颗星' },
      'level_5': { emoji: '🏆', name: '关卡征服者', description: '完成5个关卡' },
      'level_15': { emoji: '', name: '学习小能手', description: '完成所有15个关卡' },
      'perfect_5': { emoji: '💎', name: '完美主义者', description: '5个关卡满星' },
      'play_30min': { emoji: '🎮', name: '游戏达人', description: '累计游戏30分钟' },
      'first_play': { emoji: '', name: '初次尝试', description: '首次进入游戏' },
      'color_master': { emoji: '', name: '颜色大师(成就)', description: '颜色星球全满星' },
      'shape_master': { emoji: '🔷', name: '形状大师(成就)', description: '形状星球全满星' },
      'number_master': { emoji: '', name: '数字大师(成就)', description: '数字星球全满星' },
    };

    return badgeMap[badgeId] || { emoji: '🎖️', name: '未知徽章', description: '' };
  }
}

// 创建全局实例
const gameStorage = new GameStorage();
