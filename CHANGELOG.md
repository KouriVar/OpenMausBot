# Changelog 变更日志

All notable changes to this fork are documented here. This fork tracks
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot); entries
below are local customizations on top of upstream `v0.1.150`.

本文件记录这个 fork 的所有主要改动。本 fork 跟随
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot)，下面每条都是
在上游 `v0.1.150` 之上的本地定制。英文在前，中文紧随其后（以「中文：」开头）。

## Unreleased / 未发布

### Changed / 变更

- **Merged upstream `v0.1.150`** (`origin/main` at `a7cf31902`) into the fork.
  The merge was clean; both new lucide names the release imports,
  `PhoneCall` and `RadioTower` (`src/lib/hosted-mcp-apps.ts`), are now in
  `src/lib/icons.tsx` (drawn with `RiPhoneLine` and `RiSignalTowerLine`).
  中文：**合并上游 `v0.1.150`**（`origin/main` 在 `a7cf31902`）进 fork。合并无冲突；该版本新引入的两个
  lucide 图标名 `PhoneCall`、`RadioTower`（`src/lib/hosted-mcp-apps.ts`）已补进
  `src/lib/icons.tsx`（分别用 `RiPhoneLine`、`RiSignalTowerLine` 绘制）。
- **Every icon in the app is now Remix Icon.** `src/lib/icons.tsx` re-exports
  the 265 names the code imports from `lucide-react` as `@remixicon/react`
  components; a Vite `app-icons` plugin resolves `lucide-react` to that file
  for files under `src/`, and the `tsconfig.json` path does the same for the
  type checker, so a name missing from the shim fails `pnpm typecheck`. The
  wrappers keep the `lucide lucide-<name>` class names (styles and tests select
  them), `size` and `currentColor`; Remix writes its own `remixicon` class
  before them. Lucide still draws the sandboxed JSX-page frame (`shared/
  app-frame/jsx-page.ts`), which loads it from jsDelivr. `NOTICE` carries the
  Remix Icon attribution.
  中文：**应用里的所有图标改用 Remix Icon。** `src/lib/icons.tsx` 把代码里从 `lucide-react`
  引入的 265 个名字重新导出为 `@remixicon/react` 组件；Vite 的 `app-icons` 插件把 `src/` 下的
  `lucide-react` 解析到该文件，`tsconfig.json` 的路径映射让类型检查器也走同一份，所以 shim 里漏了
  某个名字 `pnpm typecheck` 会直接报错。包装组件保留 `lucide lucide-<name>` 类名（样式和测试按它
  选取）、`size` 与 `currentColor`；Remix 会在其前面加自己的 `remixicon` 类。沙箱 JSX 页面的外框
  （`shared/app-frame/jsx-page.ts`）仍用 lucide，从 jsDelivr 加载；`NOTICE` 里加了 Remix Icon 的署名。
  - Visual difference: Remix line icons are filled paths, so a call site's
    `strokeWidth` no longer changes their weight, and the CSS rule that
    lightened lucide's default 2px stroke (`svg.lucide[stroke-width="2"]`) has
    nothing left to affect.
    中文：视觉差异：Remix 线性图标是填充路径，所以调用处的 `strokeWidth` 不再改变线条粗细；
    之前用来把 lucide 默认 2px 描边变淡的那条 CSS（`svg.lucide[stroke-width="2"]`）也没有作用对象了。
  - Two markup assertions that compared an icon's class string exactly now
    expect the `remixicon` prefix (`BrowserPanel.dom.test.ts`,
    `DesktopWorkspaceSwitcher.test.ts`).
    中文：两处按完整类名字符串比对图标的断言，现在期望带 `remixicon` 前缀
    （`BrowserPanel.dom.test.ts`、`DesktopWorkspaceSwitcher.test.ts`）。
