/**
 * 益智游戏 - 游戏核心逻辑
 * 兼容iOS 9
 */

var STAR_THRESHOLDS = { THREE_STARS: 0.9, TWO_STARS: 0.7, ONE_STAR: 0.5 };

function Game() {
  this.levelId = null;
  this.levelData = null;
  this.questions = [];
  this.currentQuestionIndex = 0;
  this.startTime = null;
  this.correctCount = 0;
  this.stars = 0;
  this.isAnswering = false;
}

Game.prototype.init = function() {
  console.log('游戏初始化...');
  this.levelId = this.getLevelIdFromUrl();
  if (!this.levelId) {
    alert('关卡ID错误!');
    window.location.href = 'index.html';
    return;
  }
  uiManager.init();
  this.bindEvents();
  var self = this;
  this.loadLevelData(function() {
    self.startGame();
  });
  console.log('游戏初始化完成');
};

Game.prototype.getLevelIdFromUrl = function() {
  var params = window.location.search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    if (pair[0] === 'level') return decodeURIComponent(pair[1]);
  }
  return null;
};

Game.prototype.loadLevelData = function(callback) {
  var planet = this.levelId.split('_')[0];
  var folderMap = { 'color': 'color', 'shape': 'shape', 'number': 'number' };
  var folder = folderMap[planet] || 'color';
  var url = 'data/questions/' + folder + '/' + this.levelId + '.json';
  var self = this;
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('application/json');
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          var data = JSON.parse(xhr.responseText);
          self.levelData = data;
          self.questions = data.questions;
          console.log('关卡数据加载成功:', data);
          callback();
        } catch (e) {
          console.error('解析JSON失败:', e);
          alert('加载关卡数据失败!');
          window.location.href = 'index.html';
        }
      } else {
        console.error('加载失败:', xhr.status);
        alert('加载关卡数据失败!');
        window.location.href = 'index.html';
      }
    }
  };
  xhr.onerror = function() {
    alert('加载关卡数据失败!');
    window.location.href = 'index.html';
  };
  xhr.send();
};

Game.prototype.bindEvents = function() {
  var self = this;
  var exitBtn = document.getElementById('exit-game');
  if (exitBtn) {
    exitBtn.addEventListener('click', function() {
      if (confirm('确定要退出当前关卡吗?')) window.location.href = 'index.html';
    });
  }
  var playBtn = document.getElementById('play-instruction');
  if (playBtn) {
    playBtn.addEventListener('click', function() { self.playInstruction(); });
  }
  var retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function() { self.retryLevel(); });
  }
  var nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() { self.goToNextLevel(); });
  }
  var backBtn = document.getElementById('back-to-map');
  if (backBtn) {
    backBtn.addEventListener('click', function() { window.location.href = 'index.html'; });
  }
  var optionsArea = document.getElementById('options-area');
  if (optionsArea) {
    optionsArea.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target !== optionsArea) {
        if (target.className && target.className.indexOf && target.className.indexOf('option-card') !== -1) break;
        target = target.parentNode;
      }
      if (target && target !== optionsArea && !self.isAnswering) {
        var optionId = target.getAttribute('data-option-id');
        self.handleAnswer(optionId);
      }
    });
  }
};

Game.prototype.startGame = function() {
  this.currentQuestionIndex = 0;
  this.correctCount = 0;
  this.stars = 0;
  this.startTime = Date.now();
  uiManager.updateProgress(0, this.questions.length);
  uiManager.updateStarCount(0);
  this.showCurrentQuestion();
};

Game.prototype.showCurrentQuestion = function() {
  if (this.currentQuestionIndex >= this.questions.length) {
    this.endGame();
    return;
  }
  var question = this.questions[this.currentQuestionIndex];
  uiManager.showQuestion(question);
  this.playInstruction();
  uiManager.updateProgress(this.currentQuestionIndex, this.questions.length);
};

