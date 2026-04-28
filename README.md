# weixin-household-agent-acp
面向日常使用的 wxagent 接入层。 share your top ai

面向家庭场景的微信 AI 网关，后端以 Codex 为核心执行引擎。

这个仓库当前优先支持两种运行形态：

- Windows 本地测试
- Linux 宿主机自托管

## 当前目标

- 支持多个微信账号绑定
- 区分 `admin` 和 `family` 两类权限
- 支持文件发送
- 支持自动摘要与会话恢复
- 所有时间语义统一按北京时间处理

## 当前状态

- 已完成项目架构文档
- 已完成第一版 TypeScript 服务端骨架
- 已接入 SQLite 持久化底座
- 已接入 iLink API 客户端骨架
- 已实现文件发送链路骨架
- 已补齐 Windows 本地测试脚本

## 文档

- [项目架构 v0](./docs/architecture-v0.md)
- [Windows 本地测试说明](./docs/windows-local-test.md)

## Windows 本地测试

推荐直接用 PowerShell 脚本：

```powershell
pwsh -File .\infra\scripts\windows\run-local.ps1
```

如果你用的是 Windows PowerShell，也可以：

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\windows\run-local.ps1
```
