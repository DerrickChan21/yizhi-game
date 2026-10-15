/**
 * 益智游戏 - 家长面板
 * 查看进度、管理功能
 */

class ParentPanel {
  constructor() {
    this.isVerified = false;
    this.verifyQuestion = null;
    this.verifyAnswer = null;
  }

  /**
   * 初始化
   */
  init() {
    console.log('家长面板初始化...');

    // 生成验证题目
    this.generateVerifyQuestion();

    // 绑定事件
    this.bindEvents();

    // 渲染验证界面
    this.renderVerifyQuestion();

    console.log('家长面板初始化完成');
  }

  /**
   * 生成验证题目
   */
  generateVerifyQuestion() {
    // 简单的算术题
    var num1 = Math.floor(Math.random() * 10) + 1;
    var num2 = Math.floor(Math.random() * 10) + 1;
    var operators = ['+', '-'];
    var operator = operators[Math.floor(Math.random() * operators.length)];

    if (operator === '+') {
      this.verifyAnswer = num1 + num2;
    } else {
      // 确保结果不为负数
      if (num1 < num2) {
        this.verifyAnswer = num2 - num1;
        this.verifyQuestion = `${num2} ${operator} ${num1} = ?`;
      } else {
        this.verifyAnswer = num1 - num2;
      }
    }

    if (!this.verifyQuestion) {
      this.verifyQuestion = `${num1} ${operator} ${num2} = ?`;
    }
  }

  /**
   * 渲染验证题目
   */
  renderVerifyQuestion() {
    var questionEl = document.getElementById('verify-question');
    if (questionEl) {
      questionEl.textContent = this.verifyQuestion;
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 取消按钮
    var cancelBtn = document.getElementById('verify-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        this.goBack();
      });
    }