Game.prototype.playInstruction = function() {
  var question = this.questions[this.currentQuestionIndex];
  if ('speechSynthesis' in window) {
    var utterance = new SpeechSynthesisUtterance(question.instruction);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
};

Game.prototype.handleAnswer = function(optionId) {
  if (this.isAnswering) return;
  this.isAnswering = true;
  var question = this.questions[this.currentQuestionIndex];
  var isCorrect = optionId === question.correct;
  uiManager.showOptionFeedback(optionId, isCorrect);
  if (!isCorrect) {
    var self = this;
    setTimeout(function() { uiManager.showOptionFeedback(question.correct, true); }, 500);
  }
  var feedbackMessage = isCorrect ? this.getRandomPraise() : (question.feedback.error || '再试试!');
  var self = this;
  setTimeout(function() { uiManager.showFeedback(isCorrect, feedbackMessage); }, 500);
  if (isCorrect) {
    this.correctCount++;
    this.stars++;
    uiManager.updateStarCount(this.stars);
  }
  setTimeout(function() {
    self.currentQuestionIndex++;
    self.isAnswering = false;
    if (self.currentQuestionIndex >= self.questions.length) {
      self.endGame();
    } else {
      self.showCurrentQuestion();
    }
  }, 2000);
};

Game.prototype.getRandomPraise = function() {
  var praises = ['真棒!', '太厉害了!', '你真聪明!', '做得好!', '太了不起了!', '你是小天才!', '完美!', '非常棒!'];
  return praises[Math.floor(Math.random() * praises.length)];
};

Game.prototype.endGame = function() {
  var totalTime = (Date.now() - this.startTime) / 1000;
  var accuracy = this.correctCount / this.questions.length;
  this.stars = this.calculateStars(accuracy, totalTime);
  gameStorage.updateLevelProgress(this.levelId, this.stars, totalTime, this.correctCount, this.questions.length);
  var newBadges = gameStorage.checkAchievementBadges();
  if (this.stars === 3) {
    var levelBadge = gameStorage.unlockBadge(this.levelId);
    if (levelBadge) newBadges.push(levelBadge);
  }
  var message = this.getSettlementMessage(this.stars);
  uiManager.showSettlement({ stars: this.stars, accuracy: accuracy, time: totalTime, message: message, newBadges: newBadges });
  this.updateSettlementButtons();
};

Game.prototype.calculateStars = function(accuracy, time) {
  if (accuracy >= STAR_THRESHOLDS.THREE_STARS) return 3;
  if (accuracy >= STAR_THRESHOLDS.TWO_STARS) return 2;
  if (accuracy >= STAR_THRESHOLDS.ONE_STAR) return 1;
  return 0;
};

Game.prototype.getSettlementMessage = function(stars) {
  var messages = { 3: '太棒了!全部正确!你是小天才!', 2: '做得很好!继续努力!', 1: '继续努力,你可以的!', 0: '再试一次吧,加油!' };
  return messages[stars] || '';
};

Game.prototype.updateSettlementButtons = function() {
  var nextBtn = document.getElementById('next-btn');
  var retryBtn = document.getElementById('retry-btn');
  var nextLevelId = this.getNextLevelId();
  if (!nextLevelId || this.stars === 0) {
    if (nextBtn) nextBtn.style.display = 'none';
  }
  if (this.stars === 3 && retryBtn) {
    retryBtn.style.display = 'none';
  }
};

Game.prototype.getNextLevelId = function() {
  var match = this.levelId.match(/(\w+)_(\d+)/);
  if (!match) return null;
  var planet = match[1];
  var currentLevel = parseInt(match[2]);
  var nextLevel = currentLevel + 1;
  var nextLevelId = planet + '_' + nextLevel;
  var progress = gameStorage.getProgress();
  if (progress.levels[nextLevelId]) return nextLevelId;
  return null;
};

Game.prototype.retryLevel = function() {
  uiManager.hideSettlement();
  this.startGame();
};

Game.prototype.goToNextLevel = function() {
  var nextLevelId = this.getNextLevelId();
  if (nextLevelId) {
    window.location.href = 'game.html?level=' + nextLevelId;
  } else {
    window.location.href = 'index.html';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var game = new Game();
  game.init();
  window.game = game;
});
