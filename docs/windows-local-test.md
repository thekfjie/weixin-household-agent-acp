# Windows 本地测试说明

这份说明面向当前开发机：

- 仓库目录：`E:\program\weixin-household-agent-acp`
- 目标：先在 Windows 上完成本地联调，再迁移到 Linux 服务器

## 1. 当前默认行为

为了方便 Windows 本地测试，项目默认把运行目录都放在仓库内部：

- 数据目录：`./data`
- admin 工作目录：`./runtime/codex-admin`
- family 工作目录：`./runtime/codex-family`

这样本地测试时不需要先准备 `/srv/...` 目录。

如果后面要迁移到 Linux，可以通过环境变量覆盖这些路径。

## 2. 推荐启动方式

直接运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\windows\run-local.ps1
```

脚本会做这些事：

1. 设置本地 `COREPACK_HOME`
2. 设置本地 `PNPM_HOME`
3. 创建 `data` 和 `runtime` 目录
4. 安装依赖（如果尚未安装）
5. 执行构建
6. 启动当前服务

## 3. 如需手动运行

```powershell
$env:COREPACK_HOME = ".\.corepack"
$env:PNPM_HOME = ".\.pnpm-home"
corepack pnpm install
corepack pnpm build
node .\dist\apps\server\index.js
```

## 4. 可覆盖的环境变量

常用变量如下：

- `PORT`
- `TIMEZONE`
- `DATA_DIR`
- `WECHAT_API_BASE_URL`
- `WECHAT_CDN_BASE_URL`
- `WECHAT_CHANNEL_VERSION`
- `WECHAT_ROUTE_TAG`
- `CODEX_ADMIN_COMMAND`
- `CODEX_ADMIN_MODE`
- `CODEX_ADMIN_WORKSPACE`
- `CODEX_FAMILY_COMMAND`
- `CODEX_FAMILY_MODE`
- `CODEX_FAMILY_WORKSPACE`

## 5. Windows 下的 Codex 命令

项目默认会优先使用：

- Windows：`codex.cmd`
- 非 Windows：`codex`

如果你的本机命令名不同，可以手动设置：

```powershell
$env:CODEX_FAMILY_COMMAND = "codex.cmd"
$env:CODEX_ADMIN_COMMAND = "codex.cmd"
```

## 6. 当前适合验证的内容

现在比较适合在本地先验证这些：

- 配置读取
- 数据库初始化
- 会话创建
- Codex 路由预览
- 文件上传发送模块的入参和出参
- 二维码登录流程骨架

## 7. 暂未完成的部分

虽然现在已经适配了 Windows 本地开发，但下面这些还没正式串完：

- 真正可交互的二维码登录命令
- 真正的长轮询消息循环
- 真实 Codex 执行与微信消息闭环
- 真实微信文件发送 smoke test
