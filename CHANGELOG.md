# Changelog 变更日志

All notable changes to this fork are documented here. This fork tracks
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot); entries below are
local customizations on top of it.

Every change carries one ID (`A001`, `A002`, …) and exactly two paragraphs: one English, then
one Chinese beginning `中文：`. The IDs follow the order the work landed on this fork — A001 is
the earliest, later entries append new numbers — and they are never reused, so a reference like
"A014" keeps pointing at the same change.

本文件记录这个 fork 的所有主要改动，跟随
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot)，下面每条都是在上游之上的本地定制。
每条改动有一个编号（`A001`、`A002`……），固定为两段：先英文、后以「中文：」开头的中文。编号按改动落到本 fork
的先后排列（A001 最早，新改动往后追加），永不复用，所以「A014」这样的引用始终指向同一条改动。

## Unreleased / 未发布

## V0.3 · 2026-11-11 · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

The third personal build: 0.3.0 in the bundle, shown as **V0.3** in the app, still cut from official `v0.1.151`.
It cherry-picks the official commits `949cabedd` (recall Chinese and Japanese notes by the words inside a sentence),
`5beba1276` (every AI provider key in the desktop's encrypted store, migrated to `credentials.bin` on first launch)
and `d48997f07` (a newly connected app is on for your bots). The official commit `f3b00bb86` was evaluated and kept as
an empty commit: it repairs a sandbox-scope regression introduced after `v0.1.151`, and the code it patches
(`advertisedGrants`, the app-sandbox e2e) does not exist on this base. The UI, Chinese strings, Simple-only mode, the
version label and the updater short-circuit are unchanged.

中文：**V0.3，基于官方 v0.1.151，cherry-pick 官方 3 个提交。** 第三个个人构建：打包版本号 0.3.0，应用内显示 **V0.3**，
仍基于官方 `v0.1.151`。本版 cherry-pick 官方提交 `949cabedd`（按句中词召回中日文记忆）、`5beba1276`（桌面端把全部
AI provider 密钥收进系统加密存储，首次启动迁移到 `credentials.bin`）、`d48997f07`（新连接的应用默认对 bot 生效）。
官方 `f3b00bb86` 评估后以空提交保留：它修的是 `v0.1.151` 之后才引入的 sandbox 权限回归，本基线没有它要改的代码
（`advertisedGrants`、app-sandbox e2e）。界面、汉化、Simple-only、版本号与 updater 短路均保持原样。

### A032 · Three official fixes cherry-picked for V0.3

`949cabedd` replaces the whole-phrase matching in the memory search with a CJK word index (`server/cjk-search.ts`), so
a Chinese or Japanese note is recalled by a word inside the sentence; `5beba1276` moves every provider key the desktop
knows into `credentials.bin` through `safeStorage`, migrates the plaintext fields out of `config.json` on the first
packaged launch (encrypted write first, so a failure never loses a secret) and hands them to the server child as
environment variables; `d48997f07` makes a newly connected app usable by a bot once the connection succeeds, with the
line "Your bots can now use {app}." and the stale per-bot note removed from every locale. The fork's MiMo TTS key
(`mimoTtsKey`) stays in the credential allowlist, so all three land without touching the fork's UI or Chinese strings.
Conflicts went to ours: the Chinese `README.md` stays this fork's own file, and `src/types/ogb.d.ts` takes the union of
upstream's provider names and the fork's `mimoTtsKey`.

中文：`949cabedd` 把记忆检索里的整句匹配换成中日文分词索引（`server/cjk-search.ts`），中文、日文笔记可以按句中某个词
召回；`5beba1276` 把桌面端认识的每个 provider 密钥通过 `safeStorage` 收进 `credentials.bin`，打包版首次启动时把
明文从 `config.json` 迁出（先写加密副本，失败不丢密钥），并以环境变量交给 server 子进程；`d48997f07` 让新连接的应用
在连接成功后直接对 bot 生效，显示「Your bots can now use {app}.」，并从所有语言包删掉过时的按 bot 提示。本 fork 的
MiMo TTS 密钥（`mimoTtsKey`）保留在凭据白名单里，三项都落地且没动界面与汉化。冲突一律取我方：中文 `README.md`
保持本仓库自己的版本；`src/types/ogb.d.ts` 取上游 provider 名单与本 fork `mimoTtsKey` 的并集。

### A033 · The key-readback e2e covers the fork's MiMo key slot

The `scripts/testing/key-readback.e2e.test.ts` expectation list now includes `mimoTts`, and the loopback stand-in
answers MiMo's `/models` key check through a new `/mimo` route plus `OMB_MIMO_API`. This fixes a regression that
predates V0.3: `feat/mimo-tts` added the MiMo entry to `KEY_CATALOG` without updating this e2e, which has failed on
`main` since then (reproduced on a clean `5bed5e5d6` worktree), and once listed the check would otherwise reach the
real `api.xiaomimimo.com` from the test.

中文：`scripts/testing/key-readback.e2e.test.ts` 的期望列表补上 `mimoTts`，并让本地回环 stand-in 通过新增的 `/mimo`
路由加 `OMB_MIMO_API` 回应 MiMo 的 `/models` 密钥校验。这修的是 V0.3 之前就存在的问题：`feat/mimo-tts` 往
`KEY_CATALOG` 加了 MiMo 条目却忘了更新这条 e2e，从那以后 `main` 上一直失败（在干净的 `5bed5e5d6` worktree 上同样
复现）；而且补进列表后，这项校验还会去连真的 `api.xiaomimimo.com`。

## V0.2 · 2026-11-11 · 基于官方 v0.1.151 / Based on official v0.1.151

The second personal build: the @ mention chip is centred on the text line without being compressed, the
composer's bottom edge fades the transcript behind the input instead of cutting it, the bot context
menu and the first-reply notice are in Chinese (the duplicated English notice is gone), picture bubbles
keep equal padding on all four sides (including mixed text-and-picture bubbles and their bottoms), and
a white avatar's own bubbles and the composer's two voice buttons turn #3B3B3B with #F5F5F5 ink in dark
mode. The chat header's profile pill lost its › arrow, the sidebar lost the section rule, the chief's
card is square with the row radius, non-chief avatars lost their grey frame, group avatars draw 1.2x
larger, the expanded sidebar's search/inbox/+ buttons moved onto the account's row (its header buttons
and the Connect apps button are hidden), and the sidebar can be hidden behind a thin left-edge handle
that brings the collapsed bar back on click or drag. Simular Box lights up for any enabled, signed-in
Simular MCP whose name contains "simular" (the hosted one is `simular-cloud`).

中文：第二个个人构建：@ 提及 chip 在不变形的前提下与正文中线对齐；输入框下沿改为渐进渐隐（层级在输入框之后、
气泡之上），不再硬裁消息；bot 右键菜单与“首次回复”提示全部汉化，并去掉了重复的英文公告；图片气泡四边内边距一致
（含文字+图片混合气泡的底部），深色模式下白色头像的“我”气泡与输入框两个语音按钮统一为 #3B3B3B 底、#F5F5F5
字/图标。聊天顶部资料胶囊去掉右侧 › 箭头；侧边栏去掉分区横线；主 bot 卡片改为方形并沿用行圆角；非主 bot 头像去掉
灰色外框；群头像整体放大 1.2 倍；展开侧栏的搜索、收件箱、+ 移到用户头像那一行（顶部对应按钮与「连接应用」隐藏）；
侧栏可隐藏为左边缘细长提手，点击或向右拖可唤回收起状态。Simular Box 对任何名含 simular 且已启用、已登录的 MCP
（如 `simular-cloud`）即可用。


### A001 · Sidebar: search and new-chat buttons moved to the bottom

The search button and the `+` button now sit at the bottom of the sidebar, just above the tools/plugins
button instead of at the top. The icon sidebar (`density === "icons"`) moves them into a new
`SidebarBottomActions` component (rendered above the footer, outside the scrolling list, with its `+`
menu opening upward), while the avatar rail (`SidebarSimpleRail.tsx`) gains a `topActions` slot in
`SimpleRailFooter` and keeps its menu opening to the right; the full non-icon list keeps its buttons at
the top, and search still opens the command palette. The updated layout assertions live in
`Sidebar.header.test.ts` and `Sidebar.simple-layout.test.ts`.

中文：侧边栏的搜索和 `+` 按钮从顶部移到底部、工具/插件按钮的正上方。图标侧边栏（`density === "icons"`）
把它们移进新的 `SidebarBottomActions` 组件（渲染在页脚之上、滚动列表之外，`+` 菜单向上弹出）；头像 rail
（`SidebarSimpleRail.tsx`）在 `SimpleRailFooter` 里新增 `topActions` 插槽，菜单仍向右弹；完整（非图标）
侧栏的按钮留在顶部，搜索仍然打开命令面板。

### A002 · Model picker removed from the chat header

`ChatView.tsx` no longer renders `ModelPicker` in the header; the model is chosen from settings instead.
This is a personal-build change and is not intended for upstream; `ChatView.controls.test.ts` no longer expects the header picker.

中文：聊天顶栏不再渲染 `ModelPicker`，模型改在设置里选。这是个人构建的改动，不打算进上游。

### A003 · Every icon in the app is now Remix Icon

`src/lib/icons.tsx` re-exports the 265 names the code imports from `lucide-react` as
`@remixicon/react` components, a Vite `app-icons` plugin resolves `lucide-react` to that file for
modules under `src/`, and the same path mapping in `tsconfig.json` makes the type checker fail on a
name missing from the shim. The wrappers keep the `lucide lucide-<name>` classes, `size` and
`currentColor`; Remix line icons are filled paths, so a call site's `strokeWidth` no longer changes
their weight, and the rule that lightened lucide's 2px stroke has nothing left to affect. Lucide still
draws the sandboxed JSX-page frame (`shared/app-frame/jsx-page.ts`), and `NOTICE` carries the Remix
attribution.

中文：应用里所有图标改用 Remix Icon。`src/lib/icons.tsx` 把代码里从 `lucide-react` 引入的 265 个名字重新
导出为 `@remixicon/react` 组件，Vite 的 `app-icons` 插件把 `src/` 下的 `lucide-react` 解析到该文件，
`tsconfig.json` 的同一路径映射让类型检查也走这份 shim，漏名字会直接报错。包装组件保留
`lucide lucide-<name>` 类名、`size` 与 `currentColor`；Remix 线性图标是填充路径，调用处的 `strokeWidth`
不再改变粗细，原先淡化 lucide 2px 描边的 CSS 也失去作用对象。沙箱 JSX 页面外框仍用 lucide（从 jsDelivr
加载），`NOTICE` 里加了 Remix Icon 的署名。

### A004 · Sidebar: the Inbox entry follows the collapsed layout

In the full sidebar the Inbox row stays at the top; collapsed to icons it now sits at the foot, directly
above search, through an optional `inbox` slot on `SidebarBottomActions`. The avatar rail keeps its own
round Inbox entry using the same `SIMPLE_TOP_BUTTON` as the search button below it, with the count badge
and running dot in place.

中文：收件箱入口跟随折叠布局。完整侧栏里收件箱行仍在顶部；折叠成图标后落到最底部、搜索的正上方，经
`SidebarBottomActions` 新增的可选 `inbox` 插槽传入。头像 rail 用与下方搜索按钮相同的圆形
`SIMPLE_TOP_BUTTON` 保留自己的收件箱入口，计数徽标和运行中的小圆点位置不变。

### A005 · Merged upstream `v0.1.150`

`origin/main` at `a7cf31902` was merged into the fork with no conflicts; the two new lucide names the
release imports, `PhoneCall` and `RadioTower` (`src/lib/hosted-mcp-apps.ts`), were added to
`src/lib/icons.tsx` as `RiPhoneLine` and `RiSignalTowerLine`.

中文：把上游 `v0.1.150`（`origin/main` 在 `a7cf31902`）合并进 fork，无冲突；该版本新引入的两个 lucide
图标名 `PhoneCall`、`RadioTower`（`src/lib/hosted-mcp-apps.ts`）已补进 `src/lib/icons.tsx`，分别用
`RiPhoneLine`、`RiSignalTowerLine` 绘制。

### A006 · Advanced mode's collapsed sidebar centres on the window's traffic lights

Collapsed to icons the sidebar was 80px wide, so its 46px buttons centred at x = 39.75 while the
traffic lights centre at x = 46; the column now takes the Simple rail's 92px and its hairline edge is an
inset shadow instead of a right border, putting the boxes on x = 46 (Simple, keeping its border, 45.75).
The column's controls share one box and icon size in `src/components/sidebar-icon-column.ts` (46px box,
20px icon, `strokeWidth` 1.75) instead of each component spelling the numbers out; only the hand-drawn
rail-toggle strip actually gets heavier (1.5 → 1.75), since Remix icons are filled paths.

