# OpenMausBot（个人 fork）

> 官方原版：<https://github.com/milind-soni/OpenMausBot>。想看原版功能说明、截图和上游文档，去官方仓库；本文件只记录我自己的改动和用法。
> 原版英文 README 保留在 [README.upstream.md](README.upstream.md)，合并上游时用它对照差异。

## 这是什么

这是我自用的 OpenMausBot 个人 fork：在官方代码之上按自己的使用习惯改界面、加汉化、关掉不需要的东西。

- **只保留 Simple 模式**（`SIMPLE_ONLY = true`），不提供 Advanced 模式开关。
- **版本号自己一套**：V0.1、V0.2……跟官方版本号无关；每个版本基于官方哪个 tag（例如 `v0.1.151`）写在 [CHANGELOG.md](CHANGELOG.md) 的对应小节里。
- 发布走本仓库的 GitHub Releases，一律标为 pre-release；不发布 npm 包、Docker 镜像或其它渠道。

## 和官方的主要区别

- **Simular 云端桌面**：屏幕面板里可以直接选 Simular Box；只要「应用 → MCP 服务器」里有任一已启用、已登录且名字包含 `simular` 的 MCP（托管版通常叫 `simular-cloud`）就算就绪，不再要求服务器名严格等于 `simular`。
- **隐藏滚动条**：所有滚动区域仍然可滚动，但不显示滚动条。
- **界面定制**：
  - 聊天顶部资料胶囊去掉右侧 `›` 箭头，左右内边距对称；
  - 输入框下沿用渐隐层把消息淡出到画布，不硬裁；
  - 会话底部的输入框、消息气泡与渐隐层有明确层级，滚动区铺到窗口底边；
  - @ 提及 chip 与正文中线对齐且不被压扁；
  - 图片气泡四边内边距一致（含「文字 + 图片」混合气泡的底部）；
  - 深色模式下白色头像的「我」气泡与输入框两个语音按钮统一为 `#3B3B3B` 底、`#F5F5F5` 文字/图标；
  - 侧边栏去掉 bot 与群组之间的分割线，主 bot 卡片改方形，非主 bot 头像去掉灰色外框，群头像整体放大 1.2 倍；
  - 展开侧栏的搜索、收件箱、`+` 移到左下角用户头像那一行（顶部对应按钮与「连接应用」隐藏）；
  - 侧栏可以整体隐藏，左边缘留一个细长提手，点击或向右拖可唤回收起状态的侧栏；
  - 姿态/头像相关的小修（Bloub 头像、群组头像、行圆角等）。
- **汉化**：右键菜单（含「更多」子菜单）、首次回复提示、新 bot 引导卡片、设置页大部分新增文案等均为中文。
- **关闭自动更新**：App 启动时短路 updater，不会去连官方更新源，也就不会把自己替换成官方版本；升级只能手动装新版。
- **精简入口**：按需隐藏了一些云服务/付费相关入口与设置项（详见 CHANGELOG 里的 A 编号条目）。

## 下载安装

到本仓库的 **Releases** 页面下载（个人构建均为 pre-release，选择最新 `v0.x.y`）：

- **macOS arm64**：`.dmg` 或 `.zip`
- **Windows x64**：`OpenMausBot-<版本>-setup.exe`

安装说明：

- **macOS**：包未签名、未公证。首次打开如果被拦，右键 App →「打开」，或到「系统设置 → 隐私与安全性」里点「仍要打开」。如果提示「已损坏」，先去掉隔离属性再打开（把路径换成实际的 App 路径）：
  ```bash
  xattr -dr com.apple.quarantine /Applications/OpenMausBot.app
  ```
- **Windows**：安装包未签名，SmartScreen 会提示「Windows 已保护你的电脑」，点「更多信息 → 仍要运行」即可。
- **升级**：不会自动更新；下载新版安装包覆盖安装即可。安装前建议先退出旧版。

## macOS 首次打开要授予的权限

App 会在第一次用到对应能力时申请，也可以在「系统设置 → 隐私与安全性」里手动勾选：

