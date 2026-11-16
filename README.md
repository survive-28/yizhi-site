# 颐智科技 YIZHI — 公司官网 & W100 产品发布会站点

> 参赛用「模拟公司」站点。纯静态站点，零构建、零依赖，可直接拖到 Netlify 上线，也可放在 GitHub 上做版本管理与自动部署。
>
> 品牌与数字全部来自团队既有材料：`展会设计/00_事实底座.md`、`output/brand/颐智科技_品牌释义卡_A4_中英_v1.docx`、`路演与谈判/YIZHI_W100_路演与谈判备赛计划_v1.0.md`。**对外口径以事实底座为准**。

---

## 1. 站点结构

```
website/
├─ index.html            首页：公司介绍 · 产品简介 · 产品即将发布 · 联系方式
├─ launch.html           发布会专页：倒计时 · 发布信息 · 展位与负责人 · 报名 · FAQ
├─ thank-you.html        表单提交成功页
├─ 404.html              自定义 404
├─ netlify.toml          Netlify 构建/缓存/安全头/表单配置
├─ robots.txt / sitemap.xml
└─ assets/
   ├─ css/site.css       设计系统（色板、排版、组件、响应式）
   ├─ css/pages.css      发布会专页组件
   ├─ js/site.js         导航、中英切换、倒计时、滚动动效、日历下载、表单
   └─ img/               logo（横版/反白/标志）、产品图
```

## 2. 本地预览

任选一种：

```bash
# 方式一：Python 自带的静态服务器
python -m http.server 8765 --directory website
# 打开 http://127.0.0.1:8765
```

```bash
# 方式二：直接双击 index.html（表单提交在本地无效，属正常）
```

## 3. 三种上线方式

### A. 最快：Netlify Drop（30 秒，无需 Git）

1. 打开 <https://app.netlify.com/drop>
2. 把整个 `website` 文件夹拖进页面
3. 拿到形如 `https://xxx-yyy-123.netlify.app` 的地址，可立即分享/投屏

### B. 推荐：GitHub 仓库 + Netlify 自动部署（改一次、自动更新）

1. 在 GitHub 新建仓库（例如 `yizhi-site`，Public 或 Private 均可，**不要**勾选初始化 README）
2. 在 `website` 目录里执行：

```bash
git remote add origin https://github.com/<你的用户名>/yizhi-site.git
git branch -M main
git push -u origin main
```

3. 打开 <https://app.netlify.com> → **Add new site → Import an existing project → GitHub**
4. 选择 `yizhi-site`：
   - **Build command**：留空
   - **Publish directory**：留空（或填 `.`）
5. Deploy site。此后每次 `git push`，Netlify 自动重新发布；每个 Pull Request 还会生成预览链接。

### C. 命令行：Netlify CLI

```bash
npm i -g netlify-cli
netlify login
cd website
netlify deploy --prod --dir .
```

> 以上三种方式互不冲突。A 用来「今天就要链接」，B 用来「长期维护」。

## 4. 表单（Netlify Forms）

两个表单已按 Netlify 规范埋好，部署后自动出现在 **Site → Forms**：

| 表单名 | 位置 | 字段 |
|---|---|---|
| `contact` | 首页「联系我们」 | name / company / email / country / interest / message / consent |
| `launch-registration` | 发布会页「预约席位」 | name / company / email / country / attendance / message / consent |

- 提交成功跳转 `thank-you.html`
- 已含蜜罐字段 `bot-field` 防垃圾提交
- 免费版每月 100 次提交；可在 Netlify 后台设置邮件/Webhook 通知

## 5. 上线前要改的三处

| 位置 | 现在的内容 | 要改成 |
|---|---|---|
| 联系方式 | 邮箱 `yizhi_technology@126.com`（全站统一）；展会负责人 林博铖（展会总监）`+86 180 5068 4286` | 如需增加固定电话/办公地址，替换 `#contact` 列表即可 |
| 发布会时间 | `2026-11-24 15:00`（首页与发布会页各一处 `data-launch`；地点：学思楼 SA308，同日展位 SA407） | 与组委会最终确认后统一替换 |
| 域名 | `yizhi-care.com`（sitemap、JSON-LD、页脚） | 自定义域名或保留 `*.netlify.app` |

改日期只需全局搜索 `2026-11-24` 与 `24 Nov 2026`。

> 发布会流程与台上安排尚未定稿，站点先留了一句「稍后公布」，等文件定稿后再补 `index.html` 的 `.agenda` 与 `launch.html` 的流程区块。

## 6. 设计说明（可直接写进计划书/答辩）

- **色板**：颐智深绿 `#005B3E`、香槟金 `#C59B3A`、暖白 `#FDFBF8`、正文深灰 `#3C3C3C`，全部取自品牌释义卡；正文对比度 ≥ 8:1，符合适老阅读。
- **母题**：六段时间环（logo 同构）在首屏以 120 秒一圈缓慢转动，金色一段代表「此刻该吃的那一次药」。
- **双语**：默认英文（发布会为全英文场景），右上角可切中文；实现为 `data-zh` 属性 + 原生 JS，无第三方依赖、无构建。
- **可访问性**：跳转链接、焦点样式、`aria-*`、`prefers-reduced-motion` 降级、44px 触控目标。
- **性能**：单页 CSS/JS 合计 < 40 KB，图片仅一张产品图（并做了裁剪压缩），无外部字体与 CDN 请求 —— 展厅网络不稳也能秒开。

## 7. 内容口径与合规

- 只使用事实底座中**真实存在**的资质：发明专利 ZL 2016 1 1021195.3、实用新型 ZL 2019 2 1235778.5、3 件商标（第 10/21/35 类）。
- **不出现** CE / FCC / RoHS / FDA 已获证表述，统一写 `Compliance in progress`。
- 全站不出现诊断、治疗、疗效类表述，页脚有明确声明。
- 数字（6 仓 / 6 传感器 / 5 分钟 / 30 秒 / 1200 mAh / 约 60 天待机 / 210 g / 2 年质保）与事实底座逐条对齐。

## 8. 自检清单

- [ ] 390 / 768 / 1440 三个宽度无横向滚动
- [ ] 中英切换后无残留英文/中文混排
- [ ] 倒计时按 `data-launch` 正确跳动（跨时区不会错）
- [ ] 两个表单在 Netlify 后台能收到测试提交
- [ ] 所有 `href="#..."` 锚点都能跳到对应板块
- [ ] 页面在手机 Safari / 微信内置浏览器打开正常
