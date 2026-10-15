/**
 * 益智游戏 - UI交互管理
 * 处理DOM操作、动画效果、反馈展示
 */

class UIManager {
  constructor() {
    this.feedbackLayer = null;
    this.settlementLayer = null;
  }

  /**
   * 初始化UI
   */
  init() {
    this.feedbackLayer = document.getElementById('feedback-layer');
    this.settlementLayer = document.getElementById('settlement-layer');
  }

  /**
   * 显示题目
   */
  showQuestion(question) {
    const instructionEl = document.getElementById('instruction');
    const optionsArea = document.getElementById('options-area');

    if (!instructionEl || !optionsArea) return;

    // 显示题目说明
    instructionEl.textContent = question.instruction;

    // 清空选项区
    optionsArea.innerHTML = '';

    // 根据选项数量调整布局
    if (question.options.length > 4) {
      optionsArea.classList.add('three-columns');
    } else {
      optionsArea.classList.remove('three-columns');
    }

    // 创建选项卡片
    question.options.forEach((option, index) => {
      const card = this.createOptionCard(option, index);
      optionsArea.appendChild(card);
    });
  }

  /**
   * 创建选项卡片
   */
  createOptionCard(option, index) {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.dataset.optionId = option.id;
    card.dataset.index = index;

    // 根据类型显示不同内容
    if (option.emoji) {
      const emoji = document.createElement('div');
      emoji.className = 'option-emoji';
      emoji.textContent = option.emoji;
      card.appendChild(emoji);
    }

    if (option.label) {
      const label = document.createElement('div');
      label.className = 'option-label';
      label.textContent = option.label;
      card.appendChild(label);
    }

    // 如果是颜色选项,显示颜色块
    if (option.hex) {
      const colorBlock = document.createElement('div');
      colorBlock.className = 'color-card';
      colorBlock.style.backgroundColor = option.hex;
      card.appendChild(colorBlock);
    }

    return card;
  }

  /**
   * 显示反馈
   */
  showFeedback(isCorrect, message) {
    if (!this.feedbackLayer) return;

    const iconEl = document.getElementById('feedback-icon');
    const textEl = document.getElementById('feedback-text');

    // 设置图标
    iconEl.textContent = isCorrect ? '✓' : '✗';
    iconEl.className = 'feedback-icon ' + (isCorrect ? 'correct' : 'wrong');

    // 设置文字
    textEl.textContent = message;

    // 显示反馈层
    this.feedbackLayer.classList.remove('hidden');

    // 播放音效
    if (isCorrect) {
      audioManager.playCorrect();
    } else {
      audioManager.playError();
    }

    // 1秒后隐藏
    setTimeout(() => {
      this.feedbackLayer.classList.add('hidden');
    }, 1000);
  }

  /**
   * 显示关卡结算
   */
  showSettlement(result) {
    if (!this.settlementLayer) return;

    const { stars, accuracy, time, message, newBadges } = result;

    // 设置表情
    const emojiEl = document.getElementById('settlement-emoji');
    if (stars === 3) {
      emojiEl.textContent = '🎉';
    } else if (stars >= 2) {
      emojiEl.textContent = '😊';
    } else if (stars >= 1) {
      emojiEl.textContent = '👍';
    } else {
      emojiEl.textContent = '💪';
    }

    // 设置标题
    const titleEl = document.getElementById('settlement-title-text');
    titleEl.textContent = stars >= 1 ? '关卡完成!' : '再试一次!';

    // 设置星星
    for (let i = 1; i <= 3; i++) {
      const starEl = document.getElementById(`star-${i}`);
      if (i <= stars) {
        starEl.classList.add('earned');
        // 延迟动画
        setTimeout(() => {
          starEl.classList.add('earned');
        }, i * 300);
      } else {
        starEl.classList.remove('earned');
      }
    }

    // 设置统计
    document.getElementById('accuracy').textContent = `${Math.round(accuracy * 100)}%`;
    document.getElementById('time-used').textContent = `${Math.round(time)}秒`;

    // 设置消息
    document.getElementById('settlement-message').textContent = message;

    // 显示徽章(如果有新获得的)
    if (newBadges && newBadges.length > 0) {
      this.showNewBadges(newBadges);
    }

    // 显示结算层
    this.settlementLayer.classList.remove('hidden');

    // 播放音效
    if (stars === 3) {
      audioManager.playCelebrate();
    } else if (stars >= 1) {
      audioManager.playPraise();
    }
  }

