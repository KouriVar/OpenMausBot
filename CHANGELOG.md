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

### OE042 · 0.8.0 — interactive answers, the quieter sidebar, and the 0.7.x polish, in one release

`0.8.0` gathers everything since 0.7.0: interactive answers drawn inside a reply, the Advanced sidebar's quieter rows,
the whole of upstream v0.1.157, the Sully Coe wordmark and a page card that follows its page, the sidebar's one left
line and its brand switch, and the inset card's uneven margins with the department arrow.

- **Interactive answers (0.7.1)**: answers, choices and small tools render as components inside the reply, three levels
  deep, with the settings row that chooses Components, inline `omb-ui` blocks, or plain values.
- **A quieter Advanced sidebar (0.7.2)**: a bot row keeps its avatar, name, role marks and preview; the expand chevron,
  time, `+`, folder and `…` go, and every avatar and section title starts on one line. Settings loses its duplicate
  "Your account" entry, and every page ends on the shared spacer.
- **Upstream v0.1.157, merged (0.7.3)**: 238 upstream commits over v0.1.155–v0.1.157, with this fork's own screens kept
  and the Chinese pack brought back to 100%.
- **The wordmark and a page card that fits (0.7.4)**: the Sully Coe wordmark is inline SVG at the top of both sidebars,
  following the skin; an HTML page card now grows to the height the page reports, up to 520px, and shrinks below 220px
  instead of showing a blank window.
- **One left line, and a brand switch (0.7.5)**: the wordmark, department titles, bot and group avatars and the account
  avatar start on the traffic-light red dot's line; the icons rail and Windows keep the same rule, and Settings →
  Appearance can hide the wordmark.
- **Inset margins and the department rhythm (0.7.6)**: the inset content card is flush left with 4px above, right and
  below; the wordmark keeps 0px above and 24px below, departments sit 12px apart expanded or collapsed, and the
  department chevron moves to the row's far right, hidden until hover or keyboard focus.
- **Version**: 0.8.0.

中文：**V0.8.0：交互式回答、更安静的侧栏，以及 0.7.x 的全部收尾**

`0.8.0` 汇总 0.7.0 以来的全部改动：正文里的交互式回答、高级模式侧栏的精简、上游 v0.1.157 全量合入、Sully Coe 字标和
会跟着页面高度的 HTML 卡片、侧栏的一条左对齐线与品牌开关，以及内嵌卡片的四边间距和部门箭头。

- **交互式回答（0.7.1）**：回答、选项和小工具作为组件画在回复里，分三档；设置里有组件、内联 `omb-ui` 块和纯数值的
  三选一。
- **高级模式侧栏更安静（0.7.2）**：bot 行只留头像、名字、身份标记和摘要；展开箭头、时间、`+`、文件夹和 `…` 都收进
  右键菜单，头像和分组标题从同一条线开始。设置去掉重复的「你的账号」，每页末尾统一留白。
- **上游 v0.1.157 全量合入（0.7.3）**：合入 v0.1.155–v0.1.157 的 238 个上游提交，保留我方界面，中文包恢复到 100%。
- **字标和会自适应的页面卡片（0.7.4）**：Sully Coe 字标以内联 SVG 放在两种侧栏顶部并跟随皮肤；HTML 页面卡片按页面
  报告的高度增长到 520px 上限，低于 220px 时跟着变矮，不再是一扇空白窗口。
- **一条左对齐线和品牌开关（0.7.5）**：字标、部门标题、bot/群聊头像和底部个人头像都从红绿灯红点所在线开始，图标栏和
  Windows 用同一规则；设置 → 外观可以隐藏字标。
- **内嵌间距和部门节奏（0.7.6）**：内嵌内容卡片左边贴侧栏、其余三边各 4px；字标上方 0px、下方到首个部门 24px，
  部门之间展开或折叠都是 12px；部门箭头移到整行最右，默认隐藏，悬停或键盘聚焦才显示。
- **版本**：0.8.0。

### OE041 · 0.7.6 — the inset card's uneven margins, a roomier sidebar rhythm, and a quieter department arrow

`0.7.6` gives the inset content card a flush left edge and 4px on its other three sides, opens the sidebar's vertical
rhythm, and moves a department's chevron to the row's far right.

- **Inset layout**: the content card now sits flush against the sidebar's right edge, with 4px above, right and below;
  its rounded corners and hairline are unchanged. Windows follows the same measurements.
- **Sidebar rhythm**: 0px above the wordmark, 24px from its bottom to the first department title's text, and 12px from a
  department's last line — its title when collapsed — to the next department title. The values live in
  `src/fork/sidebar-metrics.ts` and account for the list's own padding and the title's line box.
- **Department arrow**: the chevron moves to the title row's far right, on the same content edge as a bot row. It is
  opacity-only, hidden at rest and shown on hover or keyboard focus, so the name never moves; the whole title row
  toggles, and the arrow points down when open and right when collapsed.
- **Version**: 0.7.6.

中文：**V0.7.6：内嵌卡片四边不等距，侧栏纵向节奏更宽松，部门箭头更安静**

`0.7.6` 让内嵌布局的内容卡片左边紧贴侧栏、其余三边各 4px，拉开侧栏的纵向节奏，并把部门标题的箭头移到整行最右侧。

- **内嵌布局**：内容卡片左边与侧栏右边缘齐平，上、右、下各 4px；圆角和细描边不变。Windows 用同一套数值。
- **侧栏纵向节奏**：字标上方 0px，字标底部到第一个部门标题文字 24px；上一个部门最后一行（折叠时就是标题）底部到下一个
  部门标题文字 12px。数值放在 `src/fork/sidebar-metrics.ts`，并把列表自身的内边距和标题行高一起算进去。
- **部门箭头**：箭头移到标题行最右侧，和 bot 行内容右边界对齐；只用透明度过渡，静止时隐藏，悬停或键盘聚焦时显示，
  文字不位移；点击整行即可展开/收起，展开朝下、收起朝右。
- **版本**：0.7.6。

### OE040 · 0.7.5 — the sidebar's one left line, room around the wordmark, and a brand switch

`0.7.5` puts every resting sidebar item on the line the traffic lights start from, gives the wordmark more air, and
lets Settings → Appearance hide it.

- **One left line**: the wordmark, department titles, bot avatars, group faces and the account avatar all start at the
  traffic light red dot's left edge — 16 px from the sidebar's edge, or 12 px with the macOS frame on, where the lights
  sit in its top bar. Selected and hovered surfaces still reach further left, symmetrically. Windows uses the same 16 px.
- **Room around the wordmark**: 20 px above the mark and 20 px below it before the first section, in place of the old
  4 px and 0 px; the same values on both sidebars.
- **Show brand mark**: Settings → Appearance gains a switch, on by default and saved on this device. Turned off, the
  wordmark and both of its gaps go away and the list moves up to the normal top-row rule.
- **Version**: 0.7.5.

中文：**V0.7.5：侧栏一条左对齐线，字标周围更宽松，品牌开关**

`0.7.5` 把侧栏里所有静止状态的条目放到红绿灯红点所在的同一条左线上，给字标上下留出更宽松的空间，并在设置 → 外观里加了
隐藏字标的开关。

- **一条左对齐线**：字标、部门/分组标题、bot 头像、群聊头像和底部个人头像都从红绿灯红点左边缘开始 —— 距侧栏边缘 16px；
  macOS 开着窗口边框时是 12px，因为红绿灯在边框顶栏里。选中和 hover 的底色仍可比内容往左多铺、左右对称；Windows 同样用 16px。
- **字标周围的留白**：字标上方 20px，字标到第一个分组之间 20px（原来分别是 4px 和 0px），简易和高级模式一致。
- **显示品牌标识**：设置 → 外观新增开关，默认打开，保存在这台设备上。关掉后字标和上下留白一起消失，下面的内容按顶栏的正常规则
  上移。
- **版本**：0.7.5。

### OE039 · 0.7.4 — the Sully Coe wordmark, and an HTML card that shows its page

`0.7.4` puts the house wordmark at the top of both sidebars and closes the gap `0.7.2` wrote down: a compact HTML page
card now follows the height its page reports, so a page that centres its content is no longer a blank 220 px window.

