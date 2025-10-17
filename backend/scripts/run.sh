#!/bin/bash

exec > >(gawk '{ print strftime("%Y-%m-%d %H:%M:%S"), $0; fflush() }') 2>&1

start_time=$(date +%s)
# 备份
cd "$(dirname "$0")/.." || exit 1
JOB=${1:-"backup_all_switches"}
# 执行cron任务
echo "正在执行cron备份任务..."
/home/yiyulin/.local/bin/uv run python -m app.cron --job ${JOB}
if [ "$JOB" != "backup_failed_switches" ]; then
    sleep 10
    /home/yiyulin/.local/bin/uv run python -m app.cron --job backup_failed_switches
fi

end_time=$(date +%s)
duration=$((end_time - start_time - 10))

echo "cron任务执行完成。耗时: ${duration} 秒"