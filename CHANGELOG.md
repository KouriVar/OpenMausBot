# Changelog 变更日志

All notable changes to this fork are documented here. This fork tracks
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot); entries below are
local customizations on top of it.

One ID per release, and each release carries exactly two paragraphs: one English, then one Chinese beginning
`中文：`. Inside them the release's changes are listed as bullets, the same order in both languages. An ID names the
release a change shipped in: the initial `0.1.0` is `O001`; after that the minor line gives the letter — `A` for
0.1.x, `B` for 0.2.x, `C` for 0.3.x, `D` for 0.4.x, and so on, `AA`, `AB`… past 26 — and the number counts the
releases within that line, the big one first: `0.2.0` is `OB001`, `0.2.1` `OB002`; `0.4.0` is `OD001`, `0.4.1`
`OD002`. A release's entry is the collection of everything since the previous release, which is what its GitHub
release notes carry.

本文件记录这个 fork 的所有主要改动，跟随
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot)，下面每条都是在上游之上的本地定制。

**一个发版一个编号**，每个编号固定两段：先英文、后以「中文：」开头的中文；两段里都按同样的顺序用列表写出这一版
包含的改动。编号说的是改动随哪一版发出：最初的 `0.1.0` 是 `O001`；之后按小版本取字母 —— 0.1.x 是 `A`、0.2.x 是
`B`、0.3.x 是 `C`、0.4.x 是 `D`，超过 26 个用 `AA`、`AB`…… —— 数字是该小版本里的第几版，大版本算 001：
`0.2.0` 是 `OB001`、`0.2.1` 是 `OB002`；`0.4.0` 是 `OD001`、`0.4.1` 是 `OD002`。一个发版的条目就是自上一版以来
全部改动的合集，GitHub 的 Release 说明也用它。

## Unreleased / 未发布

## V0.4.3 · 进行中 / In progress · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

### OD004 · Advanced's chat head wears Simple's pill

Advanced mode's conversation header now draws the same pill Simple's does — the same padding, the same round surface and
the same 14px medium name beside the 24px avatar — instead of the wider, semibold variant it had. The pencil that
renames the bot and the chief's `总协调机器人` tag stay where they were inside the pill. Display only.

中文：高级模式的会话页头部改成和简易一样的胶囊 —— 同样的内边距、同样的圆底、头像 24px 旁边 14px 中等字重的名字，
不再是原来那版更宽、字更重的。改名用的铅笔和「总协调机器人」那个标签都留在胶囊里原来的位置。纯显示。

## V0.4.2 · 进行中 / In progress · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

### OD003 · Advanced mode's sidebar is built from Simple's pieces, its bot rows stay its own

Advanced mode's sidebar is being rebuilt on Simple's components: the same top row, search, inbox row, footer account
and new button, while the bot rows keep Advanced's own layout — names, previews and the thread list a row opens. The
tools section leaves the footer first: its rows (automations, Team map, apps, Files, pinned panels) now sit in the
account menu that the avatar opens, alongside usage and settings, so both modes have one place for them. The rest
follows Simple: one top row (the place pill, then search and new as round buttons), the magnifier that opens the
search pill instead of a fixed search field, Simple's inbox row, and Simple's footer — the account's round avatar
and name with search, inbox and new beside it — plus Simple's 92px rail with its square tiles and selection frame.

中文：高级模式的侧边栏正在改用简易模式的组件重做：顶栏、搜索、收件箱行、底部账号和新建按钮都跟简易一致，机器人行保留
高级模式自己的排版 —— 名字、预览和点开行才有的会话列表。第一步先撤掉底部的「工具」区：里面的行（自动化、团队地图、
应用、文件、固定面板）搬进头像点开的账号菜单，和用量、设置放在一起，这样两种模式都只有一处入口。其余也跟简易走：
一个顶栏（地点胶囊，然后搜索和新建两个圆按钮）、用放大镜展开搜索胶囊而不是固定搜索框、简易的收件箱行、简易的底部
（账号的圆形头像和名字，旁边是搜索、收件箱、新建），以及简易那条 92px 图标栏和它的方形格子与选中框。