  /**
   * 隐藏关卡结算
   */
  hideSettlement() {
    if (!this.settlementLayer) return;
    this.settlementLayer.classList.add('hidden');
  }

  /**
   * 显示新获得的徽章
   */
  showNewBadges(badges) {
    // 防止重复弹窗
    if (document.querySelector('.badge-celebration')) {
      return;
    }

    // 创建徽章庆祝弹窗
    const modal = document.createElement('div');
    modal.className = 'modal badge-celebration';
    modal.style.zIndex = '9999';

    const badge = badges[0]; // 显示第一个徽章
    const badgeData = GameStorage.getBadgeData(badge.id);

    modal.innerHTML = `
      <div class="modal-content badge-content">
        <div class="badge-emoji">${badgeData.emoji}</div>
        <h2 class="badge-title">恭喜获得新徽章!</h2>
        <div class="badge-name">${badgeData.name}</div>
        <p class="badge-desc">${badgeData.description}</p>
        <button class="btn-primary" onclick="this.closest('.modal').remove()">太棒了!</button>
      </div>
    `;

    document.body.appendChild(modal);

    // 播放庆祝音效
    audioManager.playCelebrate();

    // 3秒后自动关闭
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 3000);
  }

  /**
   * 更新进度条
   */
  updateProgress(current, total) {
    const progressDots = document.getElementById('progress-dots');
    if (!progressDots) return;

    progressDots.innerHTML = '';

    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';

      if (i < current) {
        dot.classList.add('completed');
      } else if (i === current) {
        dot.classList.add('current');
      }

      progressDots.appendChild(dot);
    }
  }

  /**
   * 更新星星数
   */
  updateStarCount(stars) {
    const starCountEl = document.getElementById('current-stars');
    if (starCountEl) {
      starCountEl.textContent = stars;
    }
  }

  /**
   * 显示选项反馈
   */
  showOptionFeedback(optionId, isCorrect) {
    const optionCard = document.querySelector(`[data-option-id="${optionId}"]`);
    if (!optionCard) return;

    if (isCorrect) {
      optionCard.classList.add('correct');
    } else {
      optionCard.classList.add('wrong');
    }

    // 1秒后移除
    setTimeout(() => {
      optionCard.classList.remove('correct', 'wrong');
    }, 1000);
  }

  /**
   * 显示页面切换动画
   */
  showPageTransition(callback) {
    const app = document.getElementById('app');
    if (!app) {
      callback && callback();
      return;
    }

    app.style.opacity = '0';
    app.style.transform = 'translateY(20px)';

    setTimeout(() => {
      callback && callback();
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';
    }, 300);
  }

  /**
   * 显示 toast 消息
   */
  showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 12px;
      font-size: 24px;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  }

  /**
   * 渲染关卡列表
   */
  renderLevelList(levels, planet) {
    const levelsGrid = document.querySelector('.levels-grid');
    if (!levelsGrid) return;

    levelsGrid.innerHTML = '';

    levels.forEach((level, index) => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.dataset.levelId = level.id;

      if (level.status === 'locked') {
        card.classList.add('locked');
      } else if (level.status === 'completed') {
        card.classList.add('completed');
      }

      // 关卡编号
      const number = document.createElement('div');
      number.className = 'level-number';
      number.textContent = index + 1;
      card.appendChild(number);

      // 星星
      const starsContainer = document.createElement('div');
      starsContainer.className = 'level-stars';

      for (let i = 0; i < 3; i++) {
        const star = document.createElement('div');
        star.className = 'level-star';
        if (i < level.bestStars) {
          star.classList.add('earned');
        }
        star.textContent = '⭐';
        starsContainer.appendChild(star);
      }

      card.appendChild(starsContainer);

      // 关卡名称
      const name = document.createElement('div');
      name.className = 'level-name';
      name.textContent = level.name || `第${index + 1}关`;
      card.appendChild(name);

      levelsGrid.appendChild(card);
    });
  }
}

// 创建全局实例
const uiManager = new UIManager();
