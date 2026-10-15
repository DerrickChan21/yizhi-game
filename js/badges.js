/**
 * 益智游戏 - 徽章墙
 * 展示所有徽章,分类筛选,查看详情
 */

class BadgesPage {
  constructor() {
    this.allBadges = [];
    this.unlockedBadges = [];
    this.currentCategory = 'all';
  }

  /**
   * 初始化
   */
  async init() {
    console.log('徽章墙初始化...');

    // 加载徽章数据
    this.allBadges = await gameStorage.getAllBadges();
    this.unlockedBadges = gameStorage.getUnlockedBadges();

    // 绑定事件
    this.bindEvents();

    // 渲染统计
    this.renderStats();

    // 渲染徽章
    this.renderBadges();

    console.log('徽章墙初始化完成');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 返回按钮
    var backBtn = document.getElementById('back-to-home');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
      });
    }

    // 分类标签
    var tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        this.switchCategory(btn.dataset.category);
        // 更新active状态
        tabBtns.forEach(function(b) { b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 关闭弹窗
    var closeBtn = document.getElementById('badge-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        this.hideModal();
      });
    }

    // 点击背景关闭弹窗
    var modal = document.getElementById('badge-modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          this.hideModal();
        }
      });
    }
  }

  /**
   * 切换分类
   */
  switchCategory(category) {
    this.currentCategory = category;
    this.renderBadges();
  }

  /**
   * 渲染统计
   */
  renderStats() {
    var totalBadges = document.getElementById('total-badges');
    var totalProgress = document.getElementById('total-progress');

    if (totalBadges) {
      totalBadges.textContent = this.unlockedBadges.length;
    }

    if (totalProgress) {
      totalProgress.textContent = `${this.unlockedBadges.length}/${this.allBadges.length}`;
    }
  }

  /**
   * 渲染徽章
   */
  renderBadges() {
    var grid = document.getElementById('badges-grid');
    var emptyState = document.getElementById('empty-state');

    if (!grid) return;

    grid.innerHTML = '';

    // 过滤徽章
    var filteredBadges = this.allBadges;
    if (this.currentCategory !== 'all') {
      filteredBadges = this.allBadges.filter(function(badge) { return badge.category === this.currentCategory);
    }

    // 如果没有徽章
    if (filteredBadges.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // 渲染每个徽章
    filteredBadges.forEach(badgfunction(e) {
      var isUnlocked = this.unlockedBadges.includes(badge.id);
      var card = this.createBadgeCard(badge, isUnlocked);
      grid.appendChild(card);
    });
  }

  /**
   * 创建徽章卡片
   */
  createBadgeCard(badge, isUnlocked) {
    var card = document.createElement('div');
    card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.dataset.badgeId = badge.id;

    var emoji = document.createElement('div');
    emoji.className = 'badge-card-emoji';
    emoji.textContent = isUnlocked ? badge.emoji : '';
    card.appendChild(emoji);

    // 已获得的显示名称,未获得的不显示
    if (isUnlocked) {
      var name = document.createElement('div');
      name.className = 'badge-card-name';
      name.textContent = badge.name;
      card.appendChild(name);
    }

    // 点击查看详情
    card.addEventListener('click', function() {
      this.showBadgeDetail(badge, isUnlocked);
    });

    return card;
  }

  /**
   * 显示徽章详情
   */
  showBadgeDetail(badge, isUnlocked) {
    var modal = document.getElementById('badge-modal');
    var emoji = document.getElementById('badge-detail-emoji');
    var name = document.getElementById('badge-detail-name');
    var category = document.getElementById('badge-detail-category');
    var desc = document.getElementById('badge-detail-desc');
    var condition = document.getElementById('badge-detail-condition');
    var rarity = document.getElementById('badge-detail-rarity');

    if (!modal) return;

    emoji.textContent = isUnlocked ? badge.emoji : '?';
    name.textContent = isUnlocked ? badge.name : '???';

    var categoryNames = {
      'color': '颜色星球',
      'shape': '形状星球',
      'number': '数字星球',
      'achievement': '成就'
    };
    category.textContent = categoryNames[badge.category] || '其他';

    desc.textContent = isUnlocked ? badge.description : '完成挑战解锁此徽章';

    var rarityNames = {
      'common': '普通',
      'uncommon': '优秀',
      'rare': '稀有',
      'epic': '史诗'
    };
    condition.textContent = `获取条件: ${badge.condition}`;

    rarity.textContent = rarityNames[badge.rarity] || '普通';
    rarity.className = `badge-detail-rarity ${badge.rarity}`;

    modal.classList.remove('hidden');
  }

  /**
   * 隐藏弹窗
   */
  hideModal() {
    var modal = document.getElementById('badge-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  var badgesPage = new BadgesPage();
  badgesPage.init();

  // 暴露到全局
  window.badgesPage = badgesPage;
});
