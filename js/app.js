/**
 * 益智游戏 - 应用入口
 * 首页地图、关卡选择、页面路由
 */

class App {
  constructor() {
    this.currentPage = 'home';
    this.currentPlanet = null;
    this.progress = null;

    // 倒计时功能
    this.timer = null;
    this.timeLeft = 0;
    this.timerDuration = 0;
  }

  /**
   * 初始化应用
   */
  init() {
    console.log('应用初始化...');

    // 加载进度
    this.progress = gameStorage.getProgress();

    // 初始化UI
    uiManager.init();

    // 绑定事件
    this.bindEvents();

    // 渲染首页
    this.renderHomePage();

    // 加载倒计时设置
    this.loadTimerSetting();

    // 隐藏音频提示(如果已解锁)
    if (audioManager.unlocked) {
      var audioHint = document.getElementById('audio-hint');
      if (audioHint) {
        audioHint.style.display = 'none';
      }
    }

    console.log('应用初始化完成');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 声音开关按钮
    var audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
      audioToggle.addEventListener('click', function() {
        this.toggleAudio();
      });
      // 初始化按钮状态
      this.updateAudioButton();
    }

    // 倒计时按钮
    var timerBtn = document.getElementById('timer-btn');
    if (timerBtn) {
      timerBtn.addEventListener('click', function() {
        this.showTimerModal();
      });
    }

    // 关闭倒计时弹窗
    var timerClose = document.getElementById('timer-close');
    if (timerClose) {
      timerClose.addEventListener('click', function() {
        this.hideTimerModal();
      });
    }

    // 倒计时选项
    var timerOptions = document.querySelectorAll('.timer-option');
    timerOptions.forEach(function(option) {
      option.addEventListener('click', function() {
        var minutes = parseInt(option.dataset.minutes);
        this.setTimer(minutes);
        this.hideTimerModal();
      });
    });

    // 休息提醒确认按钮
    var breakOk = document.getElementById('break-ok');
    if (breakOk) {
      breakOk.addEventListener('click', function() {
        this.hideBreakModal();
      });
    }

    // 最近徽章点击
    var lastBadge = document.getElementById('last-badge');
    if (lastBadge) {
      lastBadge.addEventListener('click', function() {
        window.location.href = 'badges.html';
      });
    }

    // 家长按钮
    var parentBtn = document.getElementById('parent-btn');
    if (parentBtn) {
      parentBtn.addEventListener('click', function() {
        this.navigateToParent();
      });
    }

    // 徽章按钮
    var badgeBtn = document.getElementById('badge-btn');
    if (badgeBtn) {
      badgeBtn.addEventListener('click', function() {
        window.location.href = 'badges.html';
      });
    }