- **Sidebar: search and new-chat buttons moved to the bottom.** The search
  button and the `+` button now sit at the bottom of the sidebar, just above
  the tools/plugins button, instead of at the top.
  中文：**侧边栏：搜索和新建聊天按钮移到底部。** 搜索按钮和 `+` 按钮从顶部移到侧边栏底部、
  工具/插件按钮的正上方。
  - Icon sidebar (`density === "icons"`): search and `+` move into a new
    `SidebarBottomActions` component (`data-sidebar-bottom-actions`) rendered
    above the footer, outside the scrolling list. The `+` menu now opens
    upward (`bottom-full`) so it stays inside the window. The block lives in
    its own file to keep `Sidebar.tsx` under the repo's file-size ratchet.
    中文：图标侧边栏（`density === "icons"`）：搜索和 `+` 移进新的 `SidebarBottomActions`
    组件（`data-sidebar-bottom-actions`），渲染在页脚之上、滚动列表之外。`+` 的菜单改为向上弹
    （`bottom-full`），避免超出窗口。这块拆成独立文件，让 `Sidebar.tsx` 不超仓库的文件行数上限。
  - Avatar rail / compact mode (`SidebarSimpleRail.tsx`): `SimpleRailFooter`
    gained an optional `topActions` slot, and the rail renders search and `+`
    there, above the Connect apps and profile buttons. The top of the rail now
    holds only the avatar list. The `+` menu still opens to the right
    (`left-full`), the only direction with room in a narrow rail.
    中文：头像 rail / 紧凑模式（`SidebarSimpleRail.tsx`）：`SimpleRailFooter` 新增可选的
    `topActions` 插槽，rail 在里面渲染搜索和 `+`，位置在「连接应用」和头像按钮之上。rail 顶部现在
    只剩头像列表。`+` 的菜单仍向右弹（`left-full`）——窄 rail 里只有这个方向放得下。
  - The full (non-icon) sidebar list keeps its buttons at the top.
    中文：完整（非图标）侧边栏的按钮仍留在顶部。
  - Search still opens the command palette; no behaviour change.
    中文：搜索仍然打开命令面板，行为不变。
- **Sidebar: the Inbox entry follows the collapsed layout.** In the full
  sidebar the Inbox row stays at the top; collapsed to icons it now sits at the
  foot, directly above search.
  中文：**侧边栏：收件箱入口跟随折叠布局。** 完整侧边栏里收件箱行仍在顶部；折叠成图标后它落在
  底部、搜索的正上方。
  - Icon sidebar: `SidebarBottomActions` gained an optional `inbox` slot, and
    `Sidebar.tsx` passes the row in there.
    中文：图标侧边栏：`SidebarBottomActions` 新增可选的 `inbox` 插槽，`Sidebar.tsx` 把这一行传进去。
  - Avatar rail (Simple): the row uses the same round `SIMPLE_TOP_BUTTON` control
    as the search button below it, so the rail keeps its Inbox entry too.
    中文：头像 rail（简易模式）：这一行用与下方搜索按钮相同的圆形 `SIMPLE_TOP_BUTTON`，所以 rail
    也保留了收件箱入口。
  - `SidebarInboxRow` gained `rail` for that round shape; its count badge and
    running dot stay in place.
    中文：`SidebarInboxRow` 新增 `rail` 参数来用圆形样式；它的计数徽标和运行中的小圆点位置不变。

- **This fork is local-only: MausBot Cloud and organization entries are
  hidden.** `src/fork/local-only.ts` holds `FORK_LOCAL_ONLY = true`, the one
  switch every hiding reads; nothing is deleted and flipping it brings every
  entry back.
  中文：**本 fork 仅本地：隐藏 MausBot Cloud 和组织的入口。** `src/fork/local-only.ts`
  里的 `FORK_LOCAL_ONLY = true` 是唯一开关，所有隐藏都读它；什么都没删，把它翻回 false 所有入口就回来。
  - Settings: the Cloud account and Organization pages leave the rail (both
    modes), and Simple's Usage & billing page keeps usage only
    (`SettingsModal.tsx`).
    中文：设置：Cloud 账户页和组织页从两侧栏（简易/高级）里去掉；简易模式的「用量与账单」页只留用量
    （`SettingsModal.tsx`）。
  - MausBot's first messages drop the "Try Cloud" step and chip
    (`HelperSetup.tsx`).
    中文：MausBot 的开场消息去掉「试用 Cloud」步骤和 chip（`HelperSetup.tsx`）。
  - Remote access keeps Same Wi-Fi and Tailscale: the relay and the hosted
    HTTPS address rows are hidden (`PhoneDevicesSection.tsx`).
    中文：远程访问只留「同一 Wi-Fi」和 Tailscale：relay 行和官方托管的 HTTPS 地址行都隐藏
    （`PhoneDevicesSection.tsx`）。
  - Untouched, as required: logins, usage, remote access, model providers, API
    keys, the bot desktop, backups and import.
    中文：按要求未动：登录、用量、远程访问、模型提供方、API 密钥、机器人桌面、备份、导入。