中文：高级模式折叠侧边栏对齐红绿灯。折叠后侧边栏宽 80px，46px 按钮中心在 x = 39.75，而红绿灯中心在
x = 46；现在这一列采用简易 rail 的 92px，细边改为 inset 阴影而不是右边框，盒子中心落在 x = 46（简易 rail
保留边框，中心 45.75）。控件尺寸统一在 `src/components/sidebar-icon-column.ts`（46px 盒子、20px 图标、
`strokeWidth` 1.75）里，不再由各组件各自写数字；只有手绘的 rail 开关条纹真的变粗（1.5 → 1.75），因为
Remix 图标是填充路径。

### A007 · This fork is local-only: MausBot Cloud and organization entries are hidden

`src/fork/local-only.ts` holds `FORK_LOCAL_ONLY = true`, the single switch every hiding reads; nothing is
deleted, and flipping it brings every entry back. The Cloud account and Organization pages leave the
settings rail in both modes, Simple's Usage & billing page keeps usage only, MausBot's first messages drop
the "Try Cloud" step and chip, and remote access keeps Same Wi-Fi and Tailscale (the relay and hosted
HTTPS rows are hidden), while logins, usage, remote access, model providers, API keys, the bot desktop,
backups and import stay untouched; the Cloud-only settings tests and the two Cloud/Organization bridge
cases are skipped under the same constant.

