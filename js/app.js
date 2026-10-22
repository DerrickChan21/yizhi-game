/**
 * 益智游戏 - 应用入口
 * 兼容iOS 9
 */

function App() {
  this.currentPage = 'home';
  this.currentPlanet = null;
  this.progress = null;
  this.timer = null;
  this.timeLeft = 0;
  this.timerDuration = 0;
}

App.prototype.init = function() {
  console.log('应用初始化...');
  this.progress = gameStorage.getProgress();
  uiManager.init();
  this.bindEvents();
  this.renderHomePage();
  this.loadTimerSetting();
  console.log('应用初始化完成');
};

App.prototype.bindEvents = function() {
  alert('bindEvents开始');
  var self = this;
  var audioToggle = document.getElementById('audio-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', function() { self.toggleAudio(); });
    this.updateAudioButton();
  }
  var timerBtn = document.getElementById('timer-btn');
  if (timerBtn) {
    timerBtn.addEventListener('click', function() { self.showTimerModal(); });
  }
  var timerClose = document.getElementById('timer-close');
  if (timerClose) {
    timerClose.addEventListener('click', function() { self.hideTimerModal(); });
  }
  var timerOptions = document.querySelectorAll('.timer-option');
  for (var i = 0; i < timerOptions.length; i++) {
    (function(option) {
      option.addEventListener('click', function() {
        var minutes = parseInt(option.getAttribute('data-minutes'));
        self.setTimer(minutes);
        self.hideTimerModal();
      });
    })(timerOptions[i]);
  }
  var breakOk = document.getElementById('break-ok');
  if (breakOk) {
    breakOk.addEventListener('click', function() { self.hideBreakModal(); });
  }
  var badgeBtn = document.getElementById('badge-btn');
  if (badgeBtn) {
    badgeBtn.addEventListener('click', function() { window.location.href = 'badges.html'; });
  }
  var parentBtn = document.getElementById('parent-btn');
  if (parentBtn) {
    parentBtn.addEventListener('click', function() { self.navigateToParent(); });
  }
  var backBtn = document.getElementById('back-to-home');
  if (backBtn) {
    backBtn.addEventListener('click', function() { self.navigateHome(); });
  }
  alert('找到星球元素');
  var planetItems = document.querySelectorAll('.planet-item');
  alert('星球数量:' + planetItems.length);
  for (var i = 0; i < planetItems.length; i++) {
    (function(item) {
      item.addEventListener('click', function() {
        var planet = item.getAttribute('data-planet');
        alert('点击星球:' + planet);
        self.handlePlanetClick(planet, item);
      });
    })(planetItems[i]);
  }
};

App.prototype.renderHomePage = function() {
  this.updateStats();
  this.updatePlanetStatus();
};

App.prototype.updateStats = function() {
  var totalStars = document.getElementById('total-stars');
  var completedLevels = document.getElementById('completed-levels');
  if (totalStars) totalStars.textContent = this.progress.stats.totalStars;
  if (completedLevels) {
    var completed = 0;
    var levelIds = Object.keys(this.progress.levels);
    for (var i = 0; i < levelIds.length; i++) {
      if (this.progress.levels[levelIds[i]].status === 'completed') completed++;
    }
    completedLevels.textContent = completed;
  }
  var lastBadge = gameStorage.getLastBadge();
  var lastBadgeContainer = document.getElementById('last-badge-container');
  var lastBadgeIcon = document.getElementById('last-badge-icon');
  if (lastBadge && lastBadgeContainer && lastBadgeIcon) {
    var badgeData = this.getBadgeData(lastBadge.id);
    lastBadgeIcon.textContent = badgeData.emoji;
    lastBadgeContainer.style.display = 'flex';
  }
};

App.prototype.getBadgeData = function(badgeId) {
  return GameStorage.getBadgeData(badgeId);
};