    // 确认按钮
    var confirmBtn = document.getElementById('verify-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        this.handleVerify();
      });
    }

    // 回车键确认
    var answerInput = document.getElementById('verify-answer');
    if (answerInput) {
      answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          this.handleVerify();
        }
      });
    }

    // 返回按钮
    var backBtn = document.getElementById('back-to-game');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        this.goBack();
      });
    }

    // 重置颜色星球
    var resetColorBtn = document.getElementById('reset-color-levels');
    if (resetColorBtn) {
      resetColorBtn.addEventListener('click', function() {
        this.resetPlanet('color');
      });
    }

    // 重置全部
    var resetAllBtn = document.getElementById('reset-all');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', function() {
        this.resetAll();
      });
    }

    // 音效开关
    var audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
      var config = gameStorage.getConfig();
      audioToggle.checked = config.audioEnabled;

      audioToggle.addEventListener('change', function(e) {
        audioManager.toggleAudio(e.target.checked);
      });
    }

    // 音量滑块
    var volumeSlider = document.getElementById('volume-slider');
    var volumeValue = document.getElementById('volume-value');
    if (volumeSlider && volumeValue) {
      var config = gameStorage.getConfig();
      volumeSlider.value = config.sfxVolume * 100;
      volumeValue.textContent = `${Math.round(config.sfxVolume * 100)}%`;

      volumeSlider.addEventListener('input', function(e) {
        var volume = e.target.value / 100;
        audioManager.setVolume(volume);
        volumeValue.textContent = `${Math.round(volume * 100)}%`;
      });
    }
  }

  /**
   * 处理验证
   */
  handleVerify() {
    var answerInput = document.getElementById('verify-answer');
    if (!answerInput) return;

    var userAnswer = parseInt(answerInput.value);

    if (isNaN(userAnswer)) {
      alert('请输入答案!');
      return;
    }

    if (userAnswer === this.verifyAnswer) {
      this.isVerified = true;
      this.showParentContent();
    } else {
      alert('答案错误,请重新计算!');
      answerInput.value = '';
      answerInput.focus();
    }
  }

  /**
   * 显示家长面板内容
   */
  showParentContent() {
    var verifyEl = document.getElementById('parent-verify');
    var contentEl = document.getElementById('parent-content');

    if (verifyEl) {
      verifyEl.classList.add('hidden');
    }

    if (contentEl) {
      contentEl.classList.remove('hidden');
    }

    // 渲染内容
    this.renderStats();
    this.renderLevelList();
    this.renderRecentPlays();
  }

  /**
   * 渲染统计信息
   */
  renderStats() {
    var progress = gameStorage.getProgress();

    // 总星星数
    var totalStarsEl = document.getElementById('parent-total-stars');
    if (totalStarsEl) {
      totalStarsEl.textContent = progress.stats.totalStars;
    }

    // 完成关卡数
    var completedLevelsEl = document.getElementById('parent-completed-levels');
    if (completedLevelsEl) {
      var completed = 0;
      Object.keys(progress.levels).forEach(function(levelId) {
        if (progress.levels[levelId].status === 'completed') {
          completed++;
        }
      });
      completedLevelsEl.textContent = completed;
    }

    // 平均正确率
    var accuracyEl = document.getElementById('parent-accuracy');
    if (accuracyEl) {
      accuracyEl.textContent = `${Math.round(progress.stats.averageAccuracy * 100)}%`;
    }

    // 总游玩次数
    var totalPlaysEl = document.getElementById('parent-total-plays');
    if (totalPlaysEl) {
      totalPlaysEl.textContent = progress.stats.totalPlays;
    }
  }

  /**
   * 渲染关卡列表
   */
  renderLevelList() {
    var levelListEl = document.getElementById('level-list');
    if (!levelListEl) return;

    var progress = gameStorage.getProgress();
    levelListEl.innerHTML = '';

    var planets = [
      { id: 'color', name: '颜色星球', icon: '🎨' },
      { id: 'shape', name: '形状星球', icon: '🔷' },
      { id: 'number', name: '数字星球', icon: '🔢' }
    ];

    planets.forEach(function(planet) {
      // 星球标题
      var planetHeader = document.createElement('div');
      planetHeader.style.cssText = `
        font-size: 20px;
        font-weight: bold;
        margin: 20px 0 10px 0;
        padding: 10px;
        background: #f0f0f0;
        border-radius: 8px;
      `;
      planetHeader.textContent = `${planet.icon} ${planet.name}`;
      levelListEl.appendChild(planetHeader);

      // 关卡列表
      for (var i = 1; i <= 5; i++) {
        var levelId = `${planet.id}_${i}`;
        var level = progress.levels[levelId];

        if (!level) continue;

        var item = document.createElement('div');
        item.className = 'level-list-item';

        // 图标
        var icon = document.createElement('div');
        icon.className = 'level-list-icon';
        icon.textContent = planet.icon;
        item.appendChild(icon);

        // 信息
        var info = document.createElement('div');
        info.className = 'level-list-info';

        var name = document.createElement('div');
        name.className = 'level-list-name';
        name.textContent = `第${i}关`;
        info.appendChild(name);

        var stats = document.createElement('div');
        stats.className = 'level-list-stats';
        stats.textContent = `尝试次数: ${level.attempts} | 最佳用时: ${level.bestTime ? Math.round(level.bestTime) + '秒' : '无'}`;
        info.appendChild(stats);

        item.appendChild(info);

        // 星星
        var starsContainer = document.createElement('div');
        starsContainer.className = 'level-list-stars';

        for (var j = 0; j < 3; j++) {
          var star = document.createElement('div');
          star.className = 'level-list-star';
          if (j < level.bestStars) {
            star.classList.add('earned');
          }
          star.textContent = '⭐';
          starsContainer.appendChild(star);
        }

        item.appendChild(starsContainer);

        levelListEl.appendChild(item);
      }
    });
  }

  /**
   * 渲染最近游玩
   */
  renderRecentPlays() {
    var recentPlaysEl = document.getElementById('recent-plays-list');
    if (!recentPlaysEl) return;

    var progress = gameStorage.getProgress();
    recentPlaysEl.innerHTML = '';

    if (!progress.playHistory || progress.playHistory.length === 0) {
      recentPlaysEl.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无游玩记录</p>';
      return;
    }

    // 显示最近10条
    var recentHistory = progress.playHistory.slice(-10).reverse();

    recentHistory.forEach(function(record) {
      var item = document.createElement('div');
      item.className = 'recent-play-item';

      // 日期
      var date = document.createElement('div');
      date.className = 'recent-play-date';
      date.textContent = record.date;
      item.appendChild(date);

      // 关卡
      var level = document.createElement('div');
      level.className = 'recent-play-level';
      var levelNames = {
        'color_1': '颜色星球 - 第1关',
        'color_2': '颜色星球 - 第2关',
        'color_3': '颜色星球 - 第3关',
        'color_4': '颜色星球 - 第4关',
        'color_5': '颜色星球 - 第5关'
      };
      level.textContent = levelNames[record.level] || record.level;
      item.appendChild(level);

      // 星星
      var starsContainer = document.createElement('div');
      starsContainer.className = 'recent-play-stars';

      for (var i = 0; i < 3; i++) {
        var star = document.createElement('div');
        star.className = 'recent-play-star';
        star.textContent = i < record.stars ? '⭐' : '☆';
        starsContainer.appendChild(star);
      }

      item.appendChild(starsContainer);

      recentPlaysEl.appendChild(item);
    });
  }

  /**
   * 重置星球进度
   */
  resetPlanet(planet) {
    if (!confirm(`确定要重置${planet === 'color' ? '颜色' : planet === 'shape' ? '形状' : '数字'}星球的进度吗?`)) {
      return;
    }

    var success = gameStorage.resetPlanet(planet);

    if (success) {
      alert('重置成功!');
      this.renderStats();
      this.renderLevelList();
      this.renderRecentPlays();
    } else {
      alert('重置失败!');
    }
  }

  /**
   * 重置全部进度
   */
  resetAll() {
    if (!confirm('确定要重置全部进度吗?\\n这将清空所有星星和徽章记录!')) {
      return;
    }

    if (!confirm('再次确认: 这个操作不可恢复!')) {
      return;
    }

    var success = gameStorage.resetAll();

    if (success) {
      alert('重置成功!');
      this.renderStats();
      this.renderLevelList();
      this.renderRecentPlays();
    } else {
      alert('重置失败!');
    }
  }

  /**
   * 返回
   */
  goBack() {
    if (document.referrer && document.referrer.includes('game.html')) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  var parentPanel = new ParentPanel();
  parentPanel.init();

  // 暴露到全局
  window.parentPanel = parentPanel;
});
