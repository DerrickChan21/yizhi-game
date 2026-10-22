# 快速启动与访问

> 最后更新：2026-10-22（iOS 9 兼容修复完成）
> 已删除早期的 `game-standalone.html`（旧版单文件第 1 关，不含 iOS 9 修复）。

---

## 一、已经部署好的线上地址（直接用）

| 用途 | 地址 |
| --- | --- |
| 自有服务器（推荐给 iPad） | `http://43.138.217.160/` |
| GitHub Pages（只读备份） | `https://derrickchan21.github.io/yizhi-game/` |

在 iPad Safari 里打开上面任意一个即可，建议加到主屏幕当 App 用。

---

## 二、本地跑起来（改代码时用）

整站是纯静态文件，但**必须通过 HTTP 打开**，不能双击 html 文件（`file://` 下浏览器会拦截读取题库 JSON）。

**Windows**：双击 `start-server.bat`

**或用 Python**：
```bash
cd 益智游戏
python -m http.server 8000
```

**或用 Node**：
```bash
npx http-server -p 8000
```

然后浏览器打开 `http://localhost:8000`（入口是 `index.html`，不是别的文件）。

---

## 三、iPad 测试

1. 电脑和 iPad 连同一个 WiFi
2. 电脑上启动本地服务器（上一节）
3. 查电脑内网 IP：`ipconfig` → 看 IPv4，如 `192.168.1.100`
4. iPad Safari 打开 `http://192.168.1.100:8000`

> 注意：iPad 上**不要**用微信/QQ 传 html 文件直接打开，那样是 `file://` 协议，题库读不出来。

---

## 四、页面结构

| 文件 | 作用 |
| --- | --- |
| `index.html` | 首页（三个星球入口 + 家长查看） |
| `game.html` | 答题页（`?planet=color&level=1`） |
| `parent.html` | 家长面板（算术题验证后进入） |
| `badges.html` | 徽章墙 |
| `ios9-diag.html` | 旧设备自检页（iOS 9 排查用，日常不用管） |

---

## 五、当前游戏内容（真实状态）

- **三个星球全部可玩**：颜色 → 形状 → 数字，每个 5 关，共 15 关。
- **解锁链**：通完颜色 5 关解锁形状，通完形状 5 关解锁数字。
- 题库在 `data/questions/{color,shape,number}/xxx_1~5.json`，共 15 个文件。
- 进度存在浏览器 localStorage，换浏览器 / 清缓存会丢。

---

## 六、常见问题

**Q: 点击没反应、弹窗也不弹？**
A: 先确认是通过 `http://` 打开的，不是双击文件。若在旧 iPad（iOS 9）上，打开 `ios9-diag.html` 看是哪一步失败。

**Q: 没有声音？**
A: 首次进入需点击画面任意位置解锁音频（iOS 的限制）；`audio/` 目录目前没有音频文件，不影响游戏。

**Q: 关卡卡片是空白/没图形？**
A: 说明题库 JSON 没加载成功，检查是否走了 `file://` 或服务器 MIME 类型不对。

**Q: 形状星球/数字星球是灰的？**
A: 正常，说明前面的星球还没通关。通关条件见上一节解锁链。

**Q: 家长面板进不去？**
A: 需要答对一道两位数加法题（防孩子误入）。

---

## 七、部署与排错文档

- 服务器部署：`E:\Workbuddy\果果益智游戏\部署指引-宝塔.md`
- iOS 9 修复记录：`E:\Workbuddy\果果益智游戏\iOS9适配-修改点清单.md`
- 上传包：`E:\Workbuddy\果果益智游戏\部署包\game-iOS9.zip`（33 个文件，解压即站点根目录）