App.prototype.updatePlanetStatus = function() {
  var colorStats = gameStorage.getPlanetStats('color');
  var colorStars = document.getElementById('color-stars');
  if (colorStars) colorStars.textContent = colorStats.totalStars;
  var shapePlanet = document.querySelector('[data-planet="shape"]');
  if (shapePlanet) {
    if (gameStorage.checkPlanetUnlock(this.progress, 'shape')) {
      shapePlanet.className = shapePlanet.className.replace(' locked', '');
    }
  }
  var numberPlanet = document.querySelector('[data-planet="number"]');
  if (numberPlanet) {
    if (gameStorage.checkPlanetUnlock(this.progress, 'number')) {
      numberPlanet.className = numberPlanet.className.replace(' locked', '');
    }
  }
};

App.prototype.handlePlanetClick = function(planet, element) {
  if (element.className.indexOf('locked') !== -1) {
    uiManager.showToast('这个星球还未解锁哦!');
    return;
  }
  this.currentPlanet = planet;
  this.navigateToLevelSelect(planet);
};

App.prototype.navigateToLevelSelect = function(planet) {
  alert('navigateToLevelSelect开始');
  var homePage = document.getElementById('home-page');
  var levelSelectPage = document.getElementById('level-select-page');
  if (!homePage || !levelSelectPage) return;
  var planetTitle = document.getElementById('planet-title');
  if (planetTitle) {
    var planetNames = { 'color': '颜色星球', 'shape': '形状星球', 'number': '数字星球' };
    planetTitle.textContent = planetNames[planet] || '未知星球';
  }
  alert('调用renderLevelList');
  this.renderLevelList(planet);
  homePage.className = homePage.className.replace(' active', '');
  alert('添加active类');
  levelSelectPage.className += ' active';
  this.bindLevelClickEvents();
};

App.prototype.renderLevelList = function(planet) {
  alert('renderLevelList开始,planet=' + planet);
  var levels = [];
  for (var i = 1; i <= 5; i++) {
    var levelId = planet + '_' + i;
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
};

App.prototype.getLevelName = function(planet, level) {
  var levelNames = {
    'color': ['基础色识别', '颜色分类', '颜色配对', '深浅色区分', '综合挑战'],
    'shape': ['基础形状', '形状分类', '形状配对', '形状组合', '综合挑战'],
    'number': ['认识数字', '数数', '比较大小', '简单加法', '综合挑战']
  };
  if (levelNames[planet] && levelNames[planet][level - 1]) {
    return levelNames[planet][level - 1];
  }
  return '第' + level + '关';
};

App.prototype.bindLevelClickEvents = function() {
  alert('bindLevelClickEvents开始');
  var self = this;
  var levelCards = document.querySelectorAll('.level-card');
  for (var i = 0; i < levelCards.length; i++) {
    (function(card) {
      card.addEventListener('click', function() {
        var levelId = card.getAttribute('data-level-id');
        self.handleLevelClick(levelId, card);
      });
    })(levelCards[i]);
  }
};

App.prototype.handleLevelClick = function(levelId, element) {
  if (element.className.indexOf('locked') !== -1) {
    uiManager.showToast('这一关还未解锁哦!');
    return;
  }
  this.navigateToGame(levelId);
};

App.prototype.navigateToGame = function(levelId) {
  window.location.href = 'game.html?level=' + levelId;
};

App.prototype.navigateToParent = function() {
  window.location.href = 'parent.html';
};

App.prototype.navigateHome = function() {
  var homePage = document.getElementById('home-page');
  var levelSelectPage = document.getElementById('level-select-page');
  if (!homePage || !levelSelectPage) return;
  levelSelectPage.className = levelSelectPage.className.replace(' active', '');
  homePage.className += ' active';
  this.renderHomePage();
};

App.prototype.showTimerModal = function() {
  var modal = document.getElementById('timer-modal');
  if (modal) modal.className = modal.className.replace(' hidden', '');
};

App.prototype.hideTimerModal = function() {
  var modal = document.getElementById('timer-modal');
  if (modal) modal.className += ' hidden';
};

App.prototype.updateTimerOptions = function() {
  var options = document.querySelectorAll('.timer-option');
  for (var i = 0; i < options.length; i++) {
    var minutes = parseInt(options[i].getAttribute('data-minutes'));
    if (minutes === this.timerDuration / 60) {
      options[i].className += ' active';
    } else {
      options[i].className = options[i].className.replace(' active', '');
    }
  }
};

App.prototype.setTimer = function(minutes) {
  this.clearTimer();
  if (minutes === 0) {
    this.timerDuration = 0;
    this.timeLeft = 0;
    this.hideTimerDisplay();
    uiManager.showToast('已关闭倒计时');
  } else {
    this.timerDuration = minutes * 60;
    this.timeLeft = this.timerDuration;
    this.showTimerDisplay();
    this.startTimer();
    uiManager.showToast('设置' + minutes + '分钟倒计时');
  }
  this.saveTimerSetting();
};

App.prototype.startTimer = function() {
  if (this.timeLeft <= 0) return;
  var self = this;
  this.timer = setInterval(function() {
    self.timeLeft--;
    self.updateTimerDisplay();
    if (self.timeLeft <= 0) self.onTimerEnd();
  }, 1000);
};

App.prototype.clearTimer = function() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
  }
};