## V0.4.1 · 进行中 / In progress · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

### OD002 · The first patch after 0.4.0: the avatar menu keeps only what this build uses

The first patch after `0.4.0`: `0.4.1` in the bundle, shown as **V0.4.1**, same base and the same three upstream
cherry-picks. Everything since 0.4.0:

- The avatar menu loses four rows — `获取手机应用`, `帮助与支持` with its submenu, the place row (`This computer`) and `切换到…` — and keeps the rest.
- Advanced mode comes back quietly: the app icon under the updates page takes ten taps and a switch appears there, and once unlocked the general page's own Advanced row shows too, so the way back out is always on top of 通用; turning it off returns to Simple and puts both switches away, and this build still opens Simple by default.

中文：**V0.4.1，0.4.0 之后的第一个补丁版**（打包版本号 `0.4.1`，应用内显示 **V0.4.1**，基线与 cherry-pick 同 0.4.0）。
自 0.4.0 以来的全部改动：

- 头像菜单去掉四行：`获取手机应用`、`帮助与支持`（含它下面的子菜单）、当前所在位置那行（`This computer`）和`切换到…`；其余行都保留。
- 高级模式悄悄回来：在「更新」页最下面连点应用图标十次，那下面会出现一个高级模式开关；解锁后高级模式「通用」页最上面本来那行开关也会显示出来，所以回去的路一直在「通用」页顶部；关掉就回到简易、两个开关同时收起，这一版默认仍是简易模式。

## V0.4 · 2026-11-11 · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

### OD001 · The fourth personal build: eleven fixes and features on official v0.1.151

The fourth personal build: `0.4.0` in the bundle, shown as **V0.4.0**, still cut from official `v0.1.151` with the
same three upstream cherry-picks as V0.3 (`949cabedd`, `5beba1276`, `d48997f07`) and still Simple-only. Everything
since 0.3.0:

- The hidden sidebar's edge handle is smaller, fainter and springs under the pointer.
- Simple's chat-head pill gets 4px more on its trailing edge.
- The avatar menu opens with this build's own label and ui build.
- The transcript no longer shows below the composer.
- One dot on every avatar, and its colour is the status.
- The chief's card grows with its avatar, and its badge takes the corner.
- The chief's badge is a white star, tucked onto the avatar.
- The message's time lives in its own menu.
- An image bubble's top inset matches its sides.
- An unread bot draws no glyph on its mascot.
- Updates follow this fork's own releases.

中文：**V0.4.0，第四个个人构建**（打包版本号 `0.4.0`，应用内显示 **V0.4.0**，基线官方 `v0.1.151`，cherry-pick 与
V0.3 相同的 `949cabedd`、`5beba1276`、`d48997f07`，仍为 Simple-only）。自 0.3.0 以来的全部改动：