- **麦克风**：输入框语音输入。
- **语音识别**：本机听写（Apple 语音识别）。
- **辅助功能**：bot 需要控制这台 Mac 时使用。
- **屏幕录制**：bot 需要看屏幕内容时使用。
- **下载文件夹**：从「下载」目录取文件、把生成的文件放进「下载」时使用。

授予或改动权限后，重启一次 App 让权限生效。

## 常用开发命令

需要 Node ≥ 24、pnpm（仓库自带 `packageManager` 版本声明，建议用 Corepack 或对应版本）。

```bash
pnpm install            # 装依赖
pnpm dev                # 前端开发服务器（Vite）
pnpm typecheck          # TypeScript 检查（前端 + server）
pnpm lint               # oxlint，警告也当错误
pnpm i18n:check         # 语言包键完整性检查
pnpm build              # 构建前端 + server
```

打包（产物在 `release/`）：

```bash
pnpm package:mac:arm64  # macOS arm64：dmg + zip
pnpm package:win        # Windows x64：NSIS 安装包 exe + zip
```

只把界面改动替换进已安装的 App（不打整包、不动 `app.asar` 和数据目录）：

```bash
bash apply-ui-patch.sh
```

这个脚本会重新构建前端，把 `dist/` 覆盖到已安装 App 的 `Contents/Resources/ui/`，退出并重启 App，并在仓库里留下 `.ui-backup-<时间戳>/` 作为界面备份。

推送前本地钩子会跑源文件检查（例如文件行数上限 ratchet），本地失败就先修，别绕过。

## 版本号规则

- `package.json` 用 semver：`0.2.0` 这样。
- 界面里显示成 `V0.2`（`src/fork/version-label.ts`，macOS 原生 About 面板同步显示），两者靠同一常量对应。
- git tag 用 `v0.x.y`，Release 标 pre-release。
- [CHANGELOG.md](CHANGELOG.md) 每个版本新增一节：写清「基于官方 vX.Y.Z」和本版全部改动；历史 A 编号条目保留、不复用。

## 合并上游的流程

1. 取官方更新：`git fetch origin`（本仓库的 `origin` 指官方仓库）。
2. 先打备份 tag：`git tag backup/before-upstream-<日期或版本>`。
3. 开临时分支试合：`git checkout -b feat/merge-upstream-<版本>`，再 `git merge <官方 tag>`。
4. 冲突原则：**保留我方定制**——`SIMPLE_ONLY`、各 fork 常量、界面改动、汉化、updater 短路、精简入口；上游的新功能和修复尽量接进来，冲突处「接上游逻辑、留我方 UI」。
5. 合完跑 `pnpm typecheck`、`pnpm lint`、`pnpm i18n:check`；涉及打包/窗口的改动再跑一次 `pnpm package:mac:arm64` 冒烟。
6. 文件行数 ratchet 按合并后的实际行数更新（`scripts/testing/file-size-ratchet.test.ts`），不为了过检查拆无关代码。
7. 全部通过后再合进 `main`；试合失败就 `git merge --abort`，`main` 不被污染。

## 回滚方法

- **代码回滚**：回到备份 tag（`git checkout <backup tag>` 后用新分支继续），或对合并提交 `git revert -m 1 <merge commit>`。不推荐 `reset --hard`，避免丢提交。
- **整包回滚**：替换 App 前先把整个 `.app` 备份一份；回滚时退出 App，把备份的 `.app` 拷回 `/Applications` 即可。
- **只回滚界面**：`apply-ui-patch.sh` 每次都会生成 `.ui-backup-<时间戳>/`，用它覆盖回 App 的 `Contents/Resources/ui/` 再重启 App。
- 以上操作都不要动 App 的数据目录（会话、账号、配置都在里面）。

## 说明

- 本仓库是个人 fork，不打算合回官方；官方 Issues/PR 流程以官方仓库为准。
- 本文件不记录任何密钥、账号、个人路径或私有域名。
