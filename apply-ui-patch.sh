#!/bin/bash
# 把源码里的界面改动"打包"进已安装的正式版 MausBot(OpenMausBot.app)
# 用法:  bash ~/Projects/OpenMausBot/apply-ui-patch.sh
# 作用:  重新构建界面 -> 备份旧界面 -> 覆盖进 App -> 重启 App
# 不必重打整个 App，也不用开发版/配对码。App 更新后重跑一次即可。

set -euo pipefail

APP="/Applications/OpenMausBot.app"
REPO="$HOME/Projects/OpenMausBot"
UI="$APP/Contents/Resources/ui"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$REPO/.ui-backup-$STAMP"

[ -d "$APP" ]  || { echo "找不到 $APP"; exit 1; }
[ -d "$REPO" ] || { echo "找不到源码目录 $REPO"; exit 1; }

cd "$REPO"

echo "== 1/5 检查源码改动"
git -C "$REPO" diff --stat -- src/components/ChatView.tsx || true

echo "== 2/5 构建界面 (约 15 秒)"
npx vite build

echo "== 3/5 备份现有界面 -> $BACKUP"
mkdir -p "$BACKUP"
rsync -a "$UI/" "$BACKUP/"

echo "== 4/5 覆盖 App 界面文件"
rsync -a --delete "$REPO/dist/" "$UI/"

echo "== 5/5 重启 App"
osascript -e 'quit app "OpenMausBot"' 2>/dev/null || true
sleep 2
open -a "$APP"

echo
echo "完成。备份在: $BACKUP"
echo "恢复原界面: rsync -a --delete \"$BACKUP/\" \"$UI/\" && open -a \"$APP\""