- 隐藏侧栏时左边缘那条提手变窄变淡：4px 宽、44px 高（原 5×64），ink 14%（原 25%），指针靠近时弹起 ——`scale` 与背景色用 300ms `cubic-bezier(.34,1.56,.64,1)` 过渡，悬停时宽 1.5 倍、高 1.1 倍、ink 35%，按下 50%，进入与退出都带轻微…
- 简易模式聊天顶部的资料胶囊保持上下与左侧 7.5px 内边距，右侧改为 11.5px（多 4px），名字、箭头与会话名不再顶着描边；样式为 `py-[7.5px] pl-[7.5px] pr-[11.5px]`，同样由 `FORK_UI_1111` 控制。
- 侧边栏头像菜单顶部新增一行小字，标出当前安装的是哪个构建：`OpenMausBot V0.3 (0.3.1)` —— 前半是 About 面板显示的标签，括号里是 ui 构建号。
- 简易模式的输入框自带 `pb-4`，而它背后的渐隐层只到 `-bottom-3`（16px 里的 12px），于是会话面板底边留下一条 4px 的缝，正文、侧边面板或下一行画到那里的内容都会露出来。
- 侧边栏头像现在只戴一个点，位置就是原来工作点所在的那个角落：状态只改这一个点的颜色，不再另找地方加一个。
- 展开侧栏的主 bot 卡片改成 96px 正方形、头像 72px（原 92 / 56），头像撑满卡片上部、名字在下方，占比与收起侧栏时的主 bot 一致；卡片圆角仍用 `ROW_RADIUS_SIMPLE`。
- 主 bot 角标现在是一个组件（`src/components/ChiefBadge.tsx`）：橙色圆底和外圈那道表面色描边不变，里面的皇冠换成实心白色五角星（`RiStarFill`）。
- 消息旁边那一行现在只剩按钮：原来印在那里的时间，改成消息菜单的最后一行 —— 时钟图标加时间，字号跟菜单里其他行一样是 14px，上面用菜单那条细线隔开。
- 带图片的消息气泡，顶部一直沿用文字行的 7px，而左右是气泡的 12px，所以图片离顶边比离侧边紧 5px。
- 未读的 bot 在鼠标悬停时，光标/头像吉祥物会播放「通知」字形 —— 头边一个感叹号加一个圆点，用身体渐变上色，于是头像旁边多出一个更淡的记号，而且只在指针放上去时才出现。
- 应用内更新不再指向上游、也不再被关掉。

## V0.3 · 2026-11-11 · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

### OC001 · The third personal build: three official fixes cherry-picked on v0.1.151

The third personal build: `0.3.0` in the bundle, shown as **V0.3**, cut from official `v0.1.151` with the official
commits `949cabedd`, `5beba1276` and `d48997f07`; `f3b00bb86` was evaluated and kept as an empty commit. Everything
since 0.2.0:

- `949cabedd` replaces the memory search's whole-phrase matching with a CJK word index (`server/cjk-search.ts`), so Chinese and Japanese notes are found by a word inside a sentence; `5beba1276` moves every recognized provider key into `credentials.bin` through `safeStorage` and migrates the plaintext out of the config on the packaged app's first start; `d48997f07` rewrites the update copy in plainer words.
- `scripts/testing/key-readback.e2e.test.ts` expects the fork's `mimoTts` key and answers MiMo's `/models` check through the loopback stand-in's `/mimo` route and `OMB_MIMO_API`.

中文：**V0.3，第三个个人构建**（打包版本号 `0.3.0`，应用内显示 **V0.3**，基线官方 `v0.1.151`，cherry-pick 官方提交
`949cabedd`、`5beba1276`、`d48997f07`；`f3b00bb86` 评估后以空提交保留）。自 0.2.0 以来的全部改动：

