function BadgesPage() {
  this.allBadges = [];
  this.unlockedBadges = [];
  this.currentCategory = 'all';
}

BadgesPage.prototype.init = function() {
  console.log('徽章墙初始化...');
  var self = this;
  this.loadBadges(function() {
    self.unlockedBadges = gameStorage.getUnlockedBadges();
    self.bindEvents();
    self.renderStats();
    self.renderBadges();
    console.log('徽章墙初始化完成');
  });
};

BadgesPage.prototype.loadBadges = function(callback) {
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('application/json');
  xhr.open('GET', 'data/badges.json', true);
  var self = this;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          var data = JSON.parse(xhr.responseText);
          self.allBadges = data.badges;
          callback();
        } catch (e) { callback(); }
      } else { callback(); }
    }
  };
  xhr.onerror = function() { callback(); };
  xhr.send();
};

BadgesPage.prototype.bindEvents = function() {
  var self = this;
  var backBtn = document.getElementById('back-to-home');
  if (backBtn) backBtn.addEventListener('click', function() { window.location.href = 'index.html'; });
  var tabBtns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < tabBtns.length; i++) {
    (function(btn) {
      btn.addEventListener('click', function() {
        self.switchCategory(btn.getAttribute('data-category'));
        for (var j = 0; j < tabBtns.length; j++) tabBtns[j].className = tabBtns[j].className.replace(' active', '');
        btn.className += ' active';
      });
    })(tabBtns[i]);
  }
  var closeBtn = document.getElementById('badge-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', function() { self.hideModal(); });
  var modal = document.getElementById('badge-modal');
  if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) self.hideModal(); });
};

BadgesPage.prototype.switchCategory = function(category) {
  this.currentCategory = category;
  this.renderBadges();
};

BadgesPage.prototype.renderStats = function() {
  var totalBadges = document.getElementById('total-badges');
  var totalProgress = document.getElementById('total-progress');
  if (totalBadges) totalBadges.textContent = this.unlockedBadges.length;
  if (totalProgress) totalProgress.textContent = this.unlockedBadges.length + '/' + this.allBadges.length;
};

BadgesPage.prototype.renderBadges = function() {
  var grid = document.getElementById('badges-grid');
  var emptyState = document.getElementById('empty-state');
  if (!grid) return;
  grid.innerHTML = '';
  var filteredBadges = this.allBadges;
  if (this.currentCategory !== 'all') {
    filteredBadges = [];
    for (var i = 0; i < this.allBadges.length; i++) {
      if (this.allBadges[i].category === this.currentCategory) filteredBadges.push(this.allBadges[i]);
    }
  }
  if (filteredBadges.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  for (var i = 0; i < filteredBadges.length; i++) {
    var badge = filteredBadges[i];
    var isUnlocked = this.unlockedBadges.indexOf(badge.id) !== -1;
    var card = this.createBadgeCard(badge, isUnlocked);
    grid.appendChild(card);
  }
};

BadgesPage.prototype.createBadgeCard = function(badge, isUnlocked) {
  var card = document.createElement('div');
  card.className = 'badge-card ' + (isUnlocked ? 'unlocked' : 'locked');
  card.setAttribute('data-badge-id', badge.id);
  var emoji = document.createElement('div');
  emoji.className = 'badge-card-emoji';
  emoji.textContent = isUnlocked ? badge.emoji : '';
  card.appendChild(emoji);
  if (isUnlocked) {
    var name = document.createElement('div');
    name.className = 'badge-card-name';
    name.textContent = badge.name;
    card.appendChild(name);
  }
  var self = this;
  card.addEventListener('click', function() { self.showBadgeDetail(badge, isUnlocked); });
  return card;
};

BadgesPage.prototype.showBadgeDetail = function(badge, isUnlocked) {
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
  var categoryNames = { 'color': '颜色星球', 'shape': '形状星球', 'number': '数字星球', 'achievement': '成就' };
  category.textContent = categoryNames[badge.category] || '其他';
  desc.textContent = isUnlocked ? badge.description : '完成挑战解锁此徽章';
  var rarityNames = { 'common': '普通', 'uncommon': '优秀', 'rare': '稀有', 'epic': '史诗' };
  condition.textContent = '获取条件: ' + badge.condition;
  rarity.textContent = rarityNames[badge.rarity] || '普通';
  rarity.className = 'badge-detail-rarity ' + badge.rarity;
  modal.className = modal.className.replace(' hidden', '');
};

BadgesPage.prototype.hideModal = function() {
  var modal = document.getElementById('badge-modal');
  if (modal) modal.className += ' hidden';
};

document.addEventListener('DOMContentLoaded', function() {
  var badgesPage = new BadgesPage();
  badgesPage.init();
  window.badgesPage = badgesPage;
});