- **The Sully Coe wordmark**: the drawing in `src/assets/brand/sully-coe.svg` is drawn inline at the top of the sidebar,
  under the traffic lights, 20 px tall and on the same 24 px line as the avatars and section titles. It shows in Simple
  and Advanced and on Windows too; every black is `currentColor` and the white inside the Personal label is the
  sidebar's own ground, so the mark and its label invert with the skin. The icons rail keeps its room for avatars.
- **An HTML page card sizes to its page**: the frame grows to the height the page reports, up to its 520 px start. A page
  shorter than the 220 px card is shown whole, with no blank below it; a taller one keeps the 220 px window and its
  bottom fade, and only then draws the fade at all.

中文：**V0.7.4：Sully Coe 字标，HTML 卡片能看见自己的页面**

`0.7.4` 把 Sully Coe 字标放上两种侧栏的顶部，并补上 0.7.2 留下的那个缺口：聊天里的 HTML 页面卡片跟着页面自己报告的高度走，
内容垂直居中的页面不再是一扇空白的 220px 窗口。

- **Sully Coe 字标**：`src/assets/brand/sully-coe.svg` 里的画以内联 SVG 放在侧栏顶部、红绿灯下方，高 20px，左起点和头像、
  分组标题同在 24px 线上。简易模式、高级模式和 Windows 都显示；原来的黑色全部改成 `currentColor`，Personal 标签里的白色
  改用侧栏底色，所以皮肤一换，字标和标签就跟着反色。图标栏不放字标，那里留给头像。
- **HTML 页面卡片按页面高度自适应**：iframe 长到页面报告的高度，最多到页面自己的 520px 起点。比 220px 卡片矮的页面整页
  显示，下面不留空白；更高的页面保留 220px 窗口和底部渐隐，而且只有这时才画渐隐。

### OE038 · 0.7.3 — the whole upstream in, this fork's screens unchanged, Chinese complete

`0.7.3` merges 238 upstream commits (v0.1.155-v0.1.157) on top of everything 0.7.2 changed, and this fork's own screens
come through it untouched: the Advanced sidebar's rows, the settings window's left column, the avatar menu's Inbox row,
the department header, the one-card inset layout and the three-way interactive answers setting are all still as 0.7.2
left them. The release is the merge, the Chinese pack and the version.

- **Upstream's features, inside this fork's own screens**: the settings window now applies every Appearance, General and
  remote-access preference as it is changed, each on a Change card that can be undone, with the new `app_settings` tool
  letting a bot change the same settings on a Change/Cancel card; the built-in browser gains an optional SOCKS5 proxy for
  public sites and an app locale; voice gains listening with an ElevenLabs key, Thai through Eleven v3, Georgian
  Mtavruli and Fish Audio Live 3 as a Live-call provider; a Custom ACP engine can opt in to `/steer` steering; team
  setup works in bulk for a Chief (up to 40 bots, an added rule) and a default bot can be demoted to a regular bot;
  any message can fork its conversation into its own panel; the inbox gains Mark all as read; the phone's wire, card,
  widget, mascot and pairing code move into `packages/phone-protocol` and a paired phone can read the desktop's version
  from `/api/health`; usage bars split by the models a group ran; a bot finds the skills a trusted project ships; and the
  shared Local VM's holds, hand-backs and parked turns keep their place.
- **Everything 0.7.2 fixed is still in place**: the Advanced sidebar keeps its quiet rows (no drag dot on a section
  header, no expand chevron or left gutter on a bot row, avatars and section titles on the 24 px line, 12 px either side
  of a selected row, no time or `+` or folder or `…` on a bot row, the footer's two controls at a 60% fill and a 20%
  edge in the dark); the settings window still has no Your account entry, closes the gap between Data and General, and
  ends every page on the shared `[data-settings-end]` spacer; the avatar menu still carries Inbox under Apps with its
  unread dot, and the sidebar's bottom bar still has no inbox button; a department's header is still its name and
  chevron only, with 部门设置 in its menu; the inset layout is still one card; and interactive answers still has its
  three levels defaulting to Components, inline `omb-ui` blocks, bar values with a numbered y axis, no sort arrows on a
  table of eight rows or fewer, and the sandbox's own focus ring.
- **Chinese caught up**: 492 strings the 0.7.2 report listed and 0.1.156/0.1.157 added — image generation, engines, the
  keys rows and ModelGo, the skins' taglines, the 1Password login choices, the away-email help, the app-settings cards,
  the cloud-desktop reset, Burst, room picks, the SOCKS5 proxy row, Amazon Bedrock, Ollama, the published-apps cards,
  the team side and conversation sharing, and the 24 mascot bodies. `i18n:check` passes on all 16 languages, with zh and
  pt-br at 100%, and `source-hashes.json` is recorded against this fork's own English again.

中文：**V0.7.3：上游全量合入，我方界面原样，中文补齐**

`0.7.3` 在 0.7.2 的全部改动之上合入上游 238 个提交（v0.1.155–v0.1.157），我方自己的界面在这次合并后完全不变：高级模式侧栏的
行、设置窗口左栏、头像菜单里的收件箱行、部门标题行、只有一张卡片的内嵌布局，以及三档交互式回答，都还是 0.7.2 的样子。
这一版做的就是合并、中文和版本号。

- **上游的新功能，接在我方界面里**：设置窗口现在改哪一项就立刻生效（外观、通用、远程访问全部如此），每项都在可撤销的
  更改卡片上完成；新的 `app_settings` 工具让机器人也能在「更改 / 取消」卡片上改同样的设置；内置浏览器新增可选的 SOCKS5
  代理（只用于公开网站）和应用语言；语音新增用 ElevenLabs 密钥收听、用 Eleven v3 说泰语、格鲁吉亚语 Mtavruli，以及
  Fish Audio Live 3 作为实时通话提供方；自定义 ACP 引擎可以选择启用 `/steer` 转向；团队设置支持批量编辑（参谋长最多
  40 个机器人，并可加一条规则），默认机器人可以降级为普通机器人；任意消息都能把对话分叉到独立面板；收件箱新增「全部标为
  已读」；手机的通信协议、卡片、组件、吉祥物和配对码移入 `packages/phone-protocol`，配对的手机可以从 `/api/health` 读到
  桌面端的版本；用量柱状图按群里运行过的模型分色；机器人能找到受信任项目自带的技能；共享本地虚拟机的占用、交回和暂存的
  回合都保持原位。
- **0.7.2 修好的地方一处不少**：高级模式侧栏仍是那套安静的行（分组标题没有拖动点点，bot 行没有展开箭头和左侧空位，头像和
  分组标题对齐在 24px，选中行左右各 12px，bot 行没有时间、`+`、文件夹和 `…`，底栏两个控件 60% 填充、深色模式 20% 描边）；
  设置窗口仍没有「你的账号」入口，「数据」和「通用」之间没有多余空隙，每页底部仍是共享的 `[data-settings-end]` 占位；
  头像菜单的「应用」下面仍有「收件箱」和未读绿点，底栏仍然没有收件箱按钮；部门标题行仍然只有名字和箭头，菜单文案仍是
  「部门设置」；内嵌布局仍然只有一张卡片；交互式回答仍是三档、默认「组件」，`omb-ui` 正文内联渲染，柱状图带数值和带数字的
  Y 轴，8 行及以下的表格不显示排序箭头，沙盒焦点框样式还在。
- **中文补齐**：0.7.2 报告里列出的、以及 0.1.156/0.1.157 新带来的 492 条 —— 图片生成、引擎、密钥各行与 ModelGo、皮肤标语、
  1Password 登录选择、离开时的邮件提醒、应用设置卡片、云桌面重置、Burst、群聊里的指认、SOCKS5 代理行、Amazon Bedrock、
  Ollama、已发布应用的各张卡片、团队侧与对话共享，以及 24 个吉祥物身体。`i18n:check` 在全部 16 种语言上通过，zh 与
  pt-br 均为 100%，`source-hashes.json` 也重新按我方英文记录。

### OE037 · 0.7.2 — a quieter Advanced sidebar, inline answers finished, Settings fixed

`0.7.2` trims the Advanced sidebar down to what a row has to say, finishes the parts of 0.7.1's components that read as
unfinished — a bar with no value on it, a table of three rows with sort arrows, a "Pin to sidebar" in a Chinese window,
a browser focus ring inside the sandbox — and fixes the settings window: one duplicate entry leaves the left column and
the room under a page's last block now belongs to the content. One gap is written down instead of changed: an HTML page
card's preview is a 220px window onto a page that keeps its own height, so a page that centres its content looks blank
in the card until it is opened.