- `949cabedd` 把记忆检索里的整句匹配换成中日文分词索引（`server/cjk-search.ts`），中文、日文笔记可以按句中某个词召回；`5beba1276` 把桌面端认识的每个 provider 密钥通过 `safeStorage` 收进 `credentials.bin`，打包版首次启动时把明文从 `…
- `scripts/testing/key-readback.e2e.test.ts` 的期望列表补上 `mimoTts`，并让本地回环 stand-in 通过新增的 `/mimo`路由加 `OMB_MIMO_API` 回应 MiMo 的 `/models` 密钥校验。

## V0.2 · 2026-11-11 · 基于官方 v0.1.151 / Based on official v0.1.151

### OB001 · The second personal build: the same work as V0.1, cut again as 0.2.0

The second personal build: `0.2.0` in the bundle, shown as **V0.2**, on official `v0.1.151`. It carries no change of
its own: the work below is V0.1's and shipped again unchanged, so this release's entry is that collection.

中文：**V0.2，第二个个人构建**（打包版本号 `0.2.0`，应用内显示 **V0.2**，基线官方 `v0.1.151`）。它没有自己的改动：
下面的工作都是 V0.1 的，原样随这一版再发一次，所以这一版的条目就是那份合集。

## V0.1 · 2026-11-11 · 基于官方 v0.1.151 / Based on official v0.1.151

### O001 · The first personal build: the fork's own cut of upstream v0.1.151

The first personal build: `0.1.0` in the bundle, shown as **V0.1**, the fork's own cut of upstream `v0.1.151`,
merging the local `main` (hidden scrollbars, the sidebar and panel UI batches, Simular's backend entry and the
numbered changelog) into the 0.1.152 personal build with the updater off, an arm64-only bundle, an Apple Development
signature and no notarization. Everything in it:

- Sidebar: search and new-chat buttons moved to the bottom.
- Model picker removed from the chat header.
- Every icon in the app is now Remix Icon.
- Sidebar: the Inbox entry follows the collapsed layout.
- Merged upstream `v0.1.150`.
- Advanced mode's collapsed sidebar centres on the window's traffic lights.
- This fork is local-only: MausBot Cloud and organization entries are hidden.
- The remaining Cloud prompts are gone too.
- `apply-ui-patch.sh` patched the installed app's UI, and reopens it reliably.
- Optional Bloub avatar (Grok-style), vendored from `jeremy-prt/bloub`.
- Bloub, done properly: its own shapes, faces, colours, customizer and studio.
- Bloub follows the pointer, and its sidebar face is bigger.
- Bloub fixed against the Grok recording: hover-only gaze, spring lean, big faces, a real face at rest.
- Bloub no longer clips, and the whole tile is the hover target.
- Bloub follow direction, reach and edges fixed.
- Bloub wears Grok's palette.
- Grok's Bloub, round four: 2.5D resting gaze, 13 shapes, 60fps session animation, black eyes.
- Grok's Bloub, round five: the resting 3/4 turn actually shows, and the eyes glide to the pointer.
- Grok's Bloub, round six: measured parameters, hold-mix follow, cutout eyes, real gradients, quiet sidebar.
- Group chat, round seven: names take their avatar's colour, and every @ mention is one chip.
- Grok's Bloub, round six polish: clean expression revert on leave, and three redrawn shapes.
- Grok's Bloub, round six patch two: the rest gaze really looks up, animations play front-on, and the shapes are symmetric.
- Grok's Bloub, round six patch three: every shape is fat, round and soft.
- MiMo (Xiaomi) joins the voice engines.
- Simular Box as a third cloud desktop backend.
- Merged upstream `v0.1.151` and cut the personal 0.1.152 arm64 build.
- Simular Box is reachable from the screen panel and the Works-on page (branch `feat/simular-entry`).
- Scrollbars are hidden everywhere, and everything still scrolls (branch `feat/hide-scrollbars`).
- Sidebar and panel polish: group faces, one row radius, the chief's card, bold text and bot accents.
- The MCP page's Claude Code rows, a missing zh-CN pass, the composer's bottom edge, aligned bubbles, the rail's menu and the bot's divider colour.

中文：**V0.1，第一个个人构建**（打包版本号 `0.1.0`，应用内显示 **V0.1**）：这是 fork 自己基于上游 `v0.1.151` 打出的
版本，把本地 `main`（隐藏滚动条、侧栏与面板的两批 UI 调整、Simular 后端入口、编号化的变更日志）合并进 0.1.152 个人构建，
关闭自动更新、只打 arm64、Apple Development 签名、不做公证。这一版包含的全部改动：

- 侧边栏的搜索和 `+` 按钮从顶部移到底部、工具/插件按钮的正上方。
- 聊天顶栏不再渲染 `ModelPicker`，模型改在设置里选。
- 应用里所有图标改用 Remix Icon。
- 收件箱入口跟随折叠布局。
- 把上游 `v0.1.150`（`origin/main` 在 `a7cf31902`）合并进 fork，无冲突；该版本新引入的两个 lucide图标名 `PhoneCall`、`RadioTower`（`src/lib/hosted-mcp-apps.ts`）已补进 `src/lib/icons.tsx`，分别用`Ri…
- 高级模式折叠侧边栏对齐红绿灯。
- 本 fork 仅本地，隐藏 MausBot Cloud 和组织的入口。
- 剩下所有 Cloud 引导也去掉了。
- `apply-ui-patch.sh` 把前端重新构建后覆盖进已安装的`/Applications/OpenMausBot.app/Contents/Resources/ui/`，并把旧界面备份成带时间戳的 `.ui-backup-*`目录（已 gitignore）；App 自动更新覆盖界面文件后重跑一次即可。
- 可选 Bloub（Grok 风）头像，内置自 `jeremy-prt/bloub`。
- Bloub 做对了：用它自己的形状、表情、颜色、定制面板和工作室。
- Bloub 会跟随鼠标，侧栏头像也放大了。
- 按 Grok 录屏修正 Bloub：只在悬停时跟随、弹簧侧倾、真正的大头像、静止时有完整脸。
- Bloub 不再被裁切，整个格子都是悬停热区。
- 修正了 Bloub 跟随的方向、可达范围与缓动：身体朝指针方向侧倾而不是反向，边缘的光晕不再被 SVG 切掉，整段运动只由一个缓动函数驱动。
- Bloub 改用 Grok 的 11 色色板；每个 bot 的 OMB 颜色映射到其中最接近的一色，头像既保持各自的身份又统一成同一套外观。
- 第四轮给 Bloub 加了 2.5D 静止视线（按球面投影而不是平面偏移）、形状扩到 13 种、session 动画跑60fps，眼睛在任何身体颜色上都是黑色。
- 第五轮让静止时的四分之三侧转在侧栏尺寸下真的可见，眼睛从阶梯式移动改为朝指针平滑滑动，并按形状给出各自的倾斜角度，让每种形状的侧倾都自然。
- 第六轮按 Grok 录屏取参数：跟随改为「先保持再混合」而不是连续追逐，眼睛改为挖空，身体用真实渐变，侧栏头像在静止时不乱动。
- 群聊里发送者名字取该 bot Bloub 头像的颜色，@ 提及渲染成单个 chip 而不是一串文字，成员多时也清爽。
- 鼠标离开后被悬停头像的表情干净复位，不再残留最后一帧；四角星、星形、花朵三种形状重绘，轮廓更圆更软。
- 静止俯仰角用 26°（向上）而不是原始数值 18.06，因为两个引擎的俯仰符号相反；在 18.06 时外侧眼睛落在中线上，40–45px 下看起来是平视甚至下垂。
- 第六轮修补三让所有形状变胖、圆、软。
- 语音引擎新增 MiMo（小米）。
- 云端桌面新增第三个后端 Simular Box。
- 从 `v0.1.151` 开出 `release/sully-0.1.152` 并 merge `main`（两处冲突保留 fork 一侧：简易模式的设置断言、重新生成的 `source-hashes.json`；fork 改写过的那句英文文案 `native.connect.oldCode` 保持不含Cloud 的版…
- 个人构建是 Simple-only，云端后端选择器原本没有入口：屏幕面板只在自托管 VPS 待配置时画它，机器人面板的「工作位置」页则从不画。
- 这个 fork 原来自己画滚动条，包括 8px 的皮肤色胶囊、设置页的细条、四个面板的细条，以及 glass 滚动容器的 track 内缩；现在一根都不画了。
- 侧栏群头像改成按人数直接画成员：1 人单脸、2 人对角、3 人品字、4 人及以上取前 4 个 2×2 互压；每张脸坐在按行自身表面色描边的圆盘上，所以选中行的切口跟随选中底色（行内不再显示 +N；顶部胶囊和群空态保持原样）。
- MCP 服务器页不再绘制两个 Claude Code 开关和「命令会在这台电脑上运行」说明框：设置值原样保留，只是不显示行，把常量关掉即可恢复。
