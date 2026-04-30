# 后续计划

本文记录当前讨论过、但不一定马上做完的事项。优先级会随着服务器实测结果调整。

## P0 当前链路稳定

- 确认服务用户、`HOME`、`~/.codex`、`codex-acp` 登录态一致。
- 服务器运行 `node dist/apps/server/doctor.js --acp-session` 验证 ACP 链路。
- 微信里分别测试 admin/family 聊天、输出过滤、文件发送。

## P1 安装体验

- 已做：一键安装后自动运行 `doctor.js`。
- 已做：README 明确说明 Codex CLI 不由安装器自动安装，建议安装在服务用户自己的用户目录里。
- 已做：README 明确说明不要用跨用户 wrapper 混淆 CLI/ACP 登录态。
- 后续可选：安装器增加交互式提示，检测 `codex` 是否疑似 sudo 到别的用户。

## P2 会话和 ACP

- 已做：ACP 后端按微信会话复用 ACP session。
- 已做：`/new` 和 `/reset` 会清掉当前微信会话的 ACP session 映射。
- 已做：`/sessions` 查看最近会话。
- 已做：持久化微信会话到 ACP sessionId 的映射；如果 ACP adapter 声明 `loadSession=true`，服务重启后会尝试 `session/load` 恢复。
- 后续可选：如果当前 codex-acp 不声明 `loadSession=true`，需要继续跟进 adapter 支持情况；不支持时只能自动新建 session。
- 后续可选：补 `/sessions`、`/switch`，但家庭普通用户默认不需要自己切会话。
- 后续可选：定时 sum-up，逐步演进成 skill/memory。

## P3 家庭体验

- 已做：family prompt 要更像家里人微信聊天：简短、自然、先给结论。
- 已做：family 不暴露内部命令、文件路径、系统配置和工具调用细节。
- 已做：北京时间锚点继续保留在 prompt、摘要和后续 memory 中。

## P4 文件能力

- 已做：admin 可以用 `/file <path> [caption]` 发送白名单目录文件。
- 已做：admin 可以用自然语言触发简单文件发送，例如“把 /tmp/test.txt 发给我”。
- 已做：family 默认不能直接触发服务器文件发送。
- 已做：admin 链路支持 `[[send_file path="..." caption="..."]]` 结构化动作标记，让模型能触发文件发送。
- 后续可选：图片、视频、语音的专门媒体链路和缩略图处理。

## P5 低优先级体验优化

- 已做：分段回复：长回答按段落拆成多条微信消息，降低单条过长的问题。
- 已做：输入状态续期：当前已经会在 Codex 回复期间定时刷新“正在输入中”；后续可以根据 iLink 实测调整间隔。
- 已做：思考中提示：长耗时回复会在超时阈值后发一条短提示，避免用户以为服务卡死。
- 更细的流式体验：ACP 已收集流式 chunk，但当前仍汇总后一次发回微信。后续可以研究边生成边分段发送。

## P6 运维与安全

- 已做：用户身份一致：systemd `User=`、`HOME`、`~/.codex` 和 `codex-acp` 看到的身份必须一致。
- 已做：默认不授予 sudo；如需 admin 运维能力，再显式选择 limited/full。
- 已做：用户可见错误先脱敏，避免把 key、token、Bearer 等敏感信息发回微信。
- 已做：提供数据目录备份命令；默认不复制 `.env` 和 `~/.codex` 凭据。
- 已做：提供数据目录恢复命令，恢复需要显式 `--yes`。
- 已做：doctor 检查 `.env` 权限和数据目录磁盘空间。
- 后续可选：日志脱敏、服务健康监控、数据库 VACUUM/修复工具。
