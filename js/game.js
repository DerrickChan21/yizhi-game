/**
 * 益智游戏 - 游戏核心逻辑
 * 处理答题、评分、结算等核心功能
 */

// 星级评定常量
const STAR_THRESHOLDS = {
  THREE_STARS: 0.9,
  TWO_STARS: 0.7,
  ONE_STAR: 0.5
};

class Game {
  constructor() {
    this.levelId = null;
    this.levelData = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.startTime = null;
    this.correctCount = 0;
    this.stars = 0;
    this.isAnswering = false;
  }

  /**
   * 初始化游戏
   */
  async init() {
    console.log('游戏初始化...');

    // 从URL获取关卡ID
    this.levelId = this.getLevelIdFromUrl();

    if (!this.levelId) {
      alert('关卡ID错误!');
      window.location.href = 'index.html';
      return;
    }

    // 初始化UI
    uiManager.init();

    // 绑定事件
    this.bindEvents();

    // 等待数据加载完成
    await this.loadLevelData();

    // 开始游戏(数据加载完成后)
    this.startGame();

    console.log('游戏初始化完成');
  }

  /**
   * 从URL获取关卡ID
   */
  getLevelIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('level');
  }

  /**
   * 加载关卡数据
   */
  async loadLevelData() {
    try {
      // 根据关卡ID确定文件夹
      const planet = this.levelId.split('_')[0];
      const folderMap = {
        'color': 'color',
        'shape': 'shape',
        'number': 'number'
      };
      const folder = folderMap[planet] || 'color';

      // 尝试使用fetch加载(适用于HTTP服务器)
      let data;

      // 检查是否是file://协议
      if (window.location.protocol === 'file:') {
        // file://协议下使用XMLHttpRequest
        data = await this.loadJSONLocal(`data/questions/${folder}/${this.levelId}.json`);
      } else {
        // HTTP协议下使用fetch
        const response = await fetch(`data/questions/${folder}/${this.levelId}.json`);
        if (!response.ok) {
          throw new Error('加载关卡数据失败');
        }
        data = await response.json();
      }

      this.levelData = data;
      this.questions = this.levelData.questions;

      console.log('关卡数据加载成功:', this.levelData);
    } catch (e) {
      console.error('加载关卡数据失败:', e);
      alert('加载关卡数据失败!');
      window.location.href = 'index.html';
    }
  }

  /**
   * 本地加载JSON(用于file://协议)
   */
  loadJSONLocal(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.overrideMimeType('application/json');
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error('加载失败'));
          }
        }
      };
      xhr.onerror = reject;
      xhr.send();
    });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 退出按钮
    const exitBtn = document.getElementById('exit-game');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (confirm('确定要退出当前关卡吗?')) {
          window.location.href = 'index.html';
        }
      });
    }

    // 重听按钮
    const playBtn = document.getElementById('play-instruction');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.playInstruction();
      });
    }

    // 重试按钮
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.retryLevel();
      });
    }

    // 下一关按钮
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToNextLevel();
      });
    }

    // 返回地图按钮
    const backBtn = document.getElementById('back-to-map');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    // 选项点击
    const optionsArea = document.getElementById('options-area');
    if (optionsArea) {
      optionsArea.addEventListener('click', (e) => {
        const optionCard = e.target.closest('.option-card');
        if (optionCard && !this.isAnswering) {
          const optionId = optionCard.dataset.optionId;
          this.handleAnswer(optionId);
        }
      });
    }
  }

  /**
   * 开始游戏
   */
  startGame() {
    this.currentQuestionIndex = 0;
    this.correctCount = 0;
    this.stars = 0;
    this.startTime = Date.now();

    // 更新进度条
    uiManager.updateProgress(0, this.questions.length);
    uiManager.updateStarCount(0);

    // 显示第一题
    this.showCurrentQuestion();
  }

  /**
   * 显示当前题目
   */
  showCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endGame();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];

    // 显示题目
    uiManager.showQuestion(question);

    // 播放题目说明音频(如果有)
    this.playInstruction();

    // 更新进度条
    uiManager.updateProgress(this.currentQuestionIndex, this.questions.length);
  }

  /**
   * 播放题目说明
   */
  playInstruction() {
    const question = this.questions[this.currentQuestionIndex];
    if (question.instructionAudio) {
      // 播放音频文件
      const audio = new Audio(question.instructionAudio);
      audio.play().catch(e => console.warn('播放失败:', e));
    }
    // TODO: 如果没有音频,可以使用Web Speech API朗读
  }

  /**
   * 处理答案
   */
  handleAnswer(optionId) {
    if (this.isAnswering) return;

    this.isAnswering = true;

    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = optionId === question.correct;

    // 显示选项反馈
    uiManager.showOptionFeedback(optionId, isCorrect);

    // 如果答错,也显示正确答案
    if (!isCorrect) {
      setTimeout(() => {
        uiManager.showOptionFeedback(question.correct, true);
      }, 500);
    }

    // 显示反馈
    const feedbackMessage = isCorrect
      ? this.getRandomPraise()
      : question.feedback.error || '再试试!';

    setTimeout(() => {
      uiManager.showFeedback(isCorrect, feedbackMessage);
    }, 500);

    // 记录结果
    if (isCorrect) {
      this.correctCount++;
      this.stars++;
      uiManager.updateStarCount(this.stars);
    }

    // 下一题
    setTimeout(() => {
      this.currentQuestionIndex++;
      this.isAnswering = false;

      if (this.currentQuestionIndex >= this.questions.length) {
        this.endGame();
      } else {
        this.showCurrentQuestion();
      }
    }, 2000);
  }

  /**
   * 获取随机赞扬语句
   */
  getRandomPraise() {
    const praises = [
      '真棒!',
      '太厉害了!',
      '你真聪明!',
      '做得好!',
      '太了不起了!',
      '你是小天才!',
      '完美!',
      '非常棒!'
    ];

    return praises[Math.floor(Math.random() * praises.length)];
  }

  /**
   * 结束游戏
   */
  async endGame() {
    const totalTime = (Date.now() - this.startTime) / 1000; // 秒
    const accuracy = this.correctCount / this.questions.length;

    // 计算星级
    this.stars = this.calculateStars(accuracy, totalTime);

    // 保存进度
    gameStorage.updateLevelProgress(
      this.levelId,
      this.stars,
      totalTime,
      this.correctCount,
      this.questions.length
    );

    // 检查并解锁徽章
    const newBadges = gameStorage.checkAchievementBadges();

    // 关卡徽章(满星获得)
    if (this.stars === 3) {
      const levelBadge = gameStorage.unlockBadge(this.levelId);
      if (levelBadge) {
        newBadges.push(levelBadge);
      }
    }

    // 获取赞扬消息
    const message = this.getSettlementMessage(this.stars);

    // 显示结算(包含徽章信息)
    uiManager.showSettlement({
      stars: this.stars,
      accuracy: accuracy,
      time: totalTime,
      message: message,
      newBadges: newBadges
    });

    // 控制按钮显示
    this.updateSettlementButtons();
  }

  /**
   * 计算星级
   */
  calculateStars(accuracy, time) {
    if (accuracy >= STAR_THRESHOLDS.THREE_STARS) {
      return 3;
    } else if (accuracy >= STAR_THRESHOLDS.TWO_STARS) {
      return 2;
    } else if (accuracy >= STAR_THRESHOLDS.ONE_STAR) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * 获取结算消息
   */
  getSettlementMessage(stars) {
    if (stars === 3) {
      return '太棒了!全部正确!你是小天才!';
    } else if (stars === 2) {
      return '做得很好!继续努力!';
    } else if (stars === 1) {
      return '继续努力,你可以的!';
    } else {
      return '再试一次吧,加油!';
    }
  }

  /**
   * 更新结算按钮
   */
  updateSettlementButtons() {
    const nextBtn = document.getElementById('next-btn');
    const retryBtn = document.getElementById('retry-btn');

    // 检查是否有下一关
    const nextLevelId = this.getNextLevelId();
    if (!nextLevelId || this.stars === 0) {
      // 没有下一关或未通关,隐藏下一关按钮
      if (nextBtn) {
        nextBtn.style.display = 'none';
      }
    }

    // 如果满星,隐藏重试按钮
    if (this.stars === 3 && retryBtn) {
      retryBtn.style.display = 'none';
    }
  }

  /**
   * 获取下一关ID
   */
  getNextLevelId() {
    const match = this.levelId.match(/(\w+)_(\d+)/);
    if (!match) return null;

    const planet = match[1];
    const currentLevel = parseInt(match[2]);
    const nextLevel = currentLevel + 1;

    // 检查是否有下一关
    const nextLevelId = `${planet}_${nextLevel}`;
    const progress = gameStorage.getProgress();

    if (progress.levels[nextLevelId]) {
      return nextLevelId;
    }

    return null;
  }

  /**
   * 重试关卡
   */
  retryLevel() {
    uiManager.hideSettlement();
    this.startGame();
  }

  /**
   * 进入下一关
   */
  goToNextLevel() {
    const nextLevelId = this.getNextLevelId();
    if (nextLevelId) {
      window.location.href = `game.html?level=${nextLevelId}`;
    } else {
      window.location.href = 'index.html';
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();

  // 暴露到全局
  window.game = game;
});