- **The remaining Cloud prompts are gone too.** Same switch:
  remote access keeps Same Wi-Fi and Tailscale only (the relay row goes with
  the HTTPS one); Settings' General page loses the `ProSettingsCard` and
  Simple's General the Cloud plan row; no Cloud trial, Cloud notice or
  what's-new buy action, no Cloud welcome or first-run sign-in
  (`cloudSignInDue` is never due); the account menu loses its Cloud account
  row and its "My Cloud" place rows; the menu's "Add a Cloud…" and the
  `?desktop-settings=cloud*` links do nothing; "Add a Cloud" in a routine's
  schedule note, the two "more pages" upgrade buttons and the organization
  sign-in row in Connect AI are hidden.
  中文：**剩下所有 Cloud 引导也去掉了。** 同一个开关：远程访问只留「同一 Wi-Fi」和 Tailscale
  （relay 行随 HTTPS 行一起隐藏）；设置「通用」页去掉 `ProSettingsCard`，简易模式「通用」页去掉
  Cloud 方案行；Cloud 试用卡、Cloud 通知卡、what's-new 的购买按钮都不再出现；没有 Cloud 欢迎流程、
  也没有首轮登录（`cloudSignInDue` 恒为 false）；账户菜单去掉 Cloud 账户行和「我的 Cloud」位置行；
  菜单里的「Add a Cloud…」和 `?desktop-settings=cloud*` 深链点了没反应；例行任务排程提示里的
  「添加 Cloud」、两个「更多页面」升级按钮、以及「连接 AI」对话框里的组织登录行都隐藏。
- **Advanced mode's collapsed sidebar centres on the window's traffic lights.** Collapsed to
  icons, the sidebar was 80px wide, so its column of 46px buttons centred at
  x = 39.75 while the traffic lights' yellow button, inset at 16,16, centres at
  x = 46: every icon sat 6.25px left of the Simple rail's. The column now takes
  the rail's 92px, and its hairline edge is an inset shadow instead of a right
  border, so the border no longer takes 0.5px off the column and the boxes
  centre on x = 46 (the Simple rail, keeping its border, on 45.75).
  中文：**高级模式折叠侧边栏对齐窗口红绿灯。** 折叠成图标时侧边栏宽 80px，那一列 46px 按钮的中心
  在 x = 39.75，而红绿灯（inset 16,16）黄灯中心在 x = 46：每个图标都比简易 rail 靠左 6.25px。
  现在这一列采用 rail 的 92px 宽，且细边改为 inset 阴影而不是右边框，边框不再吃掉 0.5px，于是盒子
  中心落在 x = 46（简易 rail 保留边框，中心 45.75）。
  - The column's controls share one box and icon size —
    `src/components/sidebar-icon-column.ts`: a 46px box holding a 20px icon at
    `strokeWidth` 1.75 — instead of each component spelling the numbers out.
    中文：这一列的控件共用一套盒子与图标尺寸 —— `src/components/sidebar-icon-column.ts`：
    46px 盒子装 20px 图标、`strokeWidth` 1.75 —— 不再由各组件各自写数字。
  - Remix icons are filled paths, so the `strokeWidth` normalisation changes
    nothing on screen; the rail toggle's hand-drawn strip icon is the only one
    whose stroke gets heavier (1.5 → 1.75).
    中文：Remix 图标是填充路径，所以 `strokeWidth` 归一在屏幕上没有变化；只有 rail 开关那个手绘
    条纹图标真的变粗了一点（1.5 → 1.75）。
