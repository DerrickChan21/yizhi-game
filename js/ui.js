function UIManager() {
  this.feedbackLayer = null;
  this.settlementLayer = null;
}

UIManager.prototype.init = function() {
  this.feedbackLayer = document.getElementById('feedback-layer');
  this.settlementLayer = document.getElementById('settlement-layer');
};

UIManager.prototype.showQuestion = function(question) {
  var instructionEl = document.getElementById('instruction');
  var optionsArea = document.getElementById('options-area');
  if (!instructionEl || !optionsArea) return;
  instructionEl.textContent = question.instruction;
  optionsArea.innerHTML = '';
  if (question.options.length > 4) {
    optionsArea.className += ' three-columns';
  } else {
    optionsArea.className = optionsArea.className.replace(' three-columns', '');
  }
  for (var i = 0; i < question.options.length; i++) {
    var option = question.options[i];
    var card = this.createOptionCard(option, i);
    optionsArea.appendChild(card);
  }
};

/* ------------------------------------------------------------
   颜色题不再依赖 emoji 字体
   iOS 9 内置的 emoji 字体缺 🟢🟡🟠🟣（Unicode 12 才加入），会渲染成
   空心方框。颜色是这几道题的唯一题干，空白等于题目不成立。
   这里把所有"色环"字符统一换成 CSS 画的实心圆，
   色值与题库 hex 字段保持一致。
   ------------------------------------------------------------ */
var COLOR_CIRCLE_HEX = {
  '🔴': '#FF0000',
  '🟠': '#FFA500',
  '🟡': '#FFFF00',
  '🟢': '#00FF00',
  '🔵': '#0000FF',
  '🟣': '#800080'
};

/* 按码点拆字符，避免把 emoji 的代理对拆成两半 */
function splitByCodePoint(text) {
  var out = [];
  var i = 0;
  var code;
  while (i < text.length) {
    code = text.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      out.push(text.substring(i, i + 2));
      i += 2;
    } else {
      out.push(text.charAt(i));
      i += 1;
    }
  }
  return out;
}

UIManager.prototype.createColorSwatch = function(hex) {
  var dot = document.createElement('span');
  dot.className = 'color-swatch';
  dot.style.backgroundColor = hex;
  return dot;
};

/* 形状题用几何字符渲染。
   圆形/方形/三角形/星形本来就没法用 emoji 表达（数据里 emoji 是空串），
   ● ■ ▲ ★ 是普通文字符号，任何字体都有，不依赖 emoji 字体，
   在 iOS 9 上和现在的浏览器上长得一样。 */
var SHAPE_GLYPH = {
  circle: '●',
  square: '■',
  triangle: '▲',
  star: '★'
};

/* 选项的图形节点：纯色画圆，混合内容逐字符替换 */
UIManager.prototype.createOptionVisual = function(option) {
  var wrap, chars, hex, buf, i, changed;
  var count, glyph;

  if (option.shape && SHAPE_GLYPH[option.shape]) {
    wrap = document.createElement('div');
    wrap.className = 'option-emoji';
    glyph = SHAPE_GLYPH[option.shape];
    count = option.shapeCount || 1;
    for (i = 0; i < count; i++) {
      wrap.appendChild(document.createTextNode(glyph));
    }
    return wrap;
  }

  if (option.hex) {
    wrap = document.createElement('div');
    wrap.className = 'option-emoji';
    wrap.appendChild(this.createColorSwatch(option.hex));
    return wrap;
  }
  if (!option.emoji) return null;

  wrap = document.createElement('div');
  wrap.className = 'option-emoji';
  chars = splitByCodePoint(String(option.emoji));
  buf = '';
  changed = false;
  for (i = 0; i < chars.length; i++) {
    hex = COLOR_CIRCLE_HEX[chars[i]];
    if (hex) {
      changed = true;
      if (buf) {
        wrap.appendChild(document.createTextNode(buf));
        buf = '';
      }
      wrap.appendChild(this.createColorSwatch(hex));
    } else {
      buf += chars[i];
    }
  }
  if (buf) wrap.appendChild(document.createTextNode(buf));
  if (!changed && !buf) return null;
  return wrap;
};

UIManager.prototype.createOptionCard = function(option, index) {
  var card = document.createElement('div');
  var visual;
  card.className = 'option-card';
  card.setAttribute('data-option-id', option.id);
  visual = this.createOptionVisual(option);
  if (visual) card.appendChild(visual);
  if (option.label) {
    var label = document.createElement('div');
    label.className = 'option-label';
    label.textContent = option.label;
    card.appendChild(label);
  }
  return card;
};

UIManager.prototype.showFeedback = function(isCorrect, message) {
  if (!this.feedbackLayer) return;
  var iconEl = document.getElementById('feedback-icon');
  var textEl = document.getElementById('feedback-text');
  iconEl.textContent = isCorrect ? '✓' : '✗';
  iconEl.className = 'feedback-icon ' + (isCorrect ? 'correct' : 'wrong');
  textEl.textContent = message;
  this.feedbackLayer.className = this.feedbackLayer.className.replace(' hidden', '');
  if (isCorrect) audioManager.playCorrect();
  else audioManager.playError();
  var self = this;
  setTimeout(function() { self.feedbackLayer.className += ' hidden'; }, 1000);
};

