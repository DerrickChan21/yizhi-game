# 📁 项目文件说明

## 项目结构

```
益智游戏/
│
├── 📄 index.html              # 首页(必须)
├── 📄 game.html               # 游戏页面(必须)
├── 📄 parent.html             # 家长面板(必须)
│
├── 📂 css/                    # 样式文件夹
│   ├── main.css              # 全局样式
│   ├── components.css        # 组件样式
│   ├── game.css              # 游戏界面样式
│   └── parent.css            # 家长面板样式
│
├── 📂 js/                     # JavaScript文件夹
│   ├── storage.js            # 数据层(进度存储)
│   ├── audio.js              # 音频管理
│   ├── ui.js                 # UI交互
│   ├── app.js                # 应用入口(首页)
│   ├── game.js               # 游戏逻辑
│   └── parent.js             # 家长面板逻辑
│
├── 📂 data/                   # 数据文件夹
│   └── questions/            # 题目数据
│       ├── color_1.json      # 第1关题目 ✅
│       ├── color_2.json      # 第2关题目 (待创建)
│       ├── color_3.json      # 第3关题目 (待创建)
│       ├── color_4.json      # 第4关题目 (待创建)
│       └── color_5.json      # 第5关题目 (待创建)
│
├── 📂 audio/                  # 音频文件夹
│   ├── README.md             # 音频说明
│   ├── correct.mp3           # 答对音效 (待添加)
│   ├── error.mp3             # 答错音效 (待添加)
│   └── ...                   # 其他音效
│
├── 📂 docs/                   # 文档文件夹
│   ├── 01-需求调研/
│   │   └── 头脑风暴方案.md
│   └── 02-方案设计/
│       ├── PRD产品需求文档.md
│       └── 技术方案评估报告.md
│
├── 📄 README.md               # 项目说明
├── 📄 START.md                # 快速启动指南 ⭐
├── 📄 TESTING.md              # 测试指南
├── 📄 开发总结.md              # 开发总结
└── 📄 益智游戏.md              # 原始需求文档
```

---

## 核心文件说明

### HTML页面 (3个)

| 文件 | 作用 | 何时访问 |
|------|------|----------|
| `index.html` | 首页地图,选择关卡 | 游戏入口 |
| `game.html` | 答题界面 | 点击关卡后 |
| `parent.html` | 家长面板 | 点击"家长查看" |

### CSS样式 (4个)

| 文件 | 作用 | 大小 |
|------|------|------|
| `main.css` | 全局样式,颜色主题,布局 | ~300行 |
| `components.css` | 按钮、卡片、弹窗等组件 | ~400行 |
| `game.css` | 游戏界面样式 | ~400行 |
| `parent.css` | 家长面板样式 | ~300行 |

### JavaScript模块 (6个)

| 文件 | 作用 | 核心功能 |
|------|------|----------|
| `storage.js` | 数据层 | LocalStorage存储,进度管理 |
| `audio.js` | 音频管理 | iOS Safari适配,音效播放 |
| `ui.js` | UI交互 | DOM操作,动画,反馈展示 |
| `app.js` | 应用入口 | 首页逻辑,页面路由 |
| `game.js` | 游戏逻辑 | 答题、评分、结算 |
| `parent.js` | 家长面板 | 验证、统计、管理 |

### 数据文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `color_1.json` | 第1关题目(5题) | ✅ 已完成 |
| `color_2.json` | 第2关题目 | ⏸️ 待创建 |
| `color_3.json` | 第3关题目 | ⏸️ 待创建 |
| `color_4.json` | 第4关题目 | ⏸️ 待创建 |
| `color_5.json` | 第5关题目 | ⏸️ 待创建 |

---

## 文件大小统计

### 代码量
- **HTML**: 3个文件, ~800行
- **CSS**: 4个文件, ~1400行
- **JavaScript**: 6个文件, ~2000行
- **JSON**: 1个文件, ~200行
- **总计**: ~4400行代码

### 预估大小
- **代码文件**: ~150KB
- **音频文件**: ~200KB (待添加)
- **总计**: ~350KB (非常轻量!)

---

## 文件依赖关系

### HTML依赖
```
index.html
  ├── css/main.css
  ├── css/components.css
  ├── js/storage.js
  ├── js/audio.js
  ├── js/ui.js
  └── js/app.js

game.html
  ├── css/main.css
  ├── css/game.css
  ├── css/components.css
  ├── js/storage.js
  ├── js/audio.js
  ├── js/ui.js
  └── js/game.js

parent.html
  ├── css/main.css
  ├── css/parent.css
  ├── js/storage.js
  └── js/parent.js
```

### JavaScript依赖
```
storage.js (独立)
  ↓
audio.js (依赖storage)
  ↓
ui.js (依赖audio)
  ↓
app.js (依赖storage, audio, ui)
game.js (依赖storage, audio, ui)
parent.js (依赖storage, audio)
```

---

## 重要文件标记

### ⭐ 必须文件
- `index.html` - 游戏入口
- `game.html` - 游戏核心
- `parent.html` - 家长功能
- 所有CSS和JS文件

### 🎵 可选文件
- `audio/*.mp3` - 音频文件(没有也能运行)

### 📝 待创建文件
- `data/questions/color_2.json` ~ `color_5.json`

---

## 部署说明

### 本地使用
直接打开`index.html`即可

### 网络部署
需要上传所有文件到服务器:
- GitHub Pages (推荐)
- Netlify
- Vercel
- 任何静态文件服务器

### 必须上传的文件
```
✅ 所有HTML文件
✅ 所有CSS文件
✅ 所有JS文件
✅ data/文件夹(包括JSON)
✅ audio/文件夹(如果有音频)
❌ docs/文件夹(可选,文档)
❌ *.md文件(可选,文档)
```

---

## 开发指南

### 修改样式
编辑对应的CSS文件:
- 全局样式 → `main.css`
- 游戏界面 → `game.css`
- 组件样式 → `components.css`

### 修改游戏逻辑
编辑 `game.js`:
- 答题处理 → `handleAnswer()`
- 星级计算 → `calculateStars()`
- 结算展示 → `endGame()`

### 添加新关卡
1. 在`data/questions/`创建JSON文件
2. 按照`color_1.json`的格式编写
3. 在`storage.js`的`getDefaultProgress()`中添加关卡ID

### 添加音频
1. 准备MP3文件(<30KB)
2. 放到`audio/`目录
3. 确保文件名与代码中引用的一致

---

## 快速查找

### 想修改某个功能?

| 功能 | 文件 | 函数/位置 |
|------|------|----------|
| 题目展示 | `ui.js` | `showQuestion()` |
| 答题反馈 | `ui.js` | `showFeedback()` |
| 星级计算 | `game.js` | `calculateStars()` |
| 进度保存 | `storage.js` | `saveProgress()` |
| 音效播放 | `audio.js` | `playSound()` |
| 关卡解锁 | `storage.js` | `unlockNextLevel()` |
| 家长验证 | `parent.js` | `handleVerify()` |

---

**项目结构清晰,易于维护和扩展!** 🎉
