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
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    // 分类标签
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchCategory(btn.dataset.category);
        // 更新active状态
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 关闭弹窗
    const closeBtn = document.getElementById('badge-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideModal();
      });
    }

    // 点击背景关闭弹窗
    const modal = document.getElementById('badge-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
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
    const totalBadges = document.getElementById('total-badges');
    const totalProgress = document.getElementById('total-progress');

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
    const grid = document.getElementById('badges-grid');
    const emptyState = document.getElementById('empty-state');

    if (!grid) return;

    grid.innerHTML = '';

    // 过滤徽章
    let filteredBadges = this.allBadges;
    if (this.currentCategory !== 'all') {
      filteredBadges = this.allBadges.filter(badge => badge.category === this.currentCategory);
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
    filteredBadges.forEach(badge => {
      const isUnlocked = this.unlockedBadges.includes(badge.id);
      const card = this.createBadgeCard(badge, isUnlocked);
      grid.appendChild(card);
    });
  }

  /**
   * 创建徽章卡片
   */
  createBadgeCard(badge, isUnlocked) {
    const card = document.createElement('div');
    card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.dataset.badgeId = badge.id;

    const emoji = document.createElement('div');
    emoji.className = 'badge-card-emoji';
    emoji.textContent = isUnlocked ? badge.emoji : '?';
    card.appendChild(emoji);

    const name = document.createElement('div');
    name.className = 'badge-card-name';
    name.textContent = isUnlocked ? badge.name : '???';
    card.appendChild(name);

    const status = document.createElement('div');
    status.className = 'badge-card-status';
    status.textContent = isUnlocked ? '已获得' : '未获得';
    card.appendChild(status);

    // 点击查看详情
    card.addEventListener('click', () => {
      this.showBadgeDetail(badge, isUnlocked);
    });

    return card;
  }

  /**
   * 显示徽章详情
   */
  showBadgeDetail(badge, isUnlocked) {
    const modal = document.getElementById('badge-modal');
    const emoji = document.getElementById('badge-detail-emoji');
    const name = document.getElementById('badge-detail-name');
    const category = document.getElementById('badge-detail-category');
    const desc = document.getElementById('badge-detail-desc');
    const condition = document.getElementById('badge-detail-condition');
    const rarity = document.getElementById('badge-detail-rarity');

    if (!modal) return;

    emoji.textContent = isUnlocked ? badge.emoji : '?';
    name.textContent = isUnlocked ? badge.name : '???';

    const categoryNames = {
      'color': '颜色星球',
      'shape': '形状星球',
      'number': '数字星球',
      'achievement': '成就'
    };
    category.textContent = categoryNames[badge.category] || '其他';

    desc.textContent = isUnlocked ? badge.description : '完成挑战解锁此徽章';

    const rarityNames = {
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
    const modal = document.getElementById('badge-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  const badgesPage = new BadgesPage();
  badgesPage.init();

  // 暴露到全局
  window.badgesPage = badgesPage;
});