UIManager.prototype.showSettlement = function(result) {
  if (!this.settlementLayer) return;
  var stars = result.stars, accuracy = result.accuracy, time = result.time, message = result.message, newBadges = result.newBadges;
  var emojiEl = document.getElementById('settlement-emoji');
  if (stars === 3) emojiEl.textContent = '🎉';
  else if (stars >= 2) emojiEl.textContent = '😊';
  else if (stars >= 1) emojiEl.textContent = '👍';
  else emojiEl.textContent = '💪';
  document.getElementById('settlement-title-text').textContent = stars >= 1 ? '关卡完成!' : '再试一次!';
  for (var i = 1; i <= 3; i++) {
    var starEl = document.getElementById('star-' + i);
    if (i <= stars) (function(el, delay) { setTimeout(function() { el.className += ' earned'; }, delay); })(starEl, i * 300);
    else starEl.className = starEl.className.replace(' earned', '');
  }
  document.getElementById('accuracy').textContent = Math.round(accuracy * 100) + '%';
  document.getElementById('time-used').textContent = Math.round(time) + '秒';
  document.getElementById('settlement-message').textContent = message;
  if (newBadges && newBadges.length > 0) this.showNewBadges(newBadges);
  this.settlementLayer.className = this.settlementLayer.className.replace(' hidden', '');
  if (stars === 3) audioManager.playCelebrate();
  else if (stars >= 1) audioManager.playPraise();
};

UIManager.prototype.hideSettlement = function() {
  if (!this.settlementLayer) return;
  this.settlementLayer.className += ' hidden';
};

UIManager.prototype.showNewBadges = function(badges) {
  if (document.querySelector('.badge-celebration')) return;
  var modal = document.createElement('div');
  modal.className = 'modal badge-celebration';
  modal.style.zIndex = '9999';
  var badge = badges[0];
  var badgeData = GameStorage.getBadgeData(badge.id);
  modal.innerHTML = '<div class="modal-content badge-content"><div class="badge-emoji">' + badgeData.emoji + '</div><h2 class="badge-title">恭喜获得新徽章!</h2><div class="badge-name">' + badgeData.name + '</div><p class="badge-desc">' + badgeData.description + '</p><button class="btn-primary" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)">太棒了!</button></div>';
  document.body.appendChild(modal);
  audioManager.playCelebrate();
  setTimeout(function() { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 3000);
};

UIManager.prototype.updateProgress = function(current, total) {
  var progressDots = document.getElementById('progress-dots');
  if (!progressDots) return;
  progressDots.innerHTML = '';
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i < current) dot.className += ' completed';
    else if (i === current) dot.className += ' current';
    progressDots.appendChild(dot);
  }
};

UIManager.prototype.updateStarCount = function(stars) {
  var starCountEl = document.getElementById('current-stars');
  if (starCountEl) starCountEl.textContent = stars;
};

UIManager.prototype.showOptionFeedback = function(optionId, isCorrect) {
  var optionCard = document.querySelector('[data-option-id="' + optionId + '"]');
  if (!optionCard) return;
  if (isCorrect) optionCard.className += ' correct';
  else optionCard.className += ' wrong';
  var self = this;
  setTimeout(function() { optionCard.className = optionCard.className.replace(' correct', '').replace(' wrong', ''); }, 1000);
};

UIManager.prototype.showToast = function(message, duration) {
  duration = duration || 2000;
  var toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px 40px;border-radius:12px;font-size:24px;z-index:9999;';
  document.body.appendChild(toast);
  setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, duration);
};

UIManager.prototype.renderLevelList = function(levels, planet) {
  var levelsGrid = document.querySelector('.levels-grid');
  if (!levelsGrid) return;
  levelsGrid.innerHTML = '';
  for (var i = 0; i < levels.length; i++) {
    var level = levels[i];
    var card = document.createElement('div');
    card.className = 'level-card';
    card.setAttribute('data-level-id', level.id);
    if (level.status === 'locked') card.className += ' locked';
    else if (level.status === 'completed') card.className += ' completed';
    var number = document.createElement('div');
    number.className = 'level-number';
    number.textContent = i + 1;
    card.appendChild(number);
    var starsContainer = document.createElement('div');
    starsContainer.className = 'level-stars';
    for (var j = 0; j < 3; j++) {
      var star = document.createElement('div');
      star.className = 'level-star';
      if (j < level.bestStars) star.className += ' earned';
      star.textContent = '⭐';
      starsContainer.appendChild(star);
    }
    card.appendChild(starsContainer);
    var name = document.createElement('div');
    name.className = 'level-name';
    name.textContent = level.name || '第' + (i + 1) + '关';
    card.appendChild(name);
    levelsGrid.appendChild(card);
  }
};

var uiManager = new UIManager();