    // 返回按钮
    var backBtn = document.getElementById('back-to-home');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        this.navigateHome();
      });
    }

    // 星球点击
    var planetItems = document.querySelectorAll('.planet-item');
    planetItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        var planet = item.dataset.planet;
        this.handlePlanetClick(planet, item);
      });
    });
  }

  /**
   * 渲染首页
   */
  renderHomePage() {
    // 更新统计
    this.updateStats();

    // 更新星球状态
    this.updatePlanetStatus();
  }

  /**
   * 更新统计信息
   */
  updateStats() {
    var totalStars = document.getElementById('total-stars');
    var completedLevels = document.getElementById('completed-levels');
    var lastBadgeContainer = document.getElementById('last-badge-container');
    var lastBadgeIcon = document.getElementById('last-badge-icon');

    if (totalStars) {
      totalStars.textContent = this.progress.stats.totalStars;
    }

    if (completedLevels) {
      // 计算完成关卡数
      var completed = 0;
      Object.keys(this.progress.levels).forEach(function(levelId) {
        if (this.progress.levels[levelId].status === 'completed') {
          completed++;
        }
      });
      completedLevels.textContent = completed;
    }

    // 显示最近获得的徽章
    var lastBadge = gameStorage.getLastBadge();
    if (lastBadge && lastBadgeContainer && lastBadgeIcon) {
      var badgeData = this.getBadgeData(lastBadge.id);
      lastBadgeIcon.textContent = badgeData.emoji;
      lastBadgeContainer.style.display = 'flex';
      lastBadgeContainer.title = `最近获得: ${badgeData.name}`;
    }
  }

  /**
   * 获取徽章数据
   */
  getBadgeData(badgeId) {
    return GameStorage.getBadgeData(badgeId);
  }

  /**
   * 更新星球状态
   */
  updatePlanetStatus() {
    // 颜色星球
    var colorStats = gameStorage.getPlanetStats('color');
    var colorStars = document.getElementById('color-stars');
    if (colorStars) {
      colorStars.textContent = colorStats.totalStars;
    }

    // 形状星球 - 检查是否解锁
    var shapePlanet = document.querySelector('[data-planet="shape"]');
    if (shapePlanet) {
      var isUnlocked = gameStorage.checkPlanetUnlock(this.progress, 'shape');
      if (isUnlocked) {
        shapePlanet.classList.remove('locked');
      }
    }

    // 数字星球 - 检查是否解锁
    var numberPlanet = document.querySelector('[data-planet="number"]');
    if (numberPlanet) {
      var isUnlocked = gameStorage.checkPlanetUnlock(this.progress, 'number');
      if (isUnlocked) {
        numberPlanet.classList.remove('locked');
      }
    }
  }

  /**
   * 处理星球点击
   */
  handlePlanetClick(planet, element) {
    // 检查是否锁定
    if (element.classList.contains('locked')) {
      uiManager.showToast('这个星球还未解锁哦!');
      audioManager.playError();
      return;
    }

    // 只有颜色星球在MVP阶段可用
    if (planet !== 'color') {
      uiManager.showToast('这个星球即将开放!');
      return;
    }

    this.currentPlanet = planet;
    this.navigateToLevelSelect(planet);
  }

  /**
   * 导航到关卡选择页面
   */
  navigateToLevelSelect(planet) {
    var homePage = document.getElementById('home-page');
    var levelSelectPage = document.getElementById('level-select-page');

    if (!homePage || !levelSelectPage) return;

    // 更新标题
    var planetTitle = document.getElementById('planet-title');
    if (planetTitle) {
      var planetNames = {
        'color': '颜色星球',
        'shape': '形状星球',
        'number': '数字星球'
      };
      planetTitle.textContent = planetNames[planet] || '未知星球';
    }

    // 渲染关卡列表
    this.renderLevelList(planet);

    // 切换页面
    homePage.classList.remove('active');
    levelSelectPage.classList.add('active');

    // 绑定关卡点击事件
    this.bindLevelClickEvents();
  }

  /**
   * 渲染关卡列表
   */
  renderLevelList(planet) {
    var levels = [];

    // 获取该星球的所有关卡
    for (var i = 1; i <= 5; i++) {
      var levelId = `${planet}_${i}`;
      var levelData = this.progress.levels[levelId];

      if (levelData) {
        levels.push({
          id: levelId,
          name: this.getLevelName(planet, i),
          status: levelData.status,
          bestStars: levelData.bestStars
        });
      }
    }

    uiManager.renderLevelList(levels, planet);
  }

  /**
   * 获取关卡名称
   */
  getLevelName(planet, level) {
    var levelNames = {
      'color': ['基础色识别', '颜色分类', '颜色配对', '深浅色区分', '综合挑战'],
      'shape': ['基础形状', '形状分类', '形状配对', '形状组合', '综合挑战'],
      'number': ['认识数字', '数数', '比较大小', '简单加法', '综合挑战']
    };

    if (levelNames[planet] && levelNames[planet][level - 1]) {
      return levelNames[planet][level - 1];
    }

    return `第${level}关`;
  }

  /**
   * 绑定关卡点击事件
   */
  bindLevelClickEvents() {
    var levelCards = document.querySelectorAll('.level-card');

    levelCards.forEach(function(card) {
      card.addEventListener('click', function() {
        var levelId = card.dataset.levelId;
        this.handleLevelClick(levelId, card);
      });
    });
  }

  /**
   * 处理关卡点击
   */
  handleLevelClick(levelId, element) {
    // 检查是否锁定
    if (element.classList.contains('locked')) {
      uiManager.showToast('这一关还未解锁哦!');
      audioManager.playError();
      return;
    }

    // 跳转到游戏页面
    this.navigateToGame(levelId);
  }

  /**
   * 导航到游戏页面
   */
  navigateToGame(levelId) {
    // 将levelId传递给游戏页面
    window.location.href = `game.html?level=${levelId}`;
  }

  /**
   * 导航到家长面板
   */
  navigateToParent() {
    window.location.href = 'parent.html';
  }

  /**
   * 导航回首页
   */
  navigateHome() {
    var homePage = document.getElementById('home-page');
    var levelSelectPage = document.getElementById('level-select-page');

    if (!homePage || !levelSelectPage) return;

    levelSelectPage.classList.remove('active');
    homePage.classList.add('active');

    // 重新渲染首页
    this.renderHomePage();
  }

  /**
   * 显示倒计时弹窗
   */
  showTimerModal() {
    var modal = document.getElementById('timer-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.updateTimerOptions();
    }
  }

  /**
   * 隐藏倒计时弹窗
   */
  hideTimerModal() {
    var modal = document.getElementById('timer-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * 更新倒计时选项状态
   */
  updateTimerOptions() {
    var options = document.querySelectorAll('.timer-option');
    options.forEach(function(option) {
      var minutes = parseInt(option.dataset.minutes);
      if (minutes === this.timerDuration / 60) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * 设置倒计时
   */
  setTimer(minutes) {
    // 清除旧定时器
    this.clearTimer();

    if (minutes === 0) {
      // 关闭倒计时
      this.timerDuration = 0;
      this.timeLeft = 0;
      this.hideTimerDisplay();
      uiManager.showToast('已关闭倒计时');
    } else {
      // 设置新倒计时
      this.timerDuration = minutes * 60;
      this.timeLeft = this.timerDuration;
      this.showTimerDisplay();
      this.startTimer();
      uiManager.showToast(`设置${minutes}分钟倒计时`);
    }

    // 保存到LocalStorage
    this.saveTimerSetting();
  }

  /**
   * 开始倒计时
   */
  startTimer() {
    if (this.timeLeft <= 0) return;

    this.timer = setInterval(function() {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.onTimerEnd();
      }
    }, 1000);
  }

  /**
   * 清除定时器
   */
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 更新倒计时显示
   */
  updateTimerDisplay() {
    var minutes = Math.floor(this.timeLeft / 60);
    var seconds = this.timeLeft % 60;
    var timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    var timerValue = document.getElementById('timer-value');
    if (timerValue) {
      timerValue.textContent = timeStr;
    }

    // 少于1分钟时变红
    var timerDisplay = document.getElementById('timer-display');
    if (timerDisplay && this.timeLeft <= 60) {
      timerDisplay.style.color = '#FF6B6B';
    }
  }

  /**
   * 显示倒计时
   */
  showTimerDisplay() {
    var timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.style.display = 'flex';
    }
    this.updateTimerDisplay();
  }

  /**
   * 隐藏倒计时
   */
  hideTimerDisplay() {
    var timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
      timerDisplay.style.display = 'none';
    }
  }

  /**
   * 倒计时结束
   */
  onTimerEnd() {
    this.clearTimer();
    this.playBreakSound();
    this.showBreakModal();
  }

  /**
   * 显示休息提醒
   */
  showBreakModal() {
    var modal = document.getElementById('break-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  /**
   * 隐藏休息提醒
   */
  hideBreakModal() {
    var modal = document.getElementById('break-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * 播放休息提示音
   */
  playBreakSound() {
    // 使用Web Speech API
    if ('speechSynthesis' in window) {
      var utterance = new SpeechSynthesisUtterance('时间到啦!该休息一下了!');
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  /**
   * 保存倒计时设置
   */
  saveTimerSetting() {
    var config = gameStorage.getConfig();
    config.timerDuration = this.timerDuration;
    gameStorage.saveConfig(config);
  }

  /**
   * 切换声音
   */
  toggleAudio() {
    var config = gameStorage.getConfig();
    config.audioEnabled = !config.audioEnabled;
    gameStorage.saveConfig(config);
    this.updateAudioButton();
    uiManager.showToast(config.audioEnabled ? '🔊 声音已开启' : '🔇 声音已关闭');
  }

  /**
   * 更新声音按钮状态
   */
  updateAudioButton() {
    var audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
      var config = gameStorage.getConfig();
      if (config.audioEnabled) {
        audioToggle.textContent = '🔊';
        audioToggle.classList.remove('muted');
      } else {
        audioToggle.textContent = '';
        audioToggle.classList.add('muted');
      }
    }
  }

  /**
   * 加载倒计时设置
   */
  loadTimerSetting() {
    // 先清除旧的定时器
    this.clearTimer();

    var config = gameStorage.getConfig();
    if (config.timerDuration && config.timerDuration > 0) {
      this.timerDuration = config.timerDuration;
      this.timeLeft = this.timerDuration;
      this.showTimerDisplay();
      this.startTimer();
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  var app = new App();
  app.init();

  // 暴露到全局
  window.app = app;
});