- **A bot row keeps only its own content** (Advanced; Simple is untouched): avatar, name, role marks (crown, flag) and
  the reply preview. The expand chevron on the left is gone and so is the gutter it reserved, and no state — resting,
  hovered or selected — draws the time, a new-thread `+`, a new folder or the `…` menu; every operation goes through the
  right-click menu, which the whole row still opens.
- **Every avatar now starts on one line**, at x = 24 px from the sidebar's list edge: a bot's avatar (with or without a
  thread list to open), a section title's text and a group chat's faces. A selected row carries 12 px on both sides
  instead of 24/36, so its pill is symmetric and starts from the left like any other row.
- **A section header keeps its chevron and its keyboard reorder** (Alt+Up/Down) and no longer draws the drag dot on its
  right; dragging still works from the whole row where it worked before, and the `sidebar.section.dragToReorder` key goes
  with the dot.
- **The footer's two round controls** (search and `+`) become 60% fills — in both the light and the dark skin — so only
  the material behind them shows through while the glyph stays at full strength; hover and press deepen that same fill by
  one step instead of snapping back to a solid colour, and the edge keeps its 7% ink on light skins and steps to 20% on
  dark ones.
- **Inline bar charts name their numbers**: each bar carries its value above it and the y axis is drawn with numbered
  ticks (a chart can still ask for the old axis with `showYAxis: false`); a stacked pile keeps no per-segment labels,
  because they would land on the segment above it.
- **A short table is a comparison, not a data grid**: an inline table of eight rows or fewer drops the sort arrows in
  its header, while a longer one keeps sorting and its arrows; markdown tables and the data panel are unchanged.
- **Chinese copy caught up where the pack had none**: the page card's "Pin to sidebar" (`固定到侧栏`) and the hints and
  full-pin notice beside it, the USB phone takeover row in Early features (`查看并接管 USB 手机`, with its description),
  and the Published apps page (`已发布的应用`, its empty state and its explanation).
- **The HTML sandbox takes the app's focus ring**: native controls inside a bot's page (a slider, a button) draw the
  skin's focus colour instead of the browser's own ring, and a page that styles `:focus-visible` itself still wins.
- **Settings loses "Your account" from the left column** because Profile already covers it: the page itself stays — every
  old link, the profile menu's Cloud row and search still open it, never blank — and the place and app groups close up to
  the same 2px rhythm as every other pair of rows instead of leaving an empty group's 16px behind. What only that page
  offered, and Profile does not, is the Cloud sign-in, the sign-out, the other-email and organization rows and the
  product-updates consent.
- **The last block of a settings page can be scrolled fully into view**: the 48 px under it is now a spacer inside the
  scrolling content instead of the scroller's own bottom padding, so it counts in what can be scrolled to, it is the same
  on every page, and the scroller's 10 px fade lands on that empty room instead of on a block's text.

中文：**V0.7.2：高级模式侧栏更安静，正文组件收尾，设置页修复**

`0.7.2` 把高级模式侧栏精简到一行真正要说的内容，补完 0.7.1 正文组件里几处「没做完」的地方 —— 柱子上没有数值、三行的表也
带排序箭头、中文窗口里的 "Pin to sidebar"、沙盒里浏览器的焦点框 —— 并修好设置窗口：「你的账号」这个重复入口从左栏消失，
页面最后一块下面的留白改由内容自己占。有一处不改、只写进说明：聊天里 HTML 页面卡片的预览是「220px 的窗口看一张按自己
高度排版的页面」，所以内容垂直居中的页面在卡片里看起来是空白，点开才看得到。

- **bot 行只留自己的内容**（高级模式；简易模式不动）：头像、名字、身份标记（皇冠、旗子）和正文摘要。左侧的展开箭头删掉了，
  给箭头预留的空位也一起删掉；默认、hover、选中三种状态都不再出现时间、新建对话的 `+`、新建文件夹和 `…` 菜单 —— 所有操作
  走右键菜单，整行任意位置仍然能弹出。
- **所有头像现在都从同一条线开始**，距侧栏列表边缘 x = 24 px：bot 头像（有没有可展开的会话都一样）、分组标题的文字起点、
  群聊头像。选中行的左右边距都是 12 px（原来是 24/36），底色从左边正常铺开、左右对称。
- **分组标题保留折叠箭头和键盘调整顺序**（Alt+上/下），右边的拖动点点删掉；原来支持整行拖动的地方照旧，跟着消失的
  `sidebar.section.dragToReorder` 文案也一并清掉。
- **底栏两个圆形按钮**（搜索和 `+`）的填充改成 60% 不透明度 —— 浅色、深色都一样 —— 只让后面的毛玻璃透出来，图标保持全不透明；
  hover 和按下是在这 60% 上再深一档，而不是跳回实色；描边浅色模式保持 7% 墨色，深色模式改为 20%。
- **正文柱状图标出数值**：每根柱子顶上写自己的值，纵轴画出带数字的刻度（图表仍可用 `showYAxis: false` 关回旧样式）；堆叠柱
  不加分段数值，因为会落到上一层柱子上。
- **行数少的表是对比表，不是数据网格**：正文里 8 行及以下的表格不再显示表头排序箭头，更长的表格照旧可以排序、箭头保留；
  markdown 表格和数据面板不变。
- **补齐中文文案**：页面卡片的固定按钮（`固定到侧栏`）以及旁边的提示和「固定已满」说明、抢先体验里的 USB 手机接管行
  （`查看并接管 USB 手机` 连同说明）、已发布的应用页（`已发布的应用`、空状态和说明）。
- **HTML 沙盒改用应用的焦点样式**：机器人页面里的原生控件（滑块、按钮）画皮肤的焦点色，而不是浏览器自己的焦点框；页面
  自己写了 `:focus-visible` 的仍然以页面为准。
- **设置左栏去掉「你的账号」**，因为它和个人资料重复：页面本身保留 —— 旧链接、头像菜单里的 Cloud 行、搜索都还能打开它，
  不会空白 —— 属地和应用两组之间收成和其他行一样的 2px 节奏，不再留下空组的 16px。只有那一页有、个人资料没有的功能是：
  Cloud 登录、退出登录、其他邮箱与组织、产品更新邮件同意。
- **每个设置页的最后一块都能完整滚出来**：它下面的 48 px 现在是滚动内容里的一个占位，而不是滚动容器自己的下内边距 ——
  这样它一定计入「能滚到哪里」，每个页面都一样，滚动区那 10px 的淡出也落在空处而不是压在文字上。

### OE036 · 0.7.1 — interactive answers: components drawn inside the reply

`0.7.1` puts the bot's components where they belong — inside the answer, not in a card after it — and gives the whole
thing one switch: **Settings → Appearance → Chat → Interactive answers**, off, components (the default) or components +
HTML sandbox.

- **One switch, three tiers** (Settings → Appearance → Chat): **Off**, **Components** and **Components + HTML sandbox**,
  the same segmented pill as **Light or dark**, saved to `features.interactiveAnswers` and live on the next reply with no
  restart; the row sits in the Chat group beside Tool calls, with the subtitle "Let the bot answer with charts, cards and
  other components", in Simple and Advanced alike.
- **A component drawn where the reply puts it**: a reply carries one as a fenced `omb-ui` block whose body is the same
  widget tree `show_widget` already takes — no second vocabulary — and the chat draws it inline at that point through the
  same renderer, view-only, on the reply's own surface: no bubble around it and no card inside the card, and its type and
  colours follow the light, dark and inset layouts. While the block is still arriving the reply shows a quiet
  placeholder; a block that fails to parse, or names a node the renderer does not know, falls back to the ordinary code
  block instead of an empty answer.
- **Each tier also decides what the model is given**: **Off** teaches nothing about components and lists neither
  `show_widget` nor `show_html`, so an `omb-ui` block is plain code; **Components** lists `show_widget` and teaches the
  inline block; **Components + HTML sandbox** adds `show_html` with the rule to prefer a component and keep HTML for what
  a component cannot do — animation, a simulation, a canvas.
- **Not in this round**: a press inside an inline component sends nothing back to the model, so components in a reply are
  drawn view-only; that is the 0.7.2 round, as are the HTML sandbox's expand, source view and error states.

