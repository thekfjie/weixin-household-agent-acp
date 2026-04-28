# weixin-household-agent-acp

面向家庭场景的微信 AI 网关，目标是把多个微信号、安全分权、会话管理、文件发送和 Codex 能力接到一起。

当前优先支持两种运行形态：

- Windows 本地联调
- Linux 服务器自托管

## 当前目标

- 支持多个微信账号绑定
- 区分 `admin` 和 `family` 两类权限
- 支持文件发送
- 支持自动摘要与会话恢复
- 所有时间语义统一按北京时间处理

## 当前进度

目前已经落下来的基础能力：

- TypeScript 服务端骨架
- SQLite 持久化
- iLink API 客户端骨架
- 文件上传与发送链路骨架
- HTTP 健康检查与管理接口
- 二维码登录状态管理
- 多账号长轮询 worker 骨架
- Windows 本地启动脚本
- Linux systemd 部署模板

## 当前可用接口

服务启动后，当前可用的管理接口有：

- `GET /healthz`
- `GET /readyz`
- `GET /api/accounts`
- `POST /api/logins`
- `GET /api/logins/:id`
- `GET /api/logins/:id/qrcode.png`
- `POST /api/accounts/:id/role`

### 发起一个新的微信登录

```bash
curl -X POST http://127.0.0.1:18080/api/logins \
  -H "Content-Type: application/json" \
  -d '{"role":"family"}'
```

返回结果里会包含：

- 登录任务 id
- 当前登录状态
- 二维码图片接口
- `data:image/png;base64,...` 形式的二维码数据

## 文档

- [项目架构 v0](./docs/architecture-v0.md)
- [Windows 本地测试说明](./docs/windows-local-test.md)

## Windows 本地测试

推荐直接运行：

```powershell
.\infra\scripts\windows\run-local.cmd
```

如果要显式走 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\windows\run-local.ps1
```
