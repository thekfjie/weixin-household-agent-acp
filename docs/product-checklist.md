# 产品目标核对

本文把最初讨论过的想法和当前实现状态放在一起，方便后续继续推进。

## A. 产品目标

- 家里人直接在微信里和 AI 聊：已实现基础聊天链路，family 角色有输出过滤和更自然的 prompt。
- admin 高权限身份：已实现 admin/family 角色区分，admin 有 `/file`、`/files`、`/accounts`、`/sessions` 等运维命令；面向个人家庭服务器的一键安装默认给服务用户 full sudo，可用 `PERMISSION_MODE=none|limited` 降权。
- 长期运行在新加坡服务器：已用 systemd 托管，默认端口 `18080`，数据目录默认 `/var/lib/weixin-household-agent-acp`。
- 简单安装/卸载/重装：已有 bootstrap、install、uninstall；卸载按安装清单恢复环境，`--keep-data` 可保留数据。

## B. 功能目标

- 多微信账号绑定：已支持多账号登录、账号列表、角色修改、启停。
- 权限分层：已支持 admin/family；family 默认最小环境变量和输出过滤。
- 文件能力：已支持 admin 发送白名单目录文件，包括 CLI、微信 `/file`、自然语言触发、admin 结构化动作标记；已预留 `inbox/office/outbox` 办公文件工作区。
- 会话管理：已自动按微信 peer 建 active session；`/new`/`/reset` 清上下文；`/sessions` 可查看最近会话。ACP sessionId 映射会持久化；如果 adapter 声明支持 `session/load`，服务重启后会尝试恢复。
- 时间语义：prompt 中统一带北京时间锚点；后续 summary/memory 继续沿用。
- 输出控制：admin 保留更多错误信息但已做脱敏；family 不返回内部路径、命令、工具细节。

## C. 开发原则

- 不重新发明太多：transport/iLink/ACP 都优先参考现有项目；`codex-acp` 作为项目依赖使用。
- 先登录收发，再复杂能力：已完成登录、收发、文件 E2E、Codex CLI/ACP 接入。
- 先把安装器做好：已有一键安装、安装后 doctor、自恢复卸载清单。
- Windows 和 Linux 调试部署：已有 Windows 本地脚本和 Linux systemd 脚本。
- Markdown 文档中文：README、架构、roadmap、核对表均为中文。

## 当前建议配置

单人服务器推荐直接统一到 `ubuntu`：

```text
systemd User=ubuntu
HOME=/home/ubuntu
/home/ubuntu/.codex/auth.json 存在
/home/ubuntu/.codex/config.toml 存在
CODEX_ADMIN_BACKEND=acp
CODEX_ADMIN_ACP_AUTH_MODE=auto
CODEX_FAMILY_BACKEND=acp
CODEX_FAMILY_ACP_AUTH_MODE=auto
```

关键原则：不要用跨用户 `/usr/local/bin/codex` wrapper。CLI 后端和 ACP 后端必须看到同一个真实用户、同一个 `HOME`、同一套 `~/.codex`。

## 仍未完全完成

- ACP session 真正跨重启恢复取决于 adapter 是否声明 `loadSession=true`；本项目已持久化映射并会自动尝试恢复，不支持时自动新建。
- 定时 sum-up 和 memory/skill：已有 summary 字段和 prompt 锚点，尚未做定时任务。
- family 办公文件 E2E：出站文件已通，入站文件下载/解密仍待补齐；技能默认不从公开市场自动安装。
- 图片/视频/语音的完整媒体发送：普通文件已通，图片/视频缩略图仍待单独实现。
- 公众号/文章卡片：iLink 公开结构不稳定，当前只能尽量从文本/XML 摘要。
- 更细流式体验：ACP chunk 已收集，但微信端目前仍是最终文本或分段文本发送。