中文：**V0.7.1：交互式回答 —— 组件直接画在回答正文里**

`0.7.1` 把机器人的组件放回它该在的地方 —— 回答正文里，而不是回答之后的一张卡片 —— 并且给这一整套只有一个开关：**设置 → 外观 →
聊天 → 交互式回答**，关闭、组件（默认）或组件 + HTML 沙盒。

- **一个开关，三档**（设置 → 外观 → 聊天）：**关闭**、**组件**、**组件 + HTML 沙盒**，分段控件和**浅色或深色**那一行同款，存进
  `features.interactiveAnswers`，下一条回答就生效、不用重启；这一行在「聊天」分组里、跟着「工具调用」，副标题是「让机器人用图表、
  卡片等组件来回答」，简易模式和高级模式都看得到。
- **组件画在回答里它自己的位置**：回答里用一个 `omb-ui` 围栏块承载组件，块体就是 `show_widget` 已经在用的那棵组件树 —— 不另起
  一套词表 —— 聊天用同一个渲染器在围栏所在处直接把它画进正文，只读，画在回答自己的底面上：外面不再套气泡，也不再卡片套卡片，
  字号、颜色跟着浅色、深色和内嵌布局走。块还在流式输出时先显示一个安静的占位；解析不了、或节点类型不认识的块退回普通代码块，
  不会变成空白回答。
- **每一档同时决定给模型什么**：**关闭**不教组件、也不挂 `show_widget` 和 `show_html`，`omb-ui` 块按普通代码显示；**组件**挂
  `show_widget` 并教正文块；**组件 + HTML 沙盒**再挂 `show_html`，写明优先用组件、只有动画、模拟、画布这类组件做不了的才写
  HTML。
- **这一轮不做**：正文组件里的按钮、滑块不会把结果回传给模型，所以正文组件一律只读；那是 0.7.2 的事，HTML 沙盒的展开、看源码
  和出错提示也在那时。

### OE035 · 0.7.0 — first release on upstream v0.1.155

`0.7.0` is the first release cut on upstream `v0.1.155`, and it is the whole of the `0.6.8`–`0.6.12` rounds gathered into
one build rather than a round of its own: the department lead's flag (0.6.8), the Mac sidebar made of the wallpaper
(0.6.9), the Inbox moved into the account menu (0.6.10), the inset layout with one card (0.6.11), and the outright merge
of upstream `v0.1.155` (0.6.12). Nothing those rounds settled is reopened here — no interface, styling, bundle id,
user-data path or data folder moves — so the version is the only change this release makes to the tree.

- **A Chief can wear a department lead's flag** (`0.6.8`, OE030): beside the Chief switch a Chief picks **Chief** (its
  crown) or **Department lead** (a flag), one value per bot, drawn from the app's one icon file so every crown in the
  sidebar row, chat head, team map, org chart, bot action menu and phone hero switches with it, kept on this computer.
- **A Mac sidebar made of the wallpaper** (`0.6.9`, OE031): the left column asks the system for the `sidebar` vibrancy
  material Finder and Aside use, with **Sidebar vibrancy**, **Transparency** and **Overlay colour** under Settings →
  Appearance → Look; off, or off a Mac, it is the solid sidebar it was.
- **The Inbox moves into the account menu** (`0.6.10`, OE032): the sidebar's foot keeps only the avatar, search and +, the
  Inbox becomes a row under Apps with the icon and the panel it had, and a green dot marks it while anything waits.
- **An inset layout, one card** (`0.6.11`, OE033): **Settings → Appearance → Look → Layout** gains **Inset**, which turns
  the whole content area into one rounded card 8px inside the window, its single hairline the only edge while every panel
  inside gives up its own left border, ground and shadow.
- **All of upstream `v0.1.155`, merged** (`0.6.12`, OE034): 978 upstream commits over `v0.1.152`–`v0.1.155` merged rather
  than cherry-picked, 124 conflicts all resolved to this fork's interface with every upstream feature carried inside it.

中文：**V0.7.0：在上游 v0.1.155 之上的第一个正式版**

`0.7.0` 是第一个建立在上游 `v0.1.155` 之上的版本，也是把 `0.6.8`–`0.6.12` 这几轮做出来的东西收成的**一个**包，而不是又一轮新
改动：部门组长的小旗子（0.6.8）、用桌面壁纸做的 Mac 侧栏（0.6.9）、收件箱挪进头像菜单（0.6.10）、内嵌布局一张卡片
（0.6.11），以及上游 `v0.1.155` 的全量合入（0.6.12）。这几轮定下的东西一处都没有重开 —— 界面、样式、bundle id、userData
路径和任何数据目录都没动 —— 这一版对代码树唯一的改动只是版本号。

- **Chief 可以挂「部门组长」的小旗子**（`0.6.8`，OE030）：Chief 开关旁边二选一 —— **Chief**（皇冠）或**部门组长**（小旗子），
  每个机器人只有一个值，图标取自 App 那一个文件，侧栏行、聊天头角标、团队地图、组织图、机器人操作菜单和手机端头像一起切换，
  记在本机。
- **用壁纸做的 Mac 侧栏**（`0.6.9`，OE031）：左栏向系统要 `sidebar` 那层毛玻璃（Finder、Aside 用的那种），设置 → 外观 →
  样式下多了**侧栏毛玻璃**、**透明度**和**叠加颜色**；关掉、或不在 Mac 上，侧栏还是原来的实色。
- **收件箱挪进头像菜单**（`0.6.10`，OE032）：侧栏底栏只留头像、搜索和加号，收件箱变成「应用」下面的一行，图标和面板照旧，
  有东西等人处理时这一行最右边出现一个绿点。
- **内嵌布局，只有一张卡片**（`0.6.11`，OE033）：**设置 → 外观 → 样式 → 布局**新增**内嵌**，整个内容区收成一张离窗口边 8px 的
  圆角卡片，卡片那一条淡描边是唯一的边，里面的每个面板都放弃自己的左边框、底色和阴影。
- **上游 `v0.1.155` 全量合入**（`0.6.12`，OE034）：`v0.1.152`–`v0.1.155` 共 978 个上游提交用 merge 而不是 cherry-pick，
  124 个冲突全部按本 fork 的界面解决，上游每个新功能都搬进了这张界面。

### OE034 · The 0.6.12 round: the whole of upstream v0.1.155, merged

`0.6.12` merges upstream `v0.1.155` outright: 978 upstream commits over `v0.1.152`–`v0.1.155` on top of `v0.1.151`,
merged rather than cherry-picked, so nothing is left behind. 124 files conflicted; our interface and styling won every
one of them, and each upstream feature was carried into it instead of being dropped.

- **New upstream features now in this fork's screens**: a bot's page can be **pinned into the sidebar** as its own page
  (Pin to sidebar on the page toolbar, Advanced mode, the same six-panel budget as a pinned URL); **Traditional Chinese
  is completed** in `zh-tw`; one bot's **body can be given to every other bot** from the avatar editor; Simple's bot
  settings gain one row saying **sending on your behalf and app access are set in Advanced mode**, which opens them;
  a login page's **one-time code is read out of a connected mailbox and typed for you**; an **image preview can be
  copied** to the clipboard as PNG; the engines' **model list and prices moved into one JSON manifest** refreshed from
  `main`; **Claude on Amazon Bedrock** and **OMP over ACP** join the engines; **Codex gains a Fast row** for each model
  that offers the tier; **Fish Audio** becomes a Live-call provider beside OpenAI and Azure; a **webhook trigger can
  carry a payload field filter** (up to ten dotted paths, a mismatch is ignored with HTTP 202); a **stuck cloud computer
  can be reset** from the computer panel or by the bot itself; and **Your account** becomes its own Settings page
  (sign-in, sign-out, organization, emails) with **Import & export** as the one place for import, export, backup and move.
- Also merged from the same range: burst mode, Ollama as a first-class local engine, ModelGo, a Published apps page, the
  Pages Point rework, Team Clouds, durable Inbox asks, `post_to_thread`, room drag, announcement cards, extension pages
  in the browser, 1Password improvements, the VPS wake script, tailnet sharing, self-hosted updates, archive
  attachments, `.xmind` to Markdown, and the streaming and painting fixes.