- **Model picker removed from the chat header** (`ChatView.tsx`). The header no
  longer renders `ModelPicker`; the model is chosen from settings instead. This
  is a personal-build change and is not intended for upstream.
  中文：**聊天顶栏移除模型选择器**（`ChatView.tsx`）。顶栏不再渲染 `ModelPicker`，模型改在设置里选。
  这是个人构建的改动，不打算进上游。
- **Bloub follows the pointer, and its sidebar face is bigger.** BloubAvatar
  ports Bloub's `follow`/`aim` and `src/ui/gaze.ts` unchanged (±16°/±13°, the
  turn, the loop easing), so the eyes and head turn toward the pointer on the
  sidebar, the chat header and the profile card, and come home when it leaves;
  `prefers-reduced-motion` turns it off, and one `pointermove` serves every
  avatar. An avatar under 40px switches to live rendering (30fps) while the
  pointer is within 120px or hovering, and a bot whose state is playing
  (thinking/working…) renders live too; otherwise it rests as a still frame
  with the odd blink. The collapsed sidebar's bot face now fills its tile — 37px
  of the 46px box (80%), the body cropped to the tile — with the column kept at
  92px and both modes centred on the traffic-light line (advanced 46.00px,
  Simple 45.75px with its hairline); the crown/star/status dots follow the
  larger face. Measured on the dev renderer with 14 avatars: ~0.3% CPU at rest,
  ~13% while the pointer sweeps the column.
  中文：**Bloub 会跟随鼠标，侧栏头像也放大了。** BloubAvatar 原样移植了 Bloub 的 `follow`/`aim`
  和 `src/ui/gaze.ts`（±16°/±13°、转头、循环缓动），侧栏、聊天头部、资料卡上的眼睛和头都会朝鼠标看，
  移开就回位；`prefers-reduced-motion` 下关闭，全局只挂一个 `pointermove`。小于 40px 的头像在鼠标
  进入约 120px 或悬停时切到实时渲染（30fps），状态在播放（thinking/working…）时也实时渲染，否则为
  静止帧加偶尔眨眼。折叠侧栏的 bot 头像几乎占满方块——46px 盒子里画 37px（80%），身体裁到方块——列宽
  仍是 92px，两种模式都对在红绿灯中线（高级 46.00px，简易 45.75px，含其细边框）；皇冠/星标/状态点跟着
  放大后的脸重新定位。dev 渲染进程实测 14 个头像：静止约 0.3% CPU，鼠标扫过侧栏时约 13%。
- **Bloub, done properly: its own shapes, faces, colours, customizer and studio.**
  Round two replaces the mascot body and palette with Bloub's: `BloubAvatar`
  now takes `shape` / `colorId` / `expression` / `paper` and feeds the engine
  Bloub's OWN shape radii, resting expression and ink, so an avatar drawn by it
  is pixel-identical to the upstream Vue component (38 of 38 compared cells,
  0.00 %). Each bot keeps its own look in `localStorage`
  (`omb.fork.bloub.<botId>`, validated per field, OMB colour mapped onto Bloub's
  palette), `botId` is threaded through `MausAvatarProps` from every `BotAvatar`
  call site, and the avatar editor swaps the mascot's shape/face/colour/body for
  a React port of Bloub's Customizer (8 shapes × 16 expressions × 12 colours,
  each a frozen 1s thumbnail with its Chinese name). The App appearance row
  gains "Open the Bloub studio", which opens the unmodified upstream studio
  (built at `public/bloub/`, MIT, commit `b4bb3c1`) in a full-screen iframe;
  `#planche` and `#etat=wide&stop` both work. Still avatars move to 40px and
  above, list avatars animate at 30 fps, a lone large one at 60 fps
  (14 animated sidebar avatars: ~12% renderer CPU against ~5% for the mascot).
  中文：**Bloub 这次做对了：用它自己的形状、表情、颜色、定制面板和工作室。** 第二轮把吉祥物的身体和
  配色换成 Bloub 的：`BloubAvatar` 现在接收 `shape` / `colorId` / `expression` / `paper`，把 Bloub
  自己的形状半径、静止表情和墨色交给引擎，所以画出来的头像与上游 Vue 组件逐像素一致（38 个对照格全部
  0.00%）。每个 bot 的外观存在 `localStorage`（`omb.fork.bloub.<botId>`，逐字段校验，OMB 颜色映射到
  Bloub 色板），`botId` 从每个 `BotAvatar` 调用点经 `MausAvatarProps` 贯穿，头像编辑器把吉祥物的
  形状/面部/颜色/身体换成 Bloub 定制面板的 React 移植（8 形状 × 16 表情 × 12 颜色，每格是用 1 秒定格
  画的缩略图，带中文名）。设置外观行新增「打开 Bloub 工作室」，用全屏 iframe 打开未改动的上游工作室
  （构建在 `public/bloub/`，MIT，commit `b4bb3c1`）；`#planche` 和 `#etat=wide&stop` 都可用。
  静止帧阈值提到 40px，列表头像 30fps，单个大头像 60fps（侧栏 14 个动画头像：渲染进程约 12%，
  吉祥物约 5%）。

