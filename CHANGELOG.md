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