- **This fork's decisions the merge keeps**: `SIMPLE_ONLY` stays `true` — upstream had flipped it back to `false`, which
  would have put the Advanced switch in every Settings footer and unwound the ten-tap unlock, so the merged build keeps
  the fork's Simple/Advanced design and the new "More in Advanced mode" row leads to This app while the mode is still
  locked. Upstream's removal of the peers list, peer approval, the escalation cards and the Team org-chart mode is taken
  as it stands: nothing in the merged interface references them.
- **Bug fixes carried in**: Windows-1252 files no longer open garbled, chat videos stream by byte range, an IME
  Enter/Escape no longer renames a sidebar thread, Chinese and Japanese words are found inside a sentence, switching the
  local place while a bot works asks instead of silently killing the turn, a newer Claude copy on `PATH` no longer gets
  the older copy's flags, empty files survive a move to My Cloud, and a 1Password item that fails to read is no longer
  reported as deleted.

中文：**V0.6.12：把上游 v0.1.155 全量合进来**

`0.6.12` 完整合入上游 `v0.1.155`：在 `v0.1.151` 之上，`v0.1.152`–`v0.1.155` 共 978 个上游提交，用 merge 而不是
cherry-pick，一个都不漏。124 个文件冲突；界面和样式全部按我方，上游每个新功能都搬进了我方界面，没有因为「以我方为准」被删掉。

- **现在已经在本 fork 界面里的上游新功能**：bot 的页面可以**固定到侧栏**成独立页面（页面工具栏「固定到侧栏」，高级模式，
  和固定网页共用六个位置的上限）；**繁体中文补齐**；一处头像的**身体可以套给其他所有 bot**；简易模式的 bot 设置多一行，说明
  **代为发送和应用权限在高级模式里**，点它直接打开；登录页的**一次性验证码会从已连接的邮箱里读出来并自动填**；**图片预览可以
  复制**成 PNG 到剪贴板；各引擎的**模型清单和价格移进一份 JSON manifest**，会从 `main` 刷新；新增 **Claude on Amazon
  Bedrock** 和 **OMP over ACP** 两个引擎；**Codex 每个支持 Fast 的模型多一行 Fast**；**Fish Audio** 成为 OpenAI、Azure
  之外的 Live 通话 provider；**webhook 触发可以带载荷字段过滤**（最多十个点路径，不匹配按 HTTP 202 忽略）；**卡住的云电脑可以
  重置**，面板上或由 bot 自己发起；**「你的账户」成为独立的设置页**（登录、退出、组织、邮件），**「导入与导出」**收成导入、
  导出、备份和迁移的唯一入口。
- 同一批还合入了：burst 模式、作为一等本地引擎的 Ollama、ModelGo、「已发布应用」页、Pages Point 重做、Team Cloud、
  可长期挂起的收件箱请求、`post_to_thread`、房间拖拽排序、公告卡片、浏览器里的扩展页、1Password 改进、VPS 唤醒脚本、
  tailnet 共享、自托管更新、压缩包附件、`.xmind` 转 Markdown，以及流式与绘制的修复。
- **这次合并保住的 fork 决定**：`SIMPLE_ONLY` 仍然是 `true` —— 上游把它改回了 `false`，那会把高级模式开关重新放回每个设置页
  底部、并拆掉连点十次解锁，所以合出来的版本保留本 fork 的简易/高级设计；上游新加的那行「更多在高级模式里」在高级模式还没解锁
  时指向「这个应用」页。上游删掉的 peers 列表、peer 审批、escalation 卡片和团队组织图模式照上游删掉：合并后的界面没有任何
  地方引用它们。
- **一并合入的 bug 修复**：Windows-1252 编码的文件不再打开是乱码、聊天里的视频按字节范围流式播放、输入法选词时的回车/ESC
  不再触发侧栏会话改名、中日文可以按句中某个词召回、bot 正在工作时切换本机位置会先询问而不是静默掐断这一轮、`PATH` 上更新的
  Claude 副本不会再套用旧副本的参数、空文件在迁移到 My Cloud 时不再丢失、读不出的 1Password 条目不再被当成已删除。

### OE033 · The 0.6.11 round: an inset layout, one card