### Tests / 测试

- The Cloud-only settings tests and the two Cloud/Organization bridge cases are
  skipped under `FORK_LOCAL_ONLY` (`it.skipIf`), and `HelperIntro.test.ts`,
  `SettingsModal.groups.test.ts` and `SettingsModal.simple.test.ts` read the
  constant for the lists it changes. The Cloud plan suite
  (`SettingsModal.cloudPlan.test.ts`) is skipped whole.
  中文：只测 Cloud 的设置用例、以及 Cloud/组织桥的两条用例，在 `FORK_LOCAL_ONLY` 下用
  `it.skipIf` 跳过；`HelperIntro.test.ts`、`SettingsModal.groups.test.ts`、
  `SettingsModal.simple.test.ts` 读同一个常量来做「二选一」断言。Cloud 方案那一整个套件
  （`SettingsModal.cloudPlan.test.ts`）整体跳过。
- Updated upstream tests that asserted the old layout:
  `ChatView.controls.test.ts` (header no longer shows the model picker) and
  `Sidebar.header.test.ts` / `Sidebar.simple-layout.test.ts` (search and `+` at
  the foot of the rail). `pnpm typecheck` passes and the affected suites
  (`ChatView*`, `Sidebar*`) are green.
  中文：更新了断言旧布局的上游测试：`ChatView.controls.test.ts`（顶栏不再有模型选择器）、
  `Sidebar.header.test.ts` / `Sidebar.simple-layout.test.ts`（搜索和 `+` 在 rail 底部）。
  `pnpm typecheck` 通过，相关套件（`ChatView*`、`Sidebar*`）全绿。

### Added / 新增

- **Grok's Bloub, round four: 2.5D resting gaze, 13 shapes, 60fps session animation, black eyes.** A stored
  avatar rests on Grok's upper-right look (yaw +11°, pitch +7°) and hover offsets from it, returning there;
  `palette="bloub"` keeps the flat face for the pixel suite. Grok's 11 colours have no black: both `encre`
  and `creme` show white, `gris` the grey, and every body gets near-black #0b0b0c eyes (all 11 clear 3:1;
  lowest grey 4.39). Five new parameterised shapes — four-point star, four-petal flower, heart, scalloped
  cloud, five-point star — join Bloub's eight for 13, in the panel as 5 + 5 + 3 with no expression grid and a
  thin grey outline that follows the selected body. Session states now run on each avatar's one long-lived
  engine: a switch waits out Bloub's MIN_BLOCK (0.6s) so morphs finish, long tool work plays orbit with a
  play/comet block every ~7s, and everything animated shares one rAF clock at 60fps (idle alone is a still
  frame). Controlled sequence thinking → orbit → play → orbit → comet → orbit → wink → idle → exclaim → idle
  captured frame by frame; rAF intervals median 11.7ms / p95 13.8 / max 14.3.
  中文：**Grok 版 Bloub 第四轮：2.5D 静止视线、13 形状、60fps 会话动画、黑眼睛。** 静止时用 Grok 的右上视线
  （yaw +11°、pitch +7°），悬停在其上叠加、离开回到这里；`palette="bloub"` 保持正面用于像素对比。Grok 的
  11 色没有黑色：`encre` 与 `creme` 都显示白，`gris` 显示灰，所有身体都用近黑 #0b0b0c 的眼睛（11 色对黑
  都过 3:1，最低灰 4.39）。新增 5 个参数化形状——四角星、四瓣花、心形、花边云、尖角星——与 Bloub 原 8 个共
  13 个，面板按 5+5+3 排列、去掉表情网格，选中是跟随身体轮廓的细灰描边。会话状态跑在每个头像唯一的长期
  engine 上：切换会等满 Bloub 的 MIN_BLOCK（0.6s）让过渡完成，长工具任务在 orbit 中每约 7 秒插一个
  play/comet 块，所有动画共用一个 rAF 时钟跑 60fps（只有纯 idle 是静态帧）。受控序列 thinking→orbit→play→
  orbit→comet→orbit→wink→idle→exclaim→idle 已逐帧记录；rAF 间隔中位 11.7ms / p95 13.8 / 最大 14.3。