中文：本 fork 仅本地，隐藏 MausBot Cloud 和组织的入口。`src/fork/local-only.ts` 的
`FORK_LOCAL_ONLY = true` 是唯一开关，所有隐藏都读它；什么都没删，翻回 false 所有入口就回来。设置里的
Cloud 账户页和组织页从两种模式的侧栏去掉，简易模式「用量与账单」页只留用量，MausBot 开场消息去掉
「试用 Cloud」步骤和 chip，远程访问只留「同一 Wi-Fi」和 Tailscale（relay 行与官方托管 HTTPS 行隐藏）；
登录、用量、远程访问、模型提供方、API 密钥、机器人桌面、备份、导入均未动。只测 Cloud 的设置用例和
Cloud/组织桥的两条用例在同一个常量下跳过。

### A008 · The remaining Cloud prompts are gone too

Same switch: no Cloud trial card or notice, no what's-new buy action, no Cloud welcome or first-run
sign-in (`cloudSignInDue` is never due), Settings' General loses `ProSettingsCard` and Simple's General
the Cloud plan row, the account menu loses its Cloud account row and its "My Cloud" place rows, "Add a
Cloud…" and the `?desktop-settings=cloud*` deep links do nothing, and the routine schedule note's "Add a
Cloud", both "more pages" upgrade buttons and the organization sign-in row in Connect AI are hidden.

中文：剩下所有 Cloud 引导也去掉了。同一个开关：不再有 Cloud 试用卡/通知、what's-new 购买按钮、Cloud
欢迎流程或首轮登录（`cloudSignInDue` 恒为 false）；设置「通用」去掉 `ProSettingsCard`，简易模式「通用」
去掉 Cloud 方案行；账户菜单去掉 Cloud 账户行与「我的 Cloud」位置行；「Add a Cloud…」与
`?desktop-settings=cloud*` 深链点了没反应；例行任务排程提示里的「添加 Cloud」、两个「更多页面」升级
按钮、以及「连接 AI」里的组织登录行都隐藏。

### A009 · `apply-ui-patch.sh` patched the installed app's UI, and reopens it reliably

`apply-ui-patch.sh` rebuilds the renderer and copies `dist/` into the installed
`/Applications/OpenMausBot.app/Contents/Resources/ui/`, backing up the previous UI to a timestamped
`.ui-backup-*` directory (git-ignored); re-run it after an app auto-update overwrites the patched files.
It now waits for the old app to quit, opens it, polls up to 15 seconds and retries twice before failing.

中文：`apply-ui-patch.sh` 把前端重新构建后覆盖进已安装的
`/Applications/OpenMausBot.app/Contents/Resources/ui/`，并把旧界面备份成带时间戳的 `.ui-backup-*`
目录（已 gitignore）；App 自动更新覆盖界面文件后重跑一次即可。现在它会等旧 App 退出、打开、轮询
15 秒、重试两次，仍失败才报错。