Settings → Appearance → Look gains **Layout**: Classic, or **Inset**, with a quiet line under it saying what Inset is. Inset
keeps the sidebar as the window's ground — the vibrancy material when that is on, else its own colour — and turns the whole
content area, the chat and any panel beside it, into one rounded card, 8px from the window's edges and from the sidebar.
The card is the only frame: it clips its children once, so scrollbars, quotes and the full-bleed fades stop at its corner,
and every panel inside gives up its own left border, ground and shadow for the card's single hairline divider — the
settings panel's own `bg-panel`/`border-l`, the computer panel's, the inspector's, the activity panel's and the inbox's.
The panel's title bar sits in the card, level with the chat head, and the card's width follows the panel's own opening
animation, so nothing jumps. Its measurements are tokens: `--inset-gap`, `--inset-radius`, `--inset-divider`,
`--inset-edge` (one hairline drawn as a ring, not a border and a shadow) and `--inset-card` (white on the light skins, the
chat's own dark on the dark ones). Both modes, every platform; Settings, sheets and dialogs are untouched. Two follow-ups took the stray lines off the
card's left edge: that was the sidebar's own right border (its inset shadow, in the icon column) and the conversation
pane's edge showing once the card sat 8px in — inside the card neither draws one now, and the card's single ring (3.5% of
the ink on the dark skins, 9% on the light ones) is the only edge, with no shadow added.

中文：**V0.6.11：内嵌布局，只有一张卡片**

设置 → 外观 → 样式新增**布局**：经典 / **内嵌**，下面一行灰色小字说明内嵌是什么。内嵌把侧栏留作窗口底色（开了毛玻璃就是毛玻璃，
没开就是侧栏底色），把右侧整个内容区 —— 聊天和它旁边的面板 —— 变成一张圆角卡片，离窗口边和侧栏各 8px。卡片是唯一的框：裁切只在
卡片根上做一次，滚动条、引用条、通栏渐变都止于圆角；里面的每个面板都放弃自己的左边框、底色和阴影，只用卡片那一条 1px 分隔线 ——
包括设置面板的 `bg-panel`/`border-l`、电脑面板、检查器、活动面板和收件箱面板。面板自己的标题栏也在卡片里，和聊天头顶边对齐；
面板开合时卡片宽度跟着它自己的动画平滑变化，不跳。尺寸全是 token：`--inset-gap`、`--inset-radius`、`--inset-divider`、
`--inset-edge`（一层很淡的描边，用 ring 画，不加阴影）、`--inset-card`（浅色皮肤白、深色皮肤用现在聊天区的深色）。高级/简易、
所有平台都支持；设置窗口、弹层、对话框不受影响。第二轮把深色下卡片左边缘那条亮线去掉了：那是侧栏自己的右边框（图标栏里是它的
内阴影）贴着卡片画出来的，所以内嵌模式下侧栏不再有右边框，卡片那圈很淡的描边在深色皮肤上降到墨色的 3.5%（浅色 9%）——描边仍是唯一
的边，没有再叠阴影。会话区自己也去掉边框：内缩 8px 之后它原来那条边框会变成卡片左边一条突兀的细线，所以卡片里面它不再画边框，经典
模式保持原样。

### OE032 · The 0.6.10 round: the Inbox moves into the account menu

The Inbox is no longer a button in the sidebar's foot: the bottom bar keeps the avatar, search and +, spaced the way they
were, and the Inbox is a row of the account menu, right under Apps, with the same icon it had and the same effect (it opens
and closes the Inbox panel, and reads as current while it is open). While anything waits on the person, a green dot sits at
the row's far right, its edge level with the chevrons of the rows above it and centred in the row; nothing waiting, no dot.
Simple and Advanced draw the same row from the same place. The sidebar's bottom bar and the rail keep no Inbox button.

中文：**V0.6.10：收件箱挪进头像菜单**

侧栏底栏不再有「收件箱」按钮：底部只留头像、搜索和加号，间距照旧；收件箱变成头像菜单里的一行，紧挨「应用」下面，图标沿用原来的，
点击效果也一样（开/关收件箱面板，面板开着时这一行显示为当前）。有东西等人处理时，这一行最右边出现一个绿点，右边缘和上面几行的箭头
对齐、在行内垂直居中；没有就不显示。简易和高级模式画的是同一行。底栏和图标栏都不再保留收件箱按钮。

### OE031 · The 0.6.9 round: a Mac sidebar made of the wallpaper

On a Mac the left column now asks the system for a sidebar material, the one Finder's and Aside's columns use, so the
desktop's blurred colours show through it; the chat pane keeps its solid ground. The window asks for it with
`vibrancy: "sidebar"`, `visualEffectState: "followWindow"` (so a window that loses focus greys the way the system expects)
and a transparent background, and the page decides whether to let it through: with **Settings → Appearance → Look → Sidebar
vibrancy** on (the default) the page, the window's frame and the card behind the sidebar stop painting, the sidebar takes a
translucent panel colour and its rows a tint, and the chat, the settings window and every pop-up stay solid. Off, or on
Windows and Linux, the sidebar is the solid one it was. The alpha is one token (`--sidebar-glass-strength`, 62%) beside the
per-skin glass colour, so it is tuned in one place; a chosen sidebar colour lays its tint over the glass and a sidebar
picture still shows. `prefers-reduced-transparency` and high-contrast modes put the solid sidebar back. Nothing about the
bundle id, the user-data path or any data folder changed. Later the same round it was turned down so more of the wallpaper
shows: 22% of the panel on the dark skins, 28% on the light ones (two tokens, `--sidebar-glass-strength` and
`--sidebar-glass-strength-light`), a selected row a 32% tint rather than a block, and the sidebar's quiet inks stepped
toward the skin's ink with a halo behind them so the words still read over a bright picture. Two rows now sit under the
switch: **Transparency** (20 / 40 / 60 / 80 / 100%, more is clearer, 60% by default) and **Overlay colour** (follow the
theme, light, or dark — a light overlay puts white over the material even in a dark theme, and the sidebar's words turn dark
with it). Both take effect at once and are kept on this computer.

中文：**V0.6.9：Mac 侧栏变成「桌面壁纸的毛玻璃」**

Mac 上左栏现在向系统要一层 sidebar 材质（Finder、Aside 侧栏用的那种），桌面壁纸的模糊颜色透出来，右边聊天区保持实色。窗口用
`vibrancy: "sidebar"`、`visualEffectState: "followWindow"`（失焦时按系统默认变灰）和透明背景去要，是否透出来由页面决定：设置 →
外观 → 样式 →「侧栏毛玻璃」开着（默认开）时，页面、窗口外框和侧栏底下那张卡片都不再上底色，侧栏本身换成半透明的面板色、行底色
换成淡色叠色，聊天区、设置窗口和所有弹层继续实色；关掉、或在 Windows/Linux 上，侧栏还是原来的实色。透明度是一个 token
（`--sidebar-glass-strength`，62%）加上每种皮肤自己的玻璃色，只在一处调；选了侧栏颜色就在毛玻璃上叠一层淡色，侧栏图片照旧显示。
系统「减少透明度」和高对比模式下会回到实色侧栏。bundle id、userData 路径和任何数据目录都没动。这一轮后半段又把透明度调低了，让壁纸
透出更多：深色皮肤 22%、浅色皮肤 28%（两个 token：`--sidebar-glass-strength` 和 `--sidebar-glass-strength-light`），选中行
改成 32% 的淡色叠层而不是色块，侧栏里那些浅色文字往皮肤的主文字色靠、并在字后面加一层同色系的光晕，亮壁纸上也还看得清。开关下面
又多了两行：**透明度**（20/40/60/80/100%，数字越大越透，默认 60%）和**叠加颜色**（跟随主题 / 浅色 / 深色 —— 选浅色时深色主题下也
给侧栏盖一层白色半透明，文字跟着变深）。两行都是选了立即生效，记在本机。

### OE030 · The 0.6.8 round: a Chief can wear a department lead's flag

A bot that coordinates its department is still made Chief the same way, with the same powers and the same switch; the new
choice is only the mark it wears. Beside the Chief switch in its permissions, a Chief now picks **Chief** (the crown it
always had) or **Department lead** (a flag), never both: the choice is one value per bot, so picking one drops the other.
The flag is drawn at the crown's size, weight and colour, from the app's one icon set (Remix Icon's flag-line, Apache-2.0,
credited in NOTICE), and every place that shows the crown reads it from one file — sidebar rows and the Simple hero, the
chat header's badge, the team map, the org chart, the bot action menu and the phone hero — so a later swap to another SVG
is a one-file change, and switching it reaches every badge at once: the sidebar row's crown beside the name and the chat
head's badge read the same choice, which announces itself, so no restart is needed. Chief itself lives on the bot and the
server, so this mark is kept where the fork's other display
preferences live: this computer's storage, per bot, with no server change and no data folder touched.

中文：**V0.6.8：Chief 可以挂「部门组长」的小旗子**

机器人当 Chief 的方式没变：还是同一个开关、同一套权限和逻辑，新加的只是它戴哪个标记。在它权限页的 Chief 开关旁边，多了一组
二选一：**Chief**（原来的皇冠）或**部门组长**（小旗子），两者互斥 —— 每个机器人只有一个值，选了哪个另一个就自动取消。小旗子的
尺寸、粗细、颜色都跟皇冠一致，出自 App 自己的图标集（Remix Icon 的 flag-line，Apache-2.0，NOTICE 里已有署名），并且所有显示
皇冠的地方（侧栏行与简易模式大头像、聊天头角标、团队地图、组织图、机器人操作菜单、手机端头像）都从同一个文件取图标，以后换成
自己的 SVG 只需改那一个文件；切换后所有位置立即同步 —— 侧栏名字旁的那个皇冠和聊天头角标也读同一个选择，切换时会自己广播，
不用重启。Chief 本身存在机器人记录里、由服务端保存，所以这个「标记」按 fork 其它显示类偏好的做法存在本机、
按机器人分别记，不动服务端，也不动任何数据目录。

### OE029 · The 0.6.7 round: a quieter department heading, one preview row, a reply quote that sits right

- A department's heading is only its name, its chevron and the drag handle: the delete button that sat on it is gone,
  and so is the "add or remove bots" row under the list. Managing a department — its bots, its name, sharing it, taking
  it away, setting it for every bot — all lives in the right-click menu it already had, whose "Set for all bots in this
  department…" row now reads "Department settings" (zh: 部门设置, pt-br: Configurações do departamento; every other
  language falls back to English). The three keys only those deleted buttons used are gone from the packs.
- A group chat's row shows its preview in the same words as a bot row's: one shared 13/18, medium, ink-secondary line for
  both, so "speaker: text" keeps its shape and stops reading smaller and lighter than the rows around it.
- A bubble that holds a reply quote takes the same inset on top as its sides give it, so the quote no longer hugs the top
  edge; the gap between the quote and the words below it stays the one the bubble's other stacked rows use. Simple and
  Advanced, light, dark and bot-coloured bubbles all follow, because the inset comes from the bubble's padding.

中文：**V0.6.7：部门标题更安静、预览统一一行、引用条不再贴顶**

- 部门标题行只剩部门名、展开箭头和拖动手柄：标题行上那个删除按钮去掉了，列表下面那行「添加或移除机器人」也去掉了。部门的
  管理 —— 增减机器人、改名、分享、删除、给这个部门的所有机器人做设置 —— 全都走它本来就有的右键菜单；菜单里那行
  「为此部门的所有机器人设置…」现在叫「部门设置」（en: Department settings，pt-br: Configurações do departamento，
  其它语言回落到英文）。只有被删掉的按钮用过的三个 i18n key 从语言包里清掉了。
- 群聊行的预览正文和 bot 行用同一套：13/18、medium、ink-secondary，两种行共用一份，所以「发言人: 内容」的格式不变，也
  不再比旁边的行更小更细。
- 带引用条的气泡，上边距跟左右一样了（都来自气泡自身的 padding），引用不再贴顶；引用条和下面正文之间的间距沿用气泡里其它
  元素的那一档。简易/高级、浅色/深色/bot 颜色气泡都一样，因为改的是气泡的 padding。

### OE028 · The 0.6.5 round: a tidier Settings column, and a menu bar in the app's language

- The switches in Settings read as a light track and a white knob when off, with no dark outline around them; on is
  unchanged.
- The Settings left column is one list: this computer's page heads it as a plain row, an icon on the same 24px slot the
  page rows use, on one line, with no badge tile and no bots count; This app left the middle of the list and sits pinned
  at its bottom, icon and second line kept, while the list above scrolls; the app's pages follow the place's with no gap
  left over from a group head that is no longer drawn. Simple and Advanced share the layout.
