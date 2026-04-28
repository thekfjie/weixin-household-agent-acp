# weixin-household-agent-acp

面向家庭共享场景的微信 AI 网关。

当前开发策略很明确：

- 登录和 transport 尽量参考 `CLI-WeChat-Bridge`
- iLink 协议和媒体链路参考 `openclaw-weixin`、`wechat-ilink-sdk-java`
- 在这个基础上逐步补多账号、分权、会话管理和 Codex 集成

## 当前重点

先做最小可用闭环：

1. 微信扫码登录
2. 凭据持久化
3. 长轮询收消息
4. 基础回复
5. 再接 Codex

## 当前能力

- SQLite 持久化
- iLink API 客户端
- 终端二维码登录命令
- HTTP 健康检查和管理接口
- 多账号轮询 worker 骨架
- 文件发送链路骨架

## 推荐启动方式

### 1. 构建

```bash
corepack pnpm build
```

### 2. 终端扫码登录

默认绑定为 `family` 角色：

```bash
corepack pnpm setup
```

绑定为 `admin`：

```bash
corepack pnpm setup -- admin
```

如果已经有账号，强制继续添加：

```bash
corepack pnpm setup -- --force
```

### 3. 启动服务

```bash
corepack pnpm start
```

## 当前接口

- `GET /healthz`
- `GET /readyz`
- `GET /api/accounts`
- `POST /api/logins`
- `GET /api/logins/:id`
- `GET /api/logins/:id/view`
- `GET /api/logins/:id/qrcode.png`
- `POST /api/accounts/:id/role`

## 文档

- [项目架构 v0](./docs/architecture-v0.md)
- [Windows 本地测试说明](./docs/windows-local-test.md)
