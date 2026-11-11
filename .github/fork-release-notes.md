## V0.3 中文说明（基于官方 v0.1.151）

本次个人构建（0.3.0，界面显示 V0.3）cherry-pick 官方 `949cabedd`、`5beba1276`、`d48997f07`，基于官方 `v0.1.151`。

- **中文/日文记忆召回**：记忆检索从整句匹配改为中日文分词索引（`server/cjk-search.ts`），中文或日文笔记可以按句子里的某个词被召回。
- **密钥加密存储**：桌面端把全部 AI provider 密钥收进系统加密存储 `credentials.bin`；打包版首次启动时把 `config.json` 里的明文字段迁过去（先写加密副本、成功后再删明文，失败不丢密钥）。`config.json` 仍保留每引擎的 `instances.*.key/environment`、OpenCode provider 密钥与 MCP header 明文，这部分没有加密。
- **新连接应用自动授权**：连接应用成功后立即对 bot 生效，界面显示「Your bots can now use {app}.」，点 Change 可打开每个 bot 的开关调整；原来那条「每个 bot 单独授权」的过时提示已从所有语言包删除。
- **key-readback 测试修复**：补上 MiMo 语音密钥在 e2e 里的期望顺序，并给本地回环 stand-in 加 `/mimo` 路由与 `OMB_MIMO_API`，修掉 `main` 上长期失败的 `scripts/testing/key-readback.e2e.test.ts`。

上游 `f3b00bb86` 评估后以空提交保留：它修的是官方 `v0.1.151` 之后才引入的 sandbox 权限回归，本基线没有它要改的代码（`advertisedGrants`、app-sandbox e2e）。

安装包未签名、未公证；应用内自动更新已短路（不会连上游更新源，也永远不会被上游版本替换）。界面上原有的汉化、Simple-only、Bloub 头像与各批 UI 定制保持不变。

**Windows 首次打开**：会弹出 SmartScreen「Windows 已保护你的电脑」提示，点「更多信息 → 仍要运行」即可。