### A010 · Optional Bloub avatar (Grok-style), vendored from `jeremy-prt/bloub`

Settings → Appearance gains "Grok-style avatar (Bloub)": every bot avatar is then drawn by the vendored
engine (`src/vendor/bloub`, MIT, commit `b4bb3c1`) through `src/components/BloubAvatar.tsx` in the bot's
own colour, with the choice kept in `localStorage` (`omb.fork.avatarStyle`). The engine's measurements are
untouched, one `requestAnimationFrame` clock serves every avatar, below 28px it is a still frame with the
odd blink, `prefers-reduced-motion` stops it, and the ref handle keeps `blink`/`spin` (`setExpression` is
a no-op); 15 animated sidebar avatars cost ~22% of the renderer against ~11% for the mascot.

中文：可选 Bloub（Grok 风）头像，内置自 `jeremy-prt/bloub`。设置 → 外观新增「Grok 风头像（Bloub）」开关，
打开后所有机器人头像由内置引擎（`src/vendor/bloub`，MIT，commit `b4bb3c1`）经
`src/components/BloubAvatar.tsx` 用机器人自己的颜色绘制，选择存在 `localStorage` 的 `omb.fork.avatarStyle`。
引擎常量未改，所有头像共用一个 `requestAnimationFrame` 时钟，小于 28px 只画静态帧加偶尔眨眼，
`prefers-reduced-motion` 下不动画；ref 句柄保留 `blink`/`spin`（`setExpression` 为空实现）。侧栏 15 个
动画头像约占渲染进程 22%，原版吉祥物约 11%。

### A011 · Bloub, done properly: its own shapes, faces, colours, customizer and studio

Round two replaces the mascot body and palette with Bloub's: `BloubAvatar` takes
`shape` / `colorId` / `expression` / `paper` and feeds the engine Bloub's own shape radii, resting
expression and ink, making an avatar pixel-identical to the upstream Vue component (38 of 38 compared
cells, 0.00%). Each bot keeps its look in `localStorage` (`omb.fork.bloub.<botId>`, validated per field,
OMB colours mapped onto Bloub's palette), `botId` is threaded through `MausAvatarProps` from every
`BotAvatar` call site, and the editor swaps the mascot's controls for a React port of Bloub's Customizer
(8 shapes × 16 expressions × 12 colours, each a 1s frozen thumbnail with its Chinese name). The
appearance row opens the unmodified upstream studio (`public/bloub/`, MIT, `b4bb3c1`) in a full-screen
iframe (`#planche`, `#etat=wide&stop` both work); still avatars use 40px and up, list avatars animate at
30fps and a lone large one at 60fps (14 animated sidebar avatars: ~12% renderer CPU against ~5%).

中文：Bloub 做对了：用它自己的形状、表情、颜色、定制面板和工作室。第二轮把吉祥物的身体和配色换成
Bloub 的：`BloubAvatar` 接收 `shape` / `colorId` / `expression` / `paper`，把 Bloub 自己的形状半径、
静止表情和墨色交给引擎，画出的头像与上游 Vue 组件逐像素一致（38 个对照格全部 0.00%）。每个 bot 的外观
存在 `localStorage`（`omb.fork.bloub.<botId>`，逐字段校验，OMB 颜色映射到 Bloub 色板），`botId` 从每个
`BotAvatar` 调用点经 `MausAvatarProps` 贯穿，编辑器把吉祥物控件换成 Bloub 定制面板的 React 移植
（8 形状 × 16 表情 × 12 颜色，每格 1 秒定格缩略图并带中文名）。外观行用全屏 iframe 打开未改动的上游工作室
（`public/bloub/`，MIT，`b4bb3c1`，`#planche` 与 `#etat=wide&stop` 都可用）；静止帧阈值为 40px 以上，
列表头像 30fps、单个大头像 60fps（侧栏 14 个动画头像约占渲染进程 12%，吉祥物约 5%）。

### A012 · Bloub follows the pointer, and its sidebar face is bigger

`BloubAvatar` ports Bloub's `follow`/`aim` and `src/ui/gaze.ts` unchanged (±16°/±13°, the turn, the loop
easing), so eyes and head turn toward the pointer on the sidebar, chat header and profile card and come
home when it leaves; `prefers-reduced-motion` turns it off and one `pointermove` serves every avatar. An
avatar under 40px switches to live rendering (30fps) while the pointer is within 120px or hovering, and a
bot whose state is playing renders live too; the collapsed sidebar's face fills its tile — 37px of the
46px box, body cropped to the tile — with both modes centred on the traffic-light line. Measured with 14
avatars: ~0.3% CPU at rest, ~13% while the pointer sweeps the column.

中文：Bloub 会跟随鼠标，侧栏头像也放大了。`BloubAvatar` 原样移植 Bloub 的 `follow`/`aim` 与
`src/ui/gaze.ts`（±16°/±13°、转头、循环缓动），侧栏、聊天头部、资料卡上的眼睛和头朝鼠标看，移开回位；
`prefers-reduced-motion` 下关闭，全局只挂一个 `pointermove`。小于 40px 的头像在鼠标进入约 120px 或悬停时
切到实时渲染（30fps），状态在播放时也实时渲染；折叠侧栏的头像填满格子——46px 里画 37px，身体裁到格子——
两种模式都对在红绿灯中线。14 个头像实测：静止约 0.3% CPU，鼠标扫过侧栏时约 13%。

### A013 · Bloub fixed against the Grok recording: hover-only gaze, spring lean, big faces, a real face at rest