- **Bloub wears Grok's palette.** A fork constant (`FORK_BLOUB_PALETTE = "grok"`) switches the colour table:
  white #ffffff, brown #a16c39, red #f62c3e, orange #f7670d, amber #f79410, green #38c470, teal #36b8a2,
  blue #2c84fc, purple #9159fb, pink #f73399, grey #777777 — Bloub's own 12 stay in `src/vendor/bloub`.
  Stored ids keep working: `encre` shows grey, `creme` shows white, the rest map one-to-one; no data migration.
  White bodies get dark eyes from the same luminance rule, and the message bubble's contrast is computed from
  the new hex. The settings colour panel shows the 11 swatches in two rows (6 + 5, the second centred) with a
  thin grey ring on the selection.
  中文：**Bloub 改用 Grok 的调色板。** 一个 fork 常量（`FORK_BLOUB_PALETTE = "grok"`）切换色表：白 #ffffff、棕
  #a16c39、红 #f62c3e、橙 #f7670d、琥珀 #f79410、绿 #38c470、青 #36b8a2、蓝 #2c84fc、紫 #9159fb、
  粉 #f73399、灰 #777777；Bloub 原 12 色仍留在 `src/vendor/bloub`。已存的 id 继续可用：`encre` 显示灰、
  `creme` 显示白，其余一一对应，localStorage 不用迁移。白色身体按同一亮度规则自动用深色眼睛，消息气泡的
  对比度也按新色值算。设置的颜色面板显示 11 个色块，两行（6+5，第二行居中），选中外面一圈细灰环。
- **Bloub follow direction, reach and edges fixed.** The head turned the wrong way because the gaze reused the
  arrival rule (`yaw = -TURN + nx*16`, a –26° left turn at centre); following now uses `followLook` —
  `yaw = nx*16`, `pitch = -ny*13` — so right/top look right/up in screen terms. The body lean/drift use the same
  sign, the pointer is normalised to the tile's half width/height (±1 at the edge), the chase spring is stiff
  (k=260/c=24, ~120-180ms) with a softer return (k=140/c=16), and the engine's look morph is ~0 (one easing, not
  two). The white outline round a dark body came from a light paper path painted under the whole body; the eyes
  are now drawn as surface-coloured shapes clipped to the body, so nothing light sits outside them. A resting
  avatar keeps its chosen expression; the thin eyes were a short-lived blink/wink state not returning to open,
  now always redrawn at the settled pose.
  中文：**Bloub 跟随方向、幅度和边缘修好了。** 之前头转反，是因为复用了“入场”规则（`yaw=-TURN+nx*16`，中央即
  -26° 左转）；跟随改用 `followLook`——`yaw=nx*16`、`pitch=-ny*13`——指针在右/上就看右/上。身体位移与倾斜用
  同样符号；归一化按 tile 半宽半高（边缘 ±1）；追的弹簧更硬（k=260/c=24，约 120–180ms），回正更软
  （k=140/c=16），引擎 look 的 morph 设到约 0（只留一层缓动）。深色身体外的白边来自身体下面垫了一整片浅色
  纸；现在眼睛是按身体裁剪的纸色形状，眼睛外不再有任何浅色。静止头像保持选定表情；眼睛压成线是眨眼/眨眼
  状态没回到睁眼的短帧，现在总会重画为静止姿态。
