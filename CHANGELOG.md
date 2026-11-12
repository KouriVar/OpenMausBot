# Changelog 变更日志

All notable changes to this fork are documented here. This fork tracks
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot); entries below are
local customizations on top of it.

One ID per release, and each release carries exactly two paragraphs: one English, then one Chinese beginning
`中文：`. Inside them the release's changes are listed as bullets, the same order in both languages. An ID names the
release a change shipped in: the initial `0.1.0` is `O001`; after that the minor line gives the letter — `A` for
0.1.x, `B` for 0.2.x, `C` for 0.3.x, `D` for 0.4.x, and so on, `AA`, `AB`… past 26 — and the number counts the
releases within that line, the big one first: `0.2.0` is `OB001`, `0.2.1` `OB002`; `0.4.0` is `OD001`, `0.4.1`
`OD002`, `0.5.0` `OE001`. A release's entry is the collection of everything since the previous release, which is what its GitHub
release notes carry.

本文件记录这个 fork 的所有主要改动，跟随
[milind-soni/OpenMausBot](https://github.com/milind-soni/OpenMausBot)，下面每条都是在上游之上的本地定制。

**一个发版一个编号**，每个编号固定两段：先英文、后以「中文：」开头的中文；两段里都按同样的顺序用列表写出这一版
包含的改动。编号说的是改动随哪一版发出：最初的 `0.1.0` 是 `O001`；之后按小版本取字母 —— 0.1.x 是 `A`、0.2.x 是
`B`、0.3.x 是 `C`、0.4.x 是 `D`，超过 26 个用 `AA`、`AB`…… —— 数字是该小版本里的第几版，大版本算 001：
`0.2.0` 是 `OB001`、`0.2.1` 是 `OB002`；`0.4.0` 是 `OD001`、`0.4.1` 是 `OD002`；`0.5.0` 是 `OE001`。一个发版的条目就是自上一版以来
全部改动的合集，GitHub 的 Release 说明也用它。

**合上游的固定规则 / An upstream-merge rule**：凡是改侧栏头像状态点、未读点（含头像身体上画的点）的上游改动，一律不合；
冲突时这一处永远取我方。 / Never take an upstream change that touches the sidebar's avatar status dot or unread dots,
including dots painted on the mascot body; on conflict this place always keeps our side.

## Unreleased / 未发布

### OE021 · The 0.5.7 round: a file card sits flush with the replies around it

A bot message that was only an attached file drew its card inside the bubble's 6px padding, so the card's left edge sat
right of the text bubbles above and below. That attachment-only bubble now has no horizontal padding, and the card lines
up with the bubble edges.

中文：**V0.5.7 这一轮**修「只有附件的消息」里文件卡片没左对齐：文件卡以前画在气泡的 6px 内边距里，左边比上下的文字气泡缩进
一点；现在这类纯附件气泡的左右内边距归零，卡片与气泡边缘对齐。

### OE020 · The 0.5.7 round: the details panel's chevrons all point right, and 查找 is short

In the bot details panel the model row and the new 已归档会话 row drew down-pointing chevrons while every other row pointed
right; both now use the same right chevron. The find row's label is 查找 (Find) instead of 在对话中查找.

中文：**V0.5.7 这一轮**把详情面板里两个朝下的箭头改成朝右：模型行（ModelPicker 的 contained 形态）和「已归档会话」行，
现在和用量/活动/检查器/例行任务一致；「在对话中查找」这一行改成「查找」。

### OE019 · The 0.5.7 round: a picked voice is saved the moment it is picked

Choosing a voice only queued the usual batched profile patch, so closing the app right after picking could drop it before
the batch was written, and the picker reopened on 「选择语音」. The pick now writes to the server immediately (and is kept
on this device), and opening the voice panel restores the last picked voice if a fresh load came back without one.

中文：**V0.5.7 这一轮**给语音选择做了热保存：以前选完只是排进批量保存，紧接着关掉 App 可能还没写出去，重开就回到
「选择语音」；现在选中的瞬间就直接写服务器（同时在本机留一份），面板打开时如果新加载的数据里没有语音会自动恢复上次选择。

### OE018 · The 0.5.7 round: the Bloub avatar picker draws its shapes and colours with one centred gap

The real component behind 身份 → 头像 with the Bloub style is `BloubCustomizer`: its shapes sat 3px apart and its colours
split into a stretched `grid grid-cols-6` first row plus a tight centred second row. Both groups are now a wrapped flex row
centred on every line with the same 10px (`gap-2.5`) between tiles, so nothing stretches or crowds.

中文：**V0.5.7 这一轮**找到了真正渲染「身份 → 头像」的组件：Bloub 风格下是 `BloubCustomizer`（不是
`BotProfileAvatarCard`）。它原来形状之间只有 3px，颜色第一行是 `grid grid-cols-6` 被平均撑满、第二行又挤在一起；现在两组都
一样：`flex flex-wrap justify-center gap-2.5`，每行居中、横纵都是 10px，不再撑满也不挤。

### OE017 · The 0.5.7 round: the icons rail spaces bots the same in both modes

Switching to Advanced mode nudged the bot icons up a few pixels: each section's bots sat 2px apart in Advanced and 4px in
Simple, so the difference added up down the rail. The icons rail now uses Simple's 4px in both modes; the list layouts are
unchanged.

中文：**V0.5.7 这一轮**让图标侧栏在两种模式下间距一致：高级模式里每个分区内 bot 之间是 2px，简易模式是 4px，切换时就
会看到下面的 bot 整体往上挪一点；现在图标侧栏两种模式都用 4px，列表布局不变。

### OE016 · The 0.5.7 round: the computer panel's where-it-works block carries only its options

In the computer panel's 工作位置 card, the 「选择此机器人在哪里工作」 subtitle, the hairline under the option cards, the
line that restated the chosen place, and the routine row's 「打开计划」 subtitle are gone; the options and the routine row
(and a running routine's own status) stay.

中文：**V0.5.7 这一轮**精简电脑面板的「工作位置」：去掉「选择此机器人在哪里工作」这句副标题、选项卡片下面那条横线、
「按任务需要，使用内置浏览器…」这行说明，以及「例行任务」下面的「打开计划」四个字；选项和例行任务行保留（正在跑的例行
任务仍显示自己的状态）。

### OE015 · The 0.5.7 round: archived conversations are a row at the foot of the details list

The bot panel listed 「已归档（N）」 as a toggle in the middle of the conversation list, and the archived conversations
themselves sat in their own block below. The toggle is gone: the details tab now ends with one 「已归档会话」 row (icon,
count, chevron) and opening it shows the archived conversations right under it.

中文：**V0.5.7 这一轮**把「已归档会话」改成详情列表最后的一行：以前「已归档（N）」是夹在对话列表中间的一个开关，归档的
会话另起一块在下面；现在详情页最后一行就是「已归档会话」（带图标、数量和箭头），点开就在这一行下面列出归档的会话。

### OE014 · The 0.5.7 round: applied skill changes fold into the reply's bubble

When a bot added or updated a skill, each change stood in the transcript as its own row (「添加了技能：… 撤销 详情」) outside
the reply. Those rows now fold into the reply's bubble as one 「已学习新技能，添加至知识库」 chip — one change or several —
which opens to the same lines with their Undo and Details. Nothing else about the notices changed.

中文：**V0.5.7 这一轮**把「学习技能」的提示收进气泡：以前每加/改一个技能，聊天里就单独多一行「… 添加了技能：… 撤销 详情」；
现在这些行都收进上一条回复的气泡里，做成一个「已学习新技能，添加至知识库」的折叠卡片（一条也收），展开后仍是原来的行，
撤销和详情照旧可用。

### OE013 · The 0.5.7 round: the bot's voice panel is MiMo-only

The 语音与提醒 section offered a provider switch. MiMo is free, so it is now the fixed voice provider there: the switch is
gone, the note above says the panel always uses MiMo (Xiaomi) and that it cannot be changed, and opening the section
points the stored provider at MiMo if it was something else. The voice picker, key and the rest of the card are unchanged.

中文：**V0.5.7 这一轮**把「语音与提醒」固定成 MiMo：语音提供方选择器删掉，上面的说明改成「固定使用 MiMo（小米）语音，
MiMo 目前免费，所以语音提供方不可更改」；如果原本存的是别的提供方，打开这一节时会把它切到 MiMo。下面的语音选择、密钥
及其它内容不变。

### OE012 · The 0.5.7 round: 身份 → 头像 draws its shapes and colours with one centred gap

In the bot settings panel's 身份 → 头像 card the mascot shapes and the colour dots used different layouts: the shapes were
a stretched grid and the colour dots filled their first row edge to edge. Both groups are now a wrapped flex row centred
on its own line, with the same 10px gap (`gap-2.5`) horizontally and vertically; an incomplete last line stays centred.
Only that card changed — option sizes, selected ring, colours and order are untouched.

中文：**V0.5.7 这一轮**只改「身份 → 头像」这一处：形状和颜色两组从（被撑开的）网格/铺满行改成同一种排法——`flex` +
`flex-wrap` + `justify-center`，横纵都用同一个 10px 间距（`gap-2.5`），最后一行不满也居中；选项大小、选中框、颜色、顺序
都不变。

### OE011 · The 0.5.7 round: Advanced mode stacks bubbles the way Simple does

In Simple mode consecutive messages from one bot (or from the person) draw as one block: the corners facing a neighbour
tighten, the next bubble pulls up and the group reads from top to bottom. Advanced mode drew each message as its own
separate bubble at full radius. Both modes now join and space bubbles the same way, so a run of replies looks like one
conversation in either mode.

中文：**V0.5.7 这一轮**让高级模式的气泡和简易模式一样堆叠：同一个 bot（或同一个人）连续几条消息时，相邻那一侧的圆角收小、
下一条往上一提，整组读起来是一段对话；原来高级模式每条各自一个全圆角气泡。现在两种模式的堆叠方式、气泡间距统一。

### OE010 · The 0.5.7 round: the profile panel's rows look alike and its search box is as round as the list

In the Advanced profile panel the section whose card is open filled its row with a control tint and darker text; the rest
stayed plain, so one row looked selected. Every row now draws the same: only the chevron turns to show what is open. The
search box's corners were also tighter than the list card's; both are one radius now.

中文：**V0.5.7 这一轮**把高级模式资料面板里「展开中的分区」那行的底色去掉了：以前打开的那行会有一层控件色和更深的文字，
看起来像被选中；现在所有行同一个样子，只靠右侧箭头翻转表示哪一项展开。搜索框的圆角也比下面列表卡片小，现在两者统一成同一个圆角。

### OE009 · The 0.5.7 round: the bot settings list is one card under the search box

In Advanced mode the profile panel's section list was full-bleed: each row drew its own hairline across the whole panel,
its icon sat left of the search box's icon and its chevron touched the panel edge. The sections now live in one rounded
card inset like the search box, with hairlines between rows, icons aligned with the search icon, labels with the
placeholder and chevrons inside the card.

中文：**V0.5.7 这一轮**把高级模式资料面板的分区列表收成一张卡片：以前每行各自铺满面板、图标比搜索框图标更靠左、箭头顶到面板边缘；
现在整组列表是一张和搜索框同内缩的圆角卡片，行间用细线分隔，图标与搜索图标对齐、文字与占位符对齐、箭头也收进卡片里。

### OE008 · The 0.5.7 round: the profile menu's usage row drops the reset line

The bottom-left avatar menu showed 每周用量 with two lines: the used share and 「距重置 N 天后」. The second line is gone,
so the row keeps only 已用 xx% (and its chevron). No data changes: the usage summary still works out when a window resets,
the menu just does not print it.

中文：**V0.5.7 这一轮**把左下角头像菜单里的「每周用量」只留一行：以前还会显示「距重置 N 天后」，现在只显示「已用 xx%」和箭头。
底层用量摘要照旧计算重置时间，只是菜单不再显示这一行。

### OE007 · The 0.5.5 round: Advanced mode can stay on across restarts

Settings gains a 「保持高级模式」 switch next to Advanced mode, off by default. Off keeps today's behaviour: the
Simple-only boot retires the stored mode, so every launch starts Simple. On keeps the mode this device is in, so an app
restart or a new package opens Advanced again until the switch is turned off. It uses the app's existing device settings
storage (localStorage), touches no conversation data, adds no server field, and follows the settings page's own rows.

中文：**V0.5.7 这一轮**在设置的「高级模式」旁边加了「保持高级模式」开关，默认关。关着就是现在的行为：Simple-only
启动时会把存下的模式清掉，每次打开都从简易模式开始；打开后，这台设备当前所处的模式（简易或高级）会一直保留，重启 App
或换新包后仍停在原来的模式，直到把开关关掉。持久化走现有的设备设置存法（localStorage），不碰会话数据、不加服务端字段，
样式沿用设置页现有行。

### OE006 · The 0.5.4 round: the local release build can sign the Mac app

`scripts/fork/release-local.sh` accepts `OMB_SIGN_IDENTITY`: when it names a keychain identity the macOS app is signed
with that identity, hardened runtime and this repository's entitlements, then checked with `codesign --verify --deep
--strict` and `codesign -dv`; without it the build stays ad-hoc signed as before. Nothing is notarized, uploaded or
tagged.

中文：**V0.5.7 这一轮**让本机打包脚本可以签 Mac 应用：设置环境变量 `OMB_SIGN_IDENTITY`（keychain 里的签名身份）后，
macOS 包会用该身份、hardened runtime 和本仓库现有的 entitlements 签名，并用 `codesign --verify --deep --strict` 与
`codesign -dv` 检查签名；不设置则仍为 ad-hoc 签名。不做 notarization，也不上传、不打 tag。

### OE005 · The 0.5.3 round: a streamed reply no longer shows twice, and bot bubbles look the same

A bot reply that was still streaming showed twice while the turn went on: the live draft bubble and the saved message
were both drawn, because the saved message did not carry the item id its words streamed under, so the client could not
swap one for the other. The server now stamps that id on the saved message, and the client removes the draft as soon as
the saved message arrives. Every bot text message is also drawn in this fork's bubble now, formatted or not, so a reply
looks the same while it streams and after it lands.

中文：**V0.5.7 这一轮**修掉流式回复重复：回合还在进行时，流式草稿气泡和已落库的消息会同时画出来，因为落库消息没有带上它
流式时所用的 item id，客户端换不掉草稿。现在服务端在落库消息上带这个 id，客户端在正式消息到达时立刻移除草稿。同时所有
bot 文本消息（包括格式化回复）都统一用我方气泡样式，流式中和落库后外观一致。

### OE004 · The 0.5.3 round: one status dot per avatar, again

The 0.5.3 round puts every sidebar avatar back to one status dot. An unread bot in the icon rail no longer wears a second
blue dot at the row's top-right, and the Bloub body no longer paints its own notification dot in the middle of the face;
the one dot at the avatar's bottom-right carries the state — red for a failed turn or a gone engine, amber while the bot
waits for the person, green while it works, blue for unread, in that priority. Waiting on a teammate and queued work stay
in the row's words, without a dot.

中文：**V0.5.7 这一轮**把侧栏每个头像收回成一个状态点。图标栏里未读的 bot 不再在行的右上角多一个蓝点，Bloub 身体也不再
在脸中间画自己的通知点；头像右下角那一个点负责全部状态 —— 红＝回合失败或引擎挂了，橙＝在等你选择/输入，绿＝正在运行，
蓝＝有未读，同时有多种时按红 > 橙 > 绿 > 蓝只显示一个。等待队友和排队仍然只在行内文字里说，不画点。

### OE003 · The 0.5.2 round: upstream's chat streaming, smoother painting and the window frame

The 0.5.2 round merges upstream's batch after `v0.1.151`: a bot's reply appears as it streams, the app paints once per
update while bots work (one commit per paint, selector subscriptions, one-bot reconcile), and the window frame's cards
have round corners with the frame in the sidebar's colour in every skin. The phone pairing screens no longer send anyone
to an app store — the desktop app has no store links or store QR codes, and the menu row pairs a phone — and the round
also carries the community fixes on connectors, calendar paging, data tables, file sync, memory search, process output
and goal decisions, with their Train corrections. The upstream settings rework is deliberately not in this build; it is
deferred to its own branch after 0.6.0.

中文：**V0.5.7 这一轮**合并 `v0.1.151` 之后的上游 batch：bot 的回复边生成边显示；bot 工作时应用每次更新只重绘一次
（每次绘制一个 commit、选择器订阅、单 bot reconcile）；窗口卡的卡片用圆角，各皮肤下窗框与侧栏同色。手机配对页不再
把人送去应用商店 —— 桌面端没有商店链接，也没有商店二维码，菜单里那一行改为配对手机 —— 这一轮还带上社区对连接器、
日历分页、数据表、文件同步、记忆搜索、进程输出和目标决策的修复，以及对应的 Train 修正。上游那套设置页重排这次
故意不合，推迟到 0.6.0 之后单独分支。

### OE002 · The 0.5.1 round: one status dot on every sidebar avatar

The 0.5.1 round gives the sidebar one status dot per bot, always in the avatar's bottom-right corner where the working
dot used to be. Its colour is the one state that matters most: red for a failed last turn or an engine that is gone,
amber while the bot waits for the person to choose or answer, green while it works, and blue for unread output. When
several states are true at once only the highest one shows, in the order red, amber, green, blue. The blue dot at the
row's top right and the second dot that appeared on hover are gone; waiting on a teammate and queued work are still
said in the row's words, without a dot.

中文：**V0.5.7 这一轮**把侧栏每个 bot 的状态收成一个点，固定在头像右下角，也就是原来运行中绿点的位置。点的颜色表示
当下最重要的那一个状态：红＝最后一个回合失败或引擎已不可达，橙＝正在等你选择或输入，绿＝正在运行，蓝＝有未读。同时
有多种状态时只显示优先级最高的一个，顺序是红、橙、绿、蓝。行右上角的蓝点、以及悬停时多出来的第二个点都删掉了；等待
队友和排队仍然只在行内文字里说，不再画点。

## V0.5.0 · 2026-11-12 · 基于官方 v0.1.151 + cherry-pick 官方 3 个提交 / Based on official v0.1.151 with three upstream cherry-picks

### OE001 · The 0.5.0 round: Advanced mode rebuilt on Simple's pieces, and one menu design

The fifth personal build: `0.5.0` in the bundle, shown as **V0.5.0**, still cut from official `v0.1.151` with the same
three upstream cherry-picks as V0.3 and still Simple-only by default. It gathers everything since 0.4.0 — this fork's
first real pass over Advanced mode, plus one design for the menus and a quieter bot panel:

- The avatar menu loses four rows — `获取手机应用`, `帮助与支持` with its submenu, the place row (`This computer`) and `切换到…` — and gains the switch between the two modes as a single row: one click to Advanced, one click back, no switches anywhere.
- Advanced mode is reachable again: the app icon under `更新` takes ten taps and its switch appears there, and once unlocked the general page's own Advanced row shows too, so the way back out is always on top of `通用`. Simple stays the default for everyone, and turning Advanced off puts both switches away.
- Advanced's sidebar is built from Simple's pieces: one top row, the magnifier's search pill, Simple's inbox row, Simple's footer account with search/inbox/new beside it, and Simple's 92px rail with its square tiles and selection frame. The footer's tools section is gone — automations, Team map, Files, pinned panels and archived live in the avatar's menu in both modes.
- One conversation header pill for both modes: the same padding, round surface, 24px avatar and 14px medium name, with no rename pencil and no chief tag inside it.
- A message's actions live in its right-click menu now: the quick reactions on top, then reply, copy and whatever else the message offers, then the time. It opens where the pointer is and flips above it when it would run under the composer.
- The group header uses the app's own menu for its two dropdowns (`默认（5 分钟）`, `自动（Jev）`) instead of a native select; the `全部对话` menu opens to the right of its button; the stop pill lines up with the work row; the sender's face and name above a bubble read 22px and 14px; `@mention` chips drop the `@`.
- The composer's call button is 32px in Advanced, matching the mic; the header's `更多` button wears the computer button's round surface.
- The inbox panel's list shares its search field's 13px gutter, and its placeholder reads `搜索` in Chinese.
- The bot panel drops `试着这样问` and the quiet group labels `对话` / `这个对话` / `例行任务`; its cards (`备用 AI`, `通话模式`, `回复风格`) fold behind their title rows, and the bot settings page is left with its rows, switches and drill-ins but without their explanatory lines.

中文：**V0.5.0，第五个个人构建**（打包版本号 `0.5.0`，应用内显示 **V0.5.0**，基线仍是官方 `v0.1.151`，cherry-pick 与
V0.3 相同，默认仍为 Simple-only）。它把 0.4.0 以来的改动汇总在一起 —— 这是这个 fork 第一次正经整理高级模式，另外统一了
菜单设计、让 bot 面板安静下来：

- 头像菜单去掉四行：`获取手机应用`、`帮助与支持`（含子菜单）、当前所在位置那行（`This computer`）和`切换到…`；同时多了一行模式开关：点一下切高级，再点一下回简易，不必去找任何开关。
- 高级模式重新可达：在「更新」页最下面连点应用图标十次，那里会出现开关；解锁后「通用」页最上面那行开关也会显示，所以回去的路一直在「通用」顶部。默认对所有人仍是简易；关掉高级会把两个开关一起收起。
- 高级模式侧边栏改用简易的组件：一个顶栏、放大镜展开的搜索胶囊、简易的收件箱行、简易的底部账号区（旁边是搜索/收件箱/新建），以及简易那条 92px 图标栏和它的方形格子与选中框。底部的「工具」区撤掉了 —— 自动化、团队地图、文件、固定面板、归档都在头像菜单里，两种模式同一处入口。
- 两种模式的会话页头部用同一个胶囊：同样的内边距、圆底、24px 头像和 14px 中等字重的名字，胶囊里没有改名铅笔，也没有「总协调机器人」标签。
- 消息的操作搬进右键菜单：第一排快捷表情，然后是回复、复制和这条消息其余的项，最后是时间；菜单在指针位置弹出，下方放不下时会翻到指针上方，不会被输入框压住。
- 群聊头部的两个下拉（`默认（5 分钟）`、`自动（Jev）`）改用应用自己的菜单，不再用系统 `<select>`；「全部对话」菜单从按钮右侧展开；「停止」胶囊与上方工作行左对齐；气泡上方发言人头像 22px、名字 14px；`@提及` 胶囊去掉前面的 `@`。
- 高级模式输入框右边的通话按钮改成 32px，和麦克风一致；头部的「更多」按钮换上电脑按钮那圈圆底。
- 收件箱列表与搜索框共用 13px 内边距，两边对齐；占位文字在中文下是「搜索」。
- bot 面板去掉 `试着这样问` 与三个安静的分组标题 `对话` / `这个对话` / `例行任务`；卡片（`备用 AI`、`通话模式`、`回复风格`）折在各自标题行后面；机器人设置页只留行、开关和可点进去的页面，不再画那些说明文字。

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
