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
BIN="$APP/Contents/MacOS/OpenMausBot"
# 等旧实例真正退出，否则 open 只会激活那个正在退出的实例：最多等 20 秒。
for _ in $(seq 1 20); do
  pgrep -f "$BIN" >/dev/null 2>&1 || break
  sleep 1
done
if pgrep -f "$BIN" >/dev/null 2>&1; then
  echo "!! App 20 秒内没有退出，无法重新打开；请手动退出后再运行本脚本。" >&2
  exit 1
fi
# open 后轮询确认新进程真的起来了；最多重试 2 次，每次间隔 2 秒。
launched=0
for attempt in 1 2 3; do
  env -u ELECTRON_RUN_AS_NODE open -a "$APP" 2>/dev/null || true
  for _ in $(seq 1 15); do
    pgrep -f "$BIN" >/dev/null 2>&1 && { launched=1; break; }
    sleep 1
  done
  [ "$launched" = "1" ] && break
  [ "$attempt" -lt 3 ] && sleep 2
done
if [ "$launched" != "1" ]; then
  echo "!! App 没有自动起来，请手动打开 OpenMausBot。" >&2
  exit 1
fi

echo
echo "完成。备份在: $BACKUP"
echo "恢复原界面: rsync -a --delete \"$BACKUP/\" \"$UI/\" && open -a \"$APP\""