- **Bloub no longer clips, and the whole tile is the hover target.** The sidebar face is drawn at 45px inside a
  60px tile with 7.5px of padding in its viewBox (and `overflow: visible`), so the 2.5px drift and ±6° lean stay
  inside; the body size is unchanged (45px Advanced / 40px Simple, 46.00px line). The tie to `translate(9.36)`
  was SVG user units, not pixels (9.36 units ≈ 2.1px) — the real cause was a zero-margin viewBox plus the SVG
  clipping at its viewport; both fixed. The hover target is now the whole tile (row, header pill, avatar frame),
  not just the drawn face; a small header face turns its head only (no lean) so the tight pill never clips.
  `apply-ui-patch.sh` now waits for the old app, opens it, polls up to 15s, retries twice, and only then fails.
  中文：**Bloub 不再被裁切，整个格子都是悬停热区。** 侧栏脸在 60px 格子里画 45px，viewBox 四面留 7.5px 余量
  （并 `overflow: visible`），2.5px 位移与 ±6° 侧倾都留在里面；身体尺寸不变（高级 45px / 简易 40px，中线
  46.00）。之前的 `translate(9.36)` 是 SVG 用户单位不是像素（约 2.1px），真正原因是 viewBox 没有余量、SVG 在
  自身视口裁切——两处都修了。悬停热区改成整个格子（侧栏整行、头部胶囊整颗、资料卡头像框），不再只是画出来的
  脸；头部小头像只转头不侧身，窄胶囊不会切。`apply-ui-patch.sh` 现在会等旧 App 退出、打开、轮询 15 秒、
  重试两次，仍失败才报错。
- **Bloub fixed against the Grok recording: hover-only gaze, spring lean, big faces, a real face at rest.**
  Only the avatar under the pointer follows — each face listens to its own pointerenter/move/leave,
  nothing global — and the whole body leans toward it (Bloub's yaw/pitch head turn plus a ~2.5px drift
  and ±6° tilt on a k=170/c=18 spring, easing home with a little rebound); the hovered face runs every
  frame at 60fps. The sidebar face now fills its tile: 45px body in Advanced (75% of the 60px tile) and
  40px in Simple's rail (74% of 54px), on the 46.00px line, drawn at 2× device pixels. A resting bot shows
  idle with its chosen expression; the "one dot" was Bloub's `sleep` state (a 16%-wide bouncing ball) being
  picked for old conversations — the fork no longer uses Bloub's sleep state at all, so a resting bot always
  keeps a complete face. The eye holes are tinted against the body (light paper on dark ink, dark on pale), so the face reads in either theme too. The hovered
  tile also gets a 150ms grey wash and a 1.06× scale.
  中文：**按 Grok 录屏修正 Bloub：只在悬停时跟随、弹簧侧倾、真正的大头像、静止时有完整脸。** 只有指针下的
  那个头像跟随——每个脸只听自己的 pointerenter/move/leave，没有全局监听——且整个身体朝指针侧倾（Bloub 的
  yaw/pitch 转头，加约 2.5px 位移与 ±6° 倾斜，弹簧 k=170/c=18，离开轻微回弹）；被悬停的脸每帧 60fps。
  侧栏脸真正填满格子：高级 45px（60px 格子的 75%），简易 rail 40px（54px 的 74%），仍在 46.00px 中线上，
  按 2× 设备像素绘制。静止的 bot 显示 idle 加它选的表情；之前「只剩一个点」是因为旧会话被映射到 Bloub 的
  `sleep`（16% 宽的弹跳小球）——本 fork 完全不再用 Bloub 的 sleep 状态，静止的 bot 永远有完整脸。眼睛的洞按身体墨色取对比纸色（深墨配浅色、浅墨配深色），深浅主题都看得清。悬停格还有 150ms 浅灰底和
  1.06 倍放大。