- The column says what a person looks for: this computer's page is now "About this computer" (list and page title alike),
  Phone & devices reads "Connected devices", AI reads "Models" and You and your bots reads "Profile"; Desktops & browser,
  Vault, Spending, Data, General and Appearance keep their names. The Vault's own rows are in the app's language too,
  where they had been left in English.
- The Your account page is gone: it only repeated rows the Profile page and This app already hold. With it goes the
  product-updates-by-email question — neither the settings row nor the popup that used to ask it appears any more.
- This app no longer offers the help centre, feedback, the two tour replays or the logs-and-diagnostics row; Keyboard
  shortcuts and About stay.
- "Check for updates" only speaks about news that exists: a repository with no release published yet, or a rate-limited
  answer, reads as up to date instead of a red failure, and the update errors it can report are translated (the zh
  pack was missing all eleven update.error keys). The avatar no longer raises a red dot for that check.
- The composer's stop button keeps its box at rest instead of growing one under the pointer.
- The macOS menu bar follows the app's language: the App menu (About, Open at Login, Hide, Hide Others, Show All, Quit)
  and File, Edit, Server, View and Window with every item under them are written in the app's own words, Electron's own
  role items labelled too, and they re-label when the language changes. The app is named OpenMausBot there and in About,
  not the bundle's lowercase `openmausbot` — the display name only: the bundle id, the app's own name and every data
  folder stay where they were.
- About names the release once: V0.6.5 in the app, in the sidebar stamp and in About, without the repeated bundle
  version in brackets beside it.

中文：**V0.6.5：设置左栏更整齐，菜单栏跟着 App 的语言走**

- 设置里的开关，关的时候只剩浅灰的轨道和白色圆点，外面那圈深色描边去掉了；开的状态不变。
- 设置左栏合成一列：「关于本机」像普通行一样打头，裸图标占和页面行一样的 24px 位置，一行显示，不再有图标外框、
  也不再显示机器人数量；「这个应用」从列表中间移到最底部固定住，图标和第二行副标题都保留，上面的列表照常滚动；App 的
  几页紧跟在这台电脑的页后面，不再留出分组标题留下的空档。简易模式和高级模式共用这套布局。
- 左栏的词也改成人找东西时的说法：这台电脑的页现在叫「关于本机」，列表和页面标题都一样；「手机和设备」改为「互联设备」，
  「AI」改为「模型」，「你和你的机器人」改为「个人资料」；「桌面和浏览器」「保险库」「花费」「数据」「通用」「外观」名字不变。
  保险库里面那几行也一起汉化了，之前还留着英文。
- 「你的账号」这一页删掉了：它只是重复「个人资料」和「这个应用」里已有的行。跟着一起删的还有「通过邮件接收产品更新」
  那个功能 —— 设置里的那一行和启动时那个弹窗都不再出现。
- 「这个应用」里不再有「帮助中心」「发送反馈」两个重播导览和「日志和诊断」那一行，只留「键盘快捷键」和「关于」。
- 「检查更新」只讲真有的事：仓库还没发布发行版、或 API 被限流时，按「已是最新」处理，不再报红色失败；它确实会报的更新
  错误也都汉化了（zh 里原先 11 个 update.error 键一个都没有）。头像菜单不再为这次检查点红点。
- 输入框的「停止」按钮默认就有底色，不是只在鼠标悬停时才出现。
- macOS 顶部菜单栏跟着 App 的语言走：App 菜单（关于、登录时打开、隐藏、隐藏其他、全部显示、退出）以及文件、编辑、
  服务器、显示、窗口和它们下面的每一项，都用 App 当前语言显示，Electron 自带的 role 项也带上了对应文案；切换语言后
  菜单会跟着刷新。App 名在菜单和关于里统一显示为「OpenMausBot」，不再用小写的包名 `openmausbot` —— 只改显示名，
  bundle id、App 自身的名称和各个数据目录都没动。
- 关于里版本只写一次：App 内、侧栏戳和关于面板都显示 V0.6.5，括号里重复的包版本去掉了。

### OE026 · The 0.6.3 round: the browser panel stops flashing black between frames

The right-side browser panel's live picture flashed black for two to four frames every quarter of a second or so, the
last picture left behind in its top-left corner. The frame painter sized the canvas to each frame's own pixels: the
stream sends one page at several resolutions — a still captured at the page's device pixels beside screencast frames
capped to the panel, and half-size frames while it scrolls — and every `canvas.width`/`height` write clears the canvas
and re-allocates its compositor layer, which the window then showed for those few frames. The canvas now takes the
picture's shape at most the panel's own device pixels, once, and later frames of the same shape are drawn into it,
scaled; a picture of another shape still re-sizes it, because its letterbox in the panel changes with it.

中文：**右侧浏览器面板不再闪黑**。面板里的实时画面每隔约四分之一秒黑两到四帧，左上角还留着上一帧的画面。原因是
画面绘制把 canvas 的像素尺寸跟着**每一帧**的像素尺寸走：同一页在流里会有好几种分辨率（still 按页面的设备像素拍，
screencast 帧按面板上限缩过，滚动时还是半尺寸的帧），而每次写 `canvas.width`/`height` 都会清空画布并重新分配它的
合成层，窗口就把这几帧画成了黑的。现在 canvas 只按画面的形状取一次尺寸，且不超过面板自己的设备像素，之后同形状的帧
都缩放画进这张画布；形状变了的画面（比如换成竖屏预设）仍会重新设尺寸，因为它在面板里的留边跟着变。

### OE025 · The 0.6.2 round: any change a reply applied on its own folds into its bubble

0.6.0 started folding the changes a reply applies on its own into that reply's bubble, but only learned skills. The other
kinds still sat as rows between the bubbles — an automation it updated, a memory it saved, a profile it edited. Now every
card that applied itself, its Undo still there and nothing held back, folds into the bot reply above it, one card or
several. The chip names what landed: skills alone read "New skills learned · added to the library", automations alone
"Automation updated", and a mixed run gives how many changes applied. Opening it shows the same rows as before, Undo and
Details included, and one component (AutoAppliedChangesChip) draws every kind. The chip itself is one card: a single chevron
rotates from right to up as it opens, the rows grow inside the same surface, every row's Undo and Details meet the card's
right edge, the title reads a size above the rows, and the card keeps the bubble's own inset at its sides and its bottom.

中文：**V0.6.2 这一轮**把「bot 自己生效的变更」全部收进它那条回复的气泡。0.6.0 起这个 fork 就开始这样收，但只收了学到的
技能；其它自动生效的变更（改动过的自动化、写入的记忆、改过的资料等）仍一条条散在气泡之间。现在凡是自动生效、没被挂起、
仍带「撤销/详情」的变更卡，不论一条还是几条，都折进上方那条 bot 回复。卡片标题按内容来：只有技能是「已学习新技能，添加至
知识库」，只有自动化是「已更新自动化」，混合的显示「已应用 N 项变更」。展开后还是原来的行，撤销和详情照旧可用；所有类型
共用一个 AutoAppliedChangesChip 组件。卡片本身合成一张：一个 chevron 随展开从朝右转到朝上，展开的行长在同一张卡片里，
每行的撤销/详情对齐到卡片右边，标题比下面的行大一档，卡片左右和底部留出与气泡一致的内边距。

### OE024 · The 0.6.1 round: the bot panel survives the Settings window, and Advanced gets its own menu

Opening Settings on Spending — from the bot panel's or the account menu's Usage row — switched this fork to Advanced,
because Spending is a page only Advanced shows. Advanced draws the bot settings list where the chat head's panel goes, so
after one Settings visit the pill kept opening that list instead of the bot panel, and with 「保持高级模式」 on the mode
outlived a reload. The window now lands on Spending without changing the mode, its menu marks the page it opened on, and
the renderer e2e runs the panel's MCP phase after the Settings phase again instead of reordering them around the bug,
checking the Simple panel the moment the window closes. The avatar menu draws two sets: Simple's stays exactly as it is,
while Advanced adds everything this build can still reach — its tools (Automations, Team map, archived bots and pinned
panels), Apps, Usage and Settings, the phone rows, Help and support (Help Center, feedback, keyboard shortcuts, about),
Check for updates and the signed-in accounts — one group per kind on the existing rows and dividers. Settings search also stops listing the pages and rows only
Advanced shows, because the window can no longer take the person to them. Nothing cloud-only
comes back: My Cloud, the place row, the Cloud account row, Plan & billing, Organization and Files need a Cloud bridge
this build does not ship, and What's new, Sign out and Published apps belong to upstream commits this fork never merged.

