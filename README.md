# 颐智科技 YIZHI — 公司官网 & W100 产品发布会站点

> 参赛用「模拟公司」官方静态站点（纯 HTML / CSS / JS，零构建、零外部 CDN 依赖），支持 **EN / DE / 中文** 三语切换，已接入 Git + Netlify 自动发布流程（`https://yizhi-w100.netlify.app`）。

---

## 1. 站点结构

```
website/
├─ index.html            首页：动态六时环 · 公司介绍 · W100 交互闭环模拟 · 三型号矩阵（不涉价）· 出口/合规/SLA · 发布会 · 四人团队与 @yizhi.com 联系矩阵
├─ launch.html           发布会专页：倒计时 · SUIBE SA308 / SA407 Booth C9 · 四人现场团队 · 预约表单 · FAQ
├─ slides/               发布会横向 13 页 Keynote Slides（Three.js 光阑/棱镜动效 + 3D W100 实机演示 + 官方定价；仅在 2026-11-24 14:40 CST 后开放）
├─ slides-locked.html    发布前定时锁页（倒计时至北京时间 2026-11-24 14:40:00，自动同步服务器时间解锁）
├─ netlify/edge-functions/slides-gate.js  Netlify 边缘服务端时间闸门 & `/api/slides-status` 状态接口
├─ thank-you.html        Netlify 表单提交成功页（支持 EN / DE / 中文）
├─ 404.html              自定义 404（支持 EN / DE / 中文）
├─ netlify.toml          Netlify 构建/缓存/Edge Function 路由配置
├─ robots.txt / sitemap.xml
└─ assets/
   ├─ css/site.css       设计系统、动效、W100 交互模拟器与三语切换样式
   ├─ css/pages.css      发布会专页组件样式
   ├─ js/site.js         EN/DE/中文三语引擎、六时环交互、W100 闭环模拟器、多视角图库、表单邮箱分流、倒计时、日历下载
   ├─ js/slides-connector.js  官网首页 / 发布会页与 `/slides/`、`/api/slides-status` 的前端连接器（`window.YIZHI_SLIDES`）
   └─ img/               品牌 SVG Logo、去中文清洗版 W100 多视角产品图与 EN/DE App 界面图
```

## 2. 对外统一联系与口径

- **官网域名**：`https://yizhi-w100.netlify.app`
- **业务分流邮箱（统一 `@yizhi.com`）**：
  - `sales@yizhi.com` — 渠道分销、B2B 合作与 OEM 定制
  - `launch@yizhi.com` — 发布会报名、现场演示与媒体咨询
  - `compliance@yizhi.com` — 欧盟 12 份合规文件包与技术文档核查
  - `rma@yizhi.com` — 24 个月商业质保、备品与 RMA 售后支持
- **现场参展团队（SUIBE 学思楼 SA308 发布会 / SA407 · Booth C9 展位）**：
  - **张涵博 Humbert Zhang**（商务总监 Business Director · `+86 158 7541 5001` · 商务主联系人）
  - **林博铖 Steve Lin**（产品经理 Product Manager · `+86 180 5068 4286`）
  - **陈雨昂 Antique Chen**（物流经理 Logistics Manager · `+86 153 7552 9689`）
  - **胡思想 Shawn Hu**（商务支持经理 Business Support Manager · `+86 147 5136 8973`）
- **保密与合规红线**：
  - 全站严格不展示任何 FOB / CIF / DDP / RRP / 样品单价或毛利数据，统一定调为 **2026 年 11 月 24 日发布会现场揭晓**。
  - 明确老年端 **零屏幕、零按键、无语音指令输入**，由家人通过 2.4 GHz Wi-Fi App 远程配置。
  - 明确依据 EU MDR (EU) 2017/745 Art. 2(1) 主动界定为非医疗器械，开仓记录不证明实际吞服；12 份欧盟合规文件标注为赛事模拟谈判样本（不含 FDA / FCC）。

## 3. 表单（Netlify Forms）

- `contact`（首页）：name / company / email / country / interest / message / consent
- `launch-registration`（发布会页）：name / company / email / country / attendance / message / consent

## 4. 本地预览与发布

```bash
# 本地启动静态服务器（在仓库根目录运行）
python -m http.server 8765 --directory website
```

推送到 GitHub `main` 分支后，Netlify 自动触发零构建部署；也可将 `yizhi-deploy/` 同步用于 Netlify Drop 快速预览。