- **Bloub, finished for daily use.** The fork's Bloub avatar now follows the
  pointer within a tight range (about one avatar size; 1.5× in the sidebar), with
  only the avatar nearest the pointer turning — no cross-talk between avatars —
  and comes home smoothly when the pointer leaves (`prefers-reduced-motion` off).
  The sidebar's bot face is 37px of its 46px box in both modes, its
  chief-crown and model badge are hidden, and a group shows a 2×2 of its first
  four members' own Bloub faces. A bot's turn plays Bloub's states: thinking
  before a tool, orbit while one runs (a play/comet interlude every ~7s), alert
  when it needs you, notify for unread, a wink when a turn finishes, exclaim on
  error, sleep after ten idle minutes — same mapping on the sidebar, chat header
  and profile card, live at 30fps while it runs. Your own message bubble takes
  the bot's Bloub colour (white or near-black text chosen for AA), neutral in a
  group chat; the mascot avatar keeps the old look.
  中文：**Bloub 完成日常可用。** 本 fork 的 Bloub 头像现在在很窄的范围内跟随鼠标（约一个头像大小，
  侧栏 1.5 倍），只有离鼠标最近的那个头像会转头、彼此不联动，鼠标离开后平滑回正
  （`prefers-reduced-motion` 时关闭）。侧栏 bot 头像在两种模式下都是 46px 盒子里的 37px，主 bot 皇冠
  和模型角标隐藏，群头像显示前四个成员各自 Bloub 脸的 2×2。一个 turn 会播 Bloub 的状态：调用工具前
  thinking、工具运行中 orbit（约每 7 秒穿插 play/comet）、需要你时 alert、未读 notify、完成眨眼一次、
  出错 exclaim（2 秒）、空闲十分钟 sleep——侧栏、聊天头部、资料卡同一套映射，运行中 30fps 实时渲染。
  你发的消息气泡取 bot 的 Bloub 颜色（自动选白或近黑文字，满足 AA），群聊保持中性；吉祥物头像维持原样。
- **Optional Bloub avatar (Grok-style), vendored from `jeremy-prt/bloub`.**
  Settings → Appearance gains "Grok-style avatar (Bloub)": with it on, every bot
  avatar is drawn by the vendored engine (`src/vendor/bloub`, MIT, commit
  `b4bb3c1`) through `src/components/BloubAvatar.tsx`, in the bot's own colour,
  and the choice is kept in `localStorage` (`omb.fork.avatarStyle`). The
  engine's measurements are untouched; every avatar shares one
  `requestAnimationFrame` clock, below 28px it is a still frame with the odd
  blink, and `prefers-reduced-motion` stops the animation. The ref handle still
  works: `blink` and `spin` play Bloub's wink and swirl, `setExpression` is a
  no-op. CPU with 15 animated avatars in the collapsed sidebar: ~22% of the
  renderer against ~11% for the mascot.
  中文：**可选 Bloub（Grok 风）头像，内置自 `jeremy-prt/bloub`。** 设置 → 外观新增
  「Grok 风头像（Bloub）」开关：打开后所有机器人头像由内置引擎（`src/vendor/bloub`，MIT，
  commit `b4bb3c1`）经 `src/components/BloubAvatar.tsx` 绘制，用机器人自己的颜色；选择存在
  `localStorage` 的 `omb.fork.avatarStyle`。引擎里的测量常量一个没改；所有头像共用一个
  `requestAnimationFrame` 时钟，小于 28px 时只画静态帧加偶尔眨眼，`prefers-reduced-motion`
  下完全不动画。ref 句柄保留：`blink` 和 `spin` 分别播 Bloub 的 wink 和 swirl，
  `setExpression` 暂为空实现。侧栏 15 个动画头像时，渲染进程 CPU 约 22%（原版吉祥物约 11%）。
- `apply-ui-patch.sh` — builds the renderer and copies `dist/` into the
  installed `/Applications/OpenMausBot.app/Contents/Resources/ui/`, with a
  timestamped backup of the previous UI. Re-run it after an app auto-update
  overwrites the patched interface files.
  中文：`apply-ui-patch.sh` —— 重新构建前端，把 `dist/` 覆盖进已安装的
  `/Applications/OpenMausBot.app/Contents/Resources/ui/`，并把旧界面备份成带时间戳的目录。
  App 自动更新覆盖界面文件后，重跑一次即可。

### Notes / 说明

- `.ui-backup-*/` directories are ignored by git; they are local snapshots made
  by `apply-ui-patch.sh`.
  中文：`.ui-backup-*/` 目录被 git 忽略，它们是 `apply-ui-patch.sh` 在本地做的快照。