Only the avatar under the pointer follows — each face listens to its own pointerenter/move/leave, nothing
global — and the whole body leans toward it (yaw/pitch turn plus ~2.5px drift and ±6° tilt on a
k=170/c=18 spring with a little rebound), the hovered face running at 60fps. The sidebar face fills its
tile (45px in Advanced, 40px in Simple's rail, on the 46.00px line, drawn at 2× device pixels); a resting
bot shows idle with its chosen expression, and Bloub's `sleep` state is no longer used at all, so a
resting bot always keeps a complete face. Eye holes are tinted against the body so the face reads in both
themes, and the hovered tile gets a 150ms grey wash and a 1.06× scale.

中文：按 Grok 录屏修正 Bloub：只在悬停时跟随、弹簧侧倾、真正的大头像、静止时有完整脸。只有指针下的头像跟随
（每个脸只听自己的 pointerenter/move/leave，无全局监听），整个身体朝指针侧倾（yaw/pitch 转头，加约 2.5px
位移与 ±6° 倾斜，弹簧 k=170/c=18，离开轻微回弹），被悬停的脸 60fps。侧栏脸填满格子（高级 45px、简易 rail
40px，仍在 46.00px 中线，2× 设备像素绘制）；静止 bot 显示 idle 加所选表情，且完全不再用 Bloub 的 `sleep`
状态，所以静止 bot 永远有完整脸。眼睛的洞按身体墨色取对比纸色，深浅主题都看得清；悬停格有 150ms 浅灰底和
1.06 倍放大。

### A014 · Bloub no longer clips, and the whole tile is the hover target

The sidebar face is drawn at 45px inside a 60px tile with 7.5px of viewBox padding and `overflow: visible`,
so the 2.5px drift and ±6° lean stay inside, and body sizes are unchanged (45px Advanced / 40px Simple,
46.00px line). The old `translate(9.36)` was SVG user units, not pixels (~2.1px); the real cause was a
zero-margin viewBox plus SVG viewport clipping, both fixed. The hover target is now the whole tile (row,
header pill, avatar frame) rather than just the drawn face, and a small header face turns its head only so
the tight pill never clips.

中文：Bloub 不再被裁切，整个格子都是悬停热区。侧栏脸在 60px 格子里画 45px，viewBox 四面留 7.5px 余量
（并 `overflow: visible`），2.5px 位移与 ±6° 侧倾都留在里面，身体尺寸不变（高级 45px / 简易 40px，中线
46.00）。之前的 `translate(9.36)` 是 SVG 用户单位不是像素（约 2.1px），真正原因是 viewBox 没有余量、SVG
在自身视口裁切，两处都已修。悬停热区改成整个格子（侧栏整行、头部胶囊整颗、资料卡头像框），不再只是画出来的
脸；头部小头像只转头不侧身，窄胶囊不会切。

### A015 · Bloub follow direction, reach and edges fixed

The follow logic's direction, reach and single easing were corrected so the body leans with the pointer
rather than against it, edges keep their halo instead of being cut by the SVG, and one easing function
drives the whole motion.

中文：修正了 Bloub 跟随的方向、可达范围与缓动：身体朝指针方向侧倾而不是反向，边缘的光晕不再被 SVG 切掉，
整段运动只由一个缓动函数驱动。

### A016 · Bloub wears Grok's palette

Bloub now draws with Grok's 11-colour palette, and each bot's OMB colour maps onto the nearest of those
colours so avatars keep their identity while sharing the look.

中文：Bloub 改用 Grok 的 11 色色板；每个 bot 的 OMB 颜色映射到其中最接近的一色，头像既保持各自的身份又统一
成同一套外观。

### A017 · Grok's Bloub, round four: 2.5D resting gaze, 13 shapes, 60fps session animation, black eyes

Round four gives Bloub a 2.5D resting gaze (a sphere-projected look instead of a flat one), grows the shape
set to 13, runs the session animation at 60fps, and draws the eyes black over any body colour.

中文：第四轮给 Bloub 加了 2.5D 静止视线（按球面投影而不是平面偏移）、形状扩到 13 种、session 动画跑
60fps，眼睛在任何身体颜色上都是黑色。

### A018 · Grok's Bloub, round five: the resting 3/4 turn actually shows, and the eyes glide to the pointer

Round five makes the resting three-quarter turn visible at sidebar sizes and replaces the stepped eye
motion with a glide toward the pointer, with a per-shape tilt so each shape leans believably.

中文：第五轮让静止时的四分之三侧转在侧栏尺寸下真的可见，眼睛从阶梯式移动改为朝指针平滑滑动，并按形状给出
各自的倾斜角度，让每种形状的侧倾都自然。

### A019 · Grok's Bloub, round six: measured parameters, hold-mix follow, cutout eyes, real gradients, quiet sidebar

Round six takes its parameters from the Grok recording: a hold-then-mix follow instead of a continuous
chase, cutout eyes, real gradients on the body, and a quieter sidebar face that does not animate at rest.

中文：第六轮按 Grok 录屏取参数：跟随改为「先保持再混合」而不是连续追逐，眼睛改为挖空，身体用真实渐变，
侧栏头像在静止时不乱动。

### A020 · Group chat, round seven: names take their avatar's colour, and every @ mention is one chip

In a group, sender names take the colour of that bot's Bloub avatar, and an @ mention renders as one chip
instead of a run of text, so a long member list stays readable.

中文：群聊里发送者名字取该 bot Bloub 头像的颜色，@ 提及渲染成单个 chip 而不是一串文字，成员多时也清爽。

### A021 · Grok's Bloub, round six polish: clean expression revert on leave, and three redrawn shapes

Leaving the hovered avatar now reverts its expression cleanly instead of leaving the last frame behind,
and the sparkle, star and flower shapes are redrawn with rounder, softer outlines.

中文：鼠标离开后被悬停头像的表情干净复位，不再残留最后一帧；四角星、星形、花朵三种形状重绘，轮廓更圆更软。

### A022 · Grok's Bloub, round six patch two: the rest gaze really looks up, animations play front-on, and the shapes are symmetric

The resting pitch is 26° (up) rather than the authored 18.06 because the two engines use opposite pitch
signs; at 18.06 the outer eye landed on the centre line and read as level-or-down at 40–45px. Animations
now play front-on, and shapes are symmetric about their vertical axis.

中文：静止俯仰角用 26°（向上）而不是原始数值 18.06，因为两个引擎的俯仰符号相反；在 18.06 时外侧眼睛落在
中线上，40–45px 下看起来是平视甚至下垂。动画改为正面播放，形状关于竖直轴对称。

### A023 · Grok's Bloub, round six patch three: every shape is fat, round and soft

A `softLobes` family (a cosine crest, so a "tip" is a wide round bump with no cusp) drives sparkle, clover,
star and flower; heart and teardrop became unions of circles with round bottoms and plumper lobes; tablet
is a filleted capsule at ~1.45:1; wedge is a three-lobed round triangle whose apex is an arc; house keeps
its flat base and triangular roof but every corner is a tangent arc. Corners use a tangent-arc routine
whose radius is clamped to what the edges can spare (a Minkowski push-out self-intersects near half an
edge — what once turned the house into a star), authored shapes measure area ≥ 0.72 of the peak-radius
circle and valley ≥ 0.72, and all peak at 0.98 body radii, which also fixes small-size clipping by sizing
the viewBox to what the current shape actually reaches.

中文：第六轮修补三让所有形状变胖、圆、软。新增 `softLobes`（余弦波峰，「尖」是宽而圆的包、没有尖点）驱动
四角星、四瓣花、星形、花朵；心形与水滴改为圆并集，底部圆头、上瓣更胖；胶囊加厚到约 1.45:1；三角改为三瓣
圆角形、顶角是圆弧；房子保持平底、竖直两侧与三角屋顶，但所有角都是切线圆弧。圆角用切线圆弧算法，半径按边长
夹紧（Minkowski 外推在半径接近半边长时会自交——之前房子被渲染成星形正是这个原因）；自绘形状面积 ≥ 峰半径圆的
0.72、谷值 ≥ 0.72，峰值统一为 0.98 身体半径，并按当前形状实际到达的范围留 viewBox 余量，顺带修掉小尺寸下的
裁切。

### A024 · MiMo (Xiaomi) joins the voice engines

Settings → Voice gains a MiMo provider that reads replies, voice notes and call speech with
`mimo-v2.5-tts`; the key is saved per installation like the other voice keys (Settings → API keys → MiMo
speech API key, env `OMB_MIMO_API_KEY`), and the voice list is the nine documented presets (冰糖 default,
茉莉, 苏打, 白桦, Mia, Chloe, Milo, Dean, `mimo_default`). MiMo's speech is OpenAI-chat-shaped —
`POST /v1/chat/completions` with the words as an assistant message, answering base64 audio — not
`/v1/audio/speech`; long text is split at sentence boundaries and joined again, and a refused key, empty
balance, rate limiting, the end of the limited-time free period, a content refusal, an outage or a missing
network each speak a plain Chinese sentence instead of staying silent.

中文：语音引擎新增 MiMo（小米）。设置 → 语音里多了 MiMo 提供方，用 `mimo-v2.5-tts` 朗读回复、语音留言和
通话；密钥与其他语音提供方一样由整台安装共用（设置 → API 密钥 → MiMo 语音合成 API 密钥，环境变量
`OMB_MIMO_API_KEY`），音色是文档里的九个预设（默认冰糖，另有茉莉、苏打、白桦、Mia、Chloe、Milo、Dean、
`mimo_default`）。MiMo 的语音接口是 OpenAI Chat 形状：`POST /v1/chat/completions`，把要读的文字放进
assistant 消息，返回 base64 音频，不是 `/v1/audio/speech`。长文本按句切开再拼回去；密钥被拒、余额不足、
限流或限时免费结束、内容拦截、服务异常、断网，都会给出一句清楚的中文提示，不会静默不出声。

### A025 · Simular Box as a third cloud desktop backend

A cloud bot can now work on a Simular Box instead of Boat or a self-hosted VPS: the backend is reached
through its own MCP server (`simular`, `https://mcp.box.simular.ai/mcp`) rather than this app's computer
tools, one account has one box that sleeps when unused and wakes when the MCP server connects, and the
app never creates or deletes a machine behind the person's back. Choosing it caps a turn's approval level
at `auto` (Full access never applies to another company's computer) and `mcp__simular__shell` and
`mcp__simular__box_delete` always ask the person first. The provider picker lists all three backends but
leaves Simular Box disabled, with a "connect it in Settings → Plugins" hint, until its MCP server is listed,
on, and signed in.

中文：云端桌面新增第三个后端 Simular Box。云机器人可以跑在自己的 Simular 桌面上，而不是 Boat 或自托管
VPS：这个后端走它自己的 MCP 服务器（`simular`，`https://mcp.box.simular.ai/mcp`），不走本应用的电脑工具；
一个账号一台 box，闲置休眠、MCP 连上即唤醒，应用绝不会背着用户创建或删除机器。选中它会把该 turn 的审批
上限压到 `auto`（Full access 不适用于别人公司的电脑），`mcp__simular__shell` 与
`mcp__simular__box_delete` 永远先问用户。提供方选择器列出三个后端，但在 Simular 的 MCP 服务器「已列出、
已开启、已登录」之前，Simular Box 是灰的，并提示去「设置 → 插件」里连接。

### A026 · Merged upstream `v0.1.151` and cut the personal 0.1.152 arm64 build

`release/sully-0.1.152` starts from `v0.1.151` and merges `main` into it (two conflicts kept the fork's
side: the Simple-mode settings expectations and the regenerated `source-hashes.json`; the one English
copy line the fork had reworded, `native.connect.oldCode`, stayed Cloud-free). The build bumped the
version to `0.1.152`, never starts the updater by default (`electron/main.mjs`; `app-update.yml` stays but
nothing reads it, `OMB_FOLLOW_UPSTREAM_UPDATES=1` opts back in), and packages arm64 only — the explicit
arch lists in `electron-builder.yml` had overridden `--arm64`, and the speech helper builds a single
slice because a Command Line Tools SDK has no x86_64 Swift libraries — with an Apple Development
signature and no notarization.

中文：从 `v0.1.151` 开出 `release/sully-0.1.152` 并 merge `main`（两处冲突保留 fork 一侧：简易模式的
设置断言、重新生成的 `source-hashes.json`；fork 改写过的那句英文文案 `native.connect.oldCode` 保持不含
Cloud 的版本）。版本改为 `0.1.152`；默认完全不启动自动更新（`electron/main.mjs`，`app-update.yml` 还在但
没人读，`OMB_FOLLOW_UPSTREAM_UPDATES=1` 可临时打开）；只打 arm64 包（`electron-builder.yml` 里写死的 arch
会覆盖 `--arm64`，语音 helper 因 CLT 没有 x86_64 Swift 库只编单切片），Apple Development 签名、不公证。

### A027 · Simular Box is reachable from the screen panel and the Works-on page (branch `feat/simular-entry`)

The personal build is Simple-only, so the cloud backend picker was unreachable: the screen panel drew it
only while a self-hosted VPS needed setup, and the bot panel's Works-on page never drew it. The screen
panel now shows the compact picker whenever the bot works on Cloud, and the Works-on page renders
`CloudBackendPicker` under its place list when Cloud is selected; Simular Box stays greyed with the
existing connect hint until its MCP server is signed in. This lives on `feat/simular-entry` (`df78a475b`)
and is not merged.

中文：个人构建是 Simple-only，云端后端选择器原本没有入口：屏幕面板只在自托管 VPS 待配置时画它，机器人面板
的「工作位置」页则从不画。现在屏幕面板只要机器人工作在「云端桌面」就显示紧凑选择器，「工作位置」页在选中
云端桌面时也在列表下方渲染 `CloudBackendPicker`；Simular Box 在 MCP 未登录时仍是灰的并显示原有连接提示。
改动在 `feat/simular-entry`（`df78a475b`）上，尚未合并。

### A028 · Scrollbars are hidden everywhere, and everything still scrolls (branch `feat/hide-scrollbars`)

The fork used to paint its own scrollbars — an 8px skin-coloured pill, a thin Settings thumb, thin bars on
four panels, and a track inset on the glass scroller; none is drawn now. `src/styles.css` replaces that
block with `* { scrollbar-width: none }` and `*::-webkit-scrollbar { display: none }` (unlayered, so the
Tailwind utilities that ask for a thin bar cannot bring one back), and the per-element bars were removed
from `.settings-scroll`, `.glass-scroller` and the `[scrollbar-width:thin]` utilities in `GrokMoveDialog`,
`SidebarNewChatPanel`, `ConnectAi` and `ChiefIntro`. Wheel, trackpad, keyboard and scroll-into-view still
scroll, and every `overflow-x/y` scroller — code blocks and tables included — keeps scrolling sideways;
only the bar is not drawn, and the skin `--color-scrollbar` tokens remain defined for the contrast check.

中文：这个 fork 原来自己画滚动条，包括 8px 的皮肤色胶囊、设置页的细条、四个面板的细条，以及 glass 滚动
容器的 track 内缩；现在一根都不画了。`src/styles.css` 换成 `* { scrollbar-width: none }` 与
`*::-webkit-scrollbar { display: none }`（无层级规则，Tailwind 里要求细条的 utility 压不过它），并删掉
`.settings-scroll`、`.glass-scroller` 的逐元素样式，以及 `GrokMoveDialog`、`SidebarNewChatPanel`、
`ConnectAi`、`ChiefIntro` 里的 `[scrollbar-width:thin]`。滚轮、触控板、键盘、scroll-into-view 照旧；
所有 `overflow-x/y` 容器（含代码块与表格）仍可滚动，只是不画条；皮肤里的 `--color-scrollbar` 变量保留，
供对比度检查使用。改动在 `feat/hide-scrollbars`（`e9d8f636b`）上，尚未合并。

### A029 · Sidebar and panel polish: group faces, one row radius, the chief's card, bold text and bot accents

The sidebar's group avatar now draws the members themselves: one member is a single face, two sit corner to corner,
three stand as a pyramid, and four or more are the first four in a 2x2 whose faces ride over one another, each on a
disc ringed in the row's own surface so a selected row's cuts follow its selected colour (the +N tail stays out of the
row; the header capsule and the empty room keep theirs). Group rows and bot rows share one radius token
(`ROW_RADIUS` / `ROW_RADIUS_SIMPLE`) after disagreeing (`rounded-xl` against `rounded-md`, 12px against 6px), and
Simple mode's chief row grows its avatar one step, squares it to the row radius and presses the crown into the
avatar's corner with a ring in the row's surface colour. Message previews take one weight step up at their existing
size, while the engine mark on the row's right and the group-chats heading's count are simply not drawn. Settings →
Appearance gains a "Bold text" switch (off by default, saved on the device) that raises chat messages and the
composer one weight step in both themes, and the bot settings and computer panels take the bot's Bloub colour through
`--bot-accent` / `--bot-accent-ink`, with black or white ink chosen by contrast, the skin accent as the fallback and
group chat left on the theme colour. All of it sits behind `FORK_UI_1110` in `src/fork/ui-batch-1110.ts`, changes no
data or behaviour, and lives on `feat/ui-batch-1110` (`e8916c95e`), unmerged.

中文：侧栏群头像改成按人数直接画成员：1 人单脸、2 人对角、3 人品字、4 人及以上取前 4 个 2×2 互压；每张脸坐在按行
自身表面色描边的圆盘上，所以选中行的切口跟随选中底色（行内不再显示 +N；顶部胶囊和群空态保持原样）。群行与 bot 行统一
用同一个圆角 token（`ROW_RADIUS` / `ROW_RADIUS_SIMPLE`）——之前两者不一致（`rounded-xl` 对 `rounded-md`，12px 对
6px）；简易模式的主 bot 行头像放大一档、按行圆角做成正方形，皇冠压进头像一角并以行表面色描边。消息预览字号不变、只加粗
一档；行右侧的模型图标与「群组聊天」标题计数不再绘制。设置 → 外观新增「粗体文字」开关（默认关、存本机），让会话区
消息与输入框在深浅主题下都提高一档字重；bot 设置面板与屏幕面板通过 `--bot-accent` / `--bot-accent-ink` 取 bot 的
Bloub 颜色，按对比度自动选黑或白字，没有 Bloub 色时回落主题色，群聊维持主题色。全部由
`src/fork/ui-batch-1110.ts` 的 `FORK_UI_1110` 控制，不改数据与行为，位于 `feat/ui-batch-1110`（`e8916c95e`），
尚未合并。

### A030 · The MCP page's Claude Code rows, a missing zh-CN pass, the composer's bottom edge, aligned bubbles, the rail's menu and the bot's divider colour

The MCP servers page no longer draws the two Claude Code switches or the "commands run on this computer" notice: the
settings themselves are untouched, only their rows are hidden, so turning the constant back on restores them. The
zh-CN catalogue gained the settings strings that were still falling back to English (the theme block, the colour
themes hint and its follow-system variants, "Use the bot's color for my messages", the language-and-typing group, the
setup card's heading and hint, attachments, browser server sites, the Grok import row, shared-browser hints, and the
name hints). The composer's bottom edge now melts into the canvas the way the chat head's top edge does, copied and
flipped, with the same solid-canvas gradient, no tint and the same reduced-transparency and forced-colour fallbacks.
Bubbles cap at the composer's own width, measured once and published as `--composer-width`, so a reply lines up with
the input instead of running a few pixels past it. Simple's collapsed rail keeps only its avatars: inbox, search, new
and plugins move into the avatar's menu, the inbox item keeping its count, and the rail's foot and its Apps button are
gone while the constant is on. The "New" messages divider takes the bot's Bloub colour for its label and both fading
lines through `useBloubAccent`, solid next to the words and fading to nothing at the ends; a group chat and a bot
still on the mascot keep the theme colour. Everything is behind `FORK_UI_1110B` (`src/fork/ui-batch-1110b.ts`), changes
no data or behaviour, and lives on `feat/ui-batch-1110b`, unmerged.

中文：MCP 服务器页不再绘制两个 Claude Code 开关和「命令会在这台电脑上运行」说明框：设置值原样保留，只是不显示行，
把常量关掉即可恢复。zh-CN 补上了此前仍回落到英文的设置文案（主题区块、「配色主题」及其跟随系统的两种说明、「我的
消息使用该机器人的颜色」、「语言与输入」分组、选起点卡片的标题与说明、附件、浏览器站点、Grok 迁移、共享浏览器
提示、姓名提示等）。输入框底部现在像会话区顶部一样渐隐到画布：复制了顶部那套实现并翻转方向，同样是纯画布渐变、
无着色，并沿用减少透明度和强制颜色下的回退。气泡以输入框自身宽度为上限（量一次并发布为 `--composer-width`），
所以回复与输入框对齐，不再超出几像素。简约模式收起的侧栏只留头像：收件箱、搜索、+ 新建、插件移入头像菜单（收件箱
保留计数），侧栏底部的按钮和「应用」按钮在常量开启时不再渲染。「新消息」分隔线的文字与两侧渐隐线改用 bot 的
Bloub 颜色（`useBloubAccent`）：靠近文字为实色、向两端渐隐到透明；群聊和仍用吉祥物的 bot 保持主题色。全部由
`FORK_UI_1110B`（`src/fork/ui-batch-1110b.ts`）控制，不改数据与行为，位于 `feat/ui-batch-1110b`，尚未合并。

### A031 · V0.1, built on upstream v0.1.151

The personal build is numbered 0.1.0 in the bundle and shows as **V0.1** in the app: this release is the fork's own
cut of upstream `v0.1.151`, merging the local `main` (hidden scrollbars, the sidebar and panel UI batches, Simular's
backend entry and the numbered changelog) into the 0.1.152 personal build with the updater left off, an arm64-only
bundle, an Apple Development signature and no notarization.

中文：**V0.1，基于官方 v0.1.151。** 个人构建的打包版本号是 0.1.0，应用内显示为 **V0.1**：这个版本基于上游
`v0.1.151`，把本地 `main`（隐藏滚动条、侧栏与面板的两批 UI 调整、Simular 后端入口、编号化的变更日志）合并进
0.1.152 的个人构建，保持自动更新关闭、只打 arm64、Apple Development 签名、不做公证。