App.prototype.updateTimerDisplay = function() {
  var minutes = Math.floor(this.timeLeft / 60);
  var seconds = this.timeLeft % 60;
  var timeStr = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  var timerValue = document.getElementById('timer-value');
  if (timerValue) timerValue.textContent = timeStr;
  var timerDisplay = document.getElementById('timer-display');
  if (timerDisplay && this.timeLeft <= 60) timerDisplay.style.color = '#FF6B6B';
};

App.prototype.showTimerDisplay = function() {
  var timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.style.display = 'flex';
  this.updateTimerDisplay();
};

App.prototype.hideTimerDisplay = function() {
  var timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.style.display = 'none';
};

App.prototype.onTimerEnd = function() {
  this.clearTimer();
  this.playBreakSound();
  this.showBreakModal();
};

App.prototype.showBreakModal = function() {
  var modal = document.getElementById('break-modal');
  if (modal) modal.className = modal.className.replace(' hidden', '');
};

App.prototype.hideBreakModal = function() {
  var modal = document.getElementById('break-modal');
  if (modal) modal.className += ' hidden';
};

App.prototype.playBreakSound = function() {
  if ('speechSynthesis' in window) {
    var utterance = new SpeechSynthesisUtterance('时间到啦!该休息一下了!');
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
};

App.prototype.saveTimerSetting = function() {
  var config = gameStorage.getConfig();
  config.timerDuration = this.timerDuration;
  gameStorage.saveConfig(config);
};

App.prototype.loadTimerSetting = function() {
  this.clearTimer();
  var config = gameStorage.getConfig();
  if (config.timerDuration && config.timerDuration > 0) {
    this.timerDuration = config.timerDuration;
    this.timeLeft = this.timerDuration;
    this.showTimerDisplay();
    this.startTimer();
  }
};

App.prototype.toggleAudio = function() {
  var config = gameStorage.getConfig();
  config.audioEnabled = !config.audioEnabled;
  gameStorage.saveConfig(config);
  this.updateAudioButton();
  uiManager.showToast(config.audioEnabled ? ' 声音已开启' : '🔇 声音已关闭');
};

App.prototype.updateAudioButton = function() {
  var audioToggle = document.getElementById('audio-toggle');
  if (audioToggle) {
    var config = gameStorage.getConfig();
    if (config.audioEnabled) {
      audioToggle.textContent = '🔊';
      audioToggle.className = audioToggle.className.replace(' muted', '');
    } else {
      audioToggle.textContent = '';
      if (audioToggle.className.indexOf('muted') === -1) {
        audioToggle.className += ' muted';
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var app = new App();
  app.init();
  window.app = app;
});