中文：**V0.6.1 这一轮**修掉一个真 bug：在「花费」页打开设置窗口（从 bot 面板或头像菜单的用量行进入）会把这个 fork 悄悄切到
高级模式 —— 因为「花费」是只有高级模式才显示的页面。高级模式会在聊天头面板的位置画 bot 设置列表，于是用过一次设置窗口后，
聊天头点开的就一直是那张列表，回不到 bot 面板；开着「保持高级模式」时刷新也回不去。现在设置窗口落到「花费」页不再改动模式，
窗口菜单仍会标出当前所在的页面；渲染器 e2e 也恢复成先设置流程、后面板流程（不再为了绕开 bug 调换顺序），并在关闭窗口的那一刻
检查简易面板还在。头像菜单分成两套：简易模式保持原样；高级模式在此基础上补全本构建还能到达的入口 —— 工具（自动化、团队地图、
归档与固定面板）、应用、用量与设置、手机行、帮助与支持（帮助中心、反馈、快捷键、关于）、检查更新和已登录账号，按类分组、
沿用现有行样式与分隔线。设置搜索也不再列出只有高级模式才有的页与行 —— 窗口已经不会为此切模式。依赖云端的一概不放回：我的云端、位置行、云端账号行、套餐与账单、组织与文件都需要本构建没有的云端桥接；
「新变化」、退出登录、已发布应用属于本 fork 从未合入的上游提交。

### OE023 · The 0.6.0 round: the 0.5.1–0.5.7 work, one release

0.6.0 gathers the rounds since 0.5.0. The sidebar gained one status dot per bot, always in the avatar's bottom-right
corner; 0.5.2 merged upstream's chat streaming, its one-commit-per-paint work while bots run and the rounded window frame,
and the phone pairing screens stopped sending anyone to an app store; 0.5.3 stopped a streamed reply from showing twice
and gave every bot text message the fork's bubble; 0.5.4 let the local release build sign the Mac app with an Apple
Development identity; 0.5.5 added the 「保持高级模式」 switch next to Advanced; 0.5.6 merged upstream's one-window Settings
with this fork's style, its local-only pages and its ten-tap Advanced unlock; 0.5.7 quieted the last screens (a single-line
usage row in the avatar menu, one card for the bot settings list, the 10px gaps in both avatar pickers, MiMo as the fixed
voice provider, skill changes folded into their reply's bubble, archived conversations as the last details row, a trimmed
computer panel, Simple's bubble stacking in Advanced, right-pointing chevrons, and file cards flush with their bubble).
Also in this round: the CHANGELOG's 0.5.6 Settings entry is OE022, the release notes accumulate every round, and the
version label and About panel say V0.6.0.

中文：**V0.6.0 这一轮**把 0.5.0 以来的各轮并成一个正式版本。侧栏每个 bot 一颗状态点，永远在头像右下角；0.5.2 合入上游的
流式回复、bot 工作时每次更新只绘一次的绘制优化和圆角窗框，手机配对页不再把人送去应用商店；0.5.3 修掉流式回复重复、让
每条 bot 文字消息都用本 fork 的气泡；0.5.4 让本机发布包可以用 Apple Development 身份签名；0.5.5 在「高级模式」旁边加了
「保持高级模式」开关；0.5.6 把上游那套一扇窗口的设置页按本 fork 的样式合入，保留 local-only 页面与连点十次的高级模式解锁；
0.5.7 收尾最后几处界面（头像菜单里的用量行只留一行、bot 设置列表收成一张卡片、两处头像选择器统一 10px 间距、语音固定用
MiMo、学习到的技能折进回复气泡、已归档会话成为详情列表最后一行、精简电脑面板、高级模式沿用简易模式的气泡堆叠、详情面板
箭头朝右、只有附件的消息文件卡片与气泡齐平）。这一轮还把 CHANGELOG 里 0.5.6 的设置条目编成 OE022，发布说明汇总各轮，
版本标签和「关于」面板写 V0.6.0。

### OE022 · The 0.5.6 round: upstream's one-window Settings, in this fork's style

The 0.5.6 round merges upstream's Settings rework (#5503) and its follow-up (#5516): Settings is one window with a
grouped outer menu (the place, your account, this app), a search field over pages and rows, and pages for Phone &
devices, AI, Vault, Spending, Data, General, Appearance, Your account and Plan & billing, with the phone pairing line
and the links that name "AI › Other services" the follow-up adds. The structure is upstream's; the colours, corner
radii, spacing and fonts stay this fork's. Everything the fork added stays: the build is local-only, so no MausBot Cloud
or organization row appears; Simple is still the only mode, with the ten-tap unlock on This app revealing the Advanced
switch and the 「保持高级模式」 row inside the new structure; the outer avatar menu is still the fork's own; Appearance
keeps the Bold text and Bloub avatar rows. Where an upstream page builds on commits this fork has not merged (Ollama
one-click, Amazon Bedrock, ModelGo, Tailnet computers, the retired-phone notices, the server self-update button), that
page keeps this fork's own implementation or drops that one entry, so the window is whole without taking those commits:
the AI provider list is the fork's, the key page keeps its rows without the Ollama panel, Phone & devices keeps Wi-Fi
and Keep awake without the relay, Tailnet and retired-phone pieces, Vault keeps its card, a server's version row uses
the menu's own update item, and the away-emails row is not shown. zh and pt-br keep every Settings key; the other
language packs fall back to English for a key they do not carry. No conversation data, no server field, no new enabled
tab: it is the same Settings, regrouped.

中文：**V0.5.6 这一轮**合入上游的设置页重排（#5503）及其后续（#5516）：设置变成一扇窗口 —— 分组的外层菜单（这个位置、
你的账号、这个 App）、覆盖页面和行的搜索框，以及「手机与设备 / AI / 保险库 / 花费 / 数据 / 通用 / 外观 / 你的账号 /
套餐与账单」这些页面，并带上后续那轮的手机配对说明和「AI › 其他服务」链接。分组与组件结构用上游，颜色、圆角、间距、
字体保留本 fork 的样式。我方加的东西都留着：本构建仍是 local-only，不出现 MausBot Cloud 或组织条目；Simple 仍是唯一
模式，在「这个 App」连点十次解锁后，新结构里照样出现「高级模式」开关和「保持高级模式」一行；外层头像菜单仍是我方那套；
外观页保留「粗体文字」和 Bloub 头像两行。有些上游页面依赖本 fork 没合的前置提交（Ollama 一键添加、Amazon Bedrock、
ModelGo、Tailnet 电脑、旧手机链接提醒、服务器自更新按钮），这些页面就保留我方现有实现，或去掉对应的一个入口，不补上游
提交：AI 提供方列表用我方的，密钥页保留原有行但不带 Ollama 面板，手机与设备保留 Wi-Fi 与「保持唤醒」两行、去掉 relay、
Tailnet 和旧手机提醒，保险库保留我方卡片，服务器版本行改用菜单里现成的更新项，离开邮件那一行不显示。zh、pt-br 补齐所有
设置键，其余语言包缺的键回退英文。不改会话数据、不加服务端字段、也不让任何标签页重新亮起：还是同一扇设置窗口，只是重新
分了组。

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
and goal decisions, with their Train corrections. The upstream settings rework was deliberately not in this build; it has since
landed in the 0.5.6 round (OE022).

中文：**V0.5.7 这一轮**合并 `v0.1.151` 之后的上游 batch：bot 的回复边生成边显示；bot 工作时应用每次更新只重绘一次
（每次绘制一个 commit、选择器订阅、单 bot reconcile）；窗口卡的卡片用圆角，各皮肤下窗框与侧栏同色。手机配对页不再
把人送去应用商店 —— 桌面端没有商店链接，也没有商店二维码，菜单里那一行改为配对手机 —— 这一轮还带上社区对连接器、
日历分页、数据表、文件同步、记忆搜索、进程输出和目标决策的修复，以及对应的 Train 修正。上游那套设置页重排这次
故意不合，后来在 V0.5.6 那一轮补上（OE022）。

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
