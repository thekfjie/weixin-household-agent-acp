# weixin-household-agent-acp

面向家庭共享场景的微信 AI 网关。

目标是让家里人直接在微信里和 AI 聊，同时保留一个高权限 `admin` 身份用于运维、代码和系统任务。服务长期运行在 Linux 服务器上，业务时间统一按北京时间理解。

## 一键部署

### 服务器上按这个顺序做

先用你的普通登录用户 SSH 到服务器，不要切到 root：

```bash
whoami
pwd
node -v
git --version
sudo -v
```

要求：

- `node -v` 至少是 `v22.5.0`
- 当前用户可以执行 `sudo`
- 不要用 `sudo su -` 之后再安装

如果 Node 版本不够，先用你服务器上习惯的方式安装 Node.js 22 或更高版本，再继续。

然后执行一键安装：

```bash
curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-agent-acp/main/infra/scripts/linux/bootstrap.sh | bash
```

安装过程里如果停在二维码，直接用你的微信扫码并在手机上确认。确认后脚本会继续运行并启动服务。

安装完成后检查：

```bash
curl http://127.0.0.1:18080/healthz
sudo systemctl status weixin-household-agent-acp
journalctl -u weixin-household-agent-acp -f
```

确认 Codex CLI 可被服务用户非交互调用：

```bash
whoami
codex --version
codex exec --skip-git-repo-check "请用一句话回复：Codex 已接通"
```

如果这里要求登录，就按提示登录。注意要用 systemd service 里的同一个用户登录。默认安装时通常是当前用户，可以这样确认：

```bash
systemctl cat weixin-household-agent-acp
```

运行自检：

```bash
cd /opt/weixin-household-agent-acp
node dist/apps/server/doctor.js
node dist/apps/server/doctor.js --json
```

如果你已经装过旧版本，现在要更新到最新代码并重启：

```bash
cd /opt/weixin-household-agent-acp
git pull
corepack pnpm install --frozen-lockfile
corepack pnpm build
sudo systemctl restart weixin-household-agent-acp
journalctl -u weixin-household-agent-acp -f
```

后续要添加家人的微信账号：

```bash
cd /opt/weixin-household-agent-acp
node dist/apps/server/setup.js family --force
sudo systemctl restart weixin-household-agent-acp
```

账号管理：

```bash
node dist/apps/server/accounts.js list
node dist/apps/server/accounts.js role <account_id> family
node dist/apps/server/accounts.js disable <account_id>
node dist/apps/server/accounts.js enable <account_id>
```

发送文件测试：

```bash
cd /opt/weixin-household-agent-acp
node dist/apps/server/send-file.js --list
node dist/apps/server/send-file.js --latest --file /tmp/test.txt --caption "测试文件"
```

说明：

- 目标微信必须先给机器人发过消息，这样系统才有 `context_token` 可以回传文件。
- `--latest` 会发给最近活跃会话；更稳的方式是先 `--list`，再用 `--session <id>` 指定目标。
- 文档里的 `<id>` 是占位符，不要带尖括号照抄；例如 `--session 845418ba...`。
- v0 文件路径统一按微信 `FILE` 发送；图片/视频缩略图后续单独补，不影响普通文件。
- admin 也可以在微信里用 `/file /tmp/test.txt 测试文件` 发送白名单目录里的服务器文件；family 不能用这个命令。

重装但保留微信账号和会话数据：

```bash
bash /opt/weixin-household-agent-acp/infra/scripts/linux/uninstall.sh --yes --keep-data
curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-agent-acp/main/infra/scripts/linux/bootstrap.sh | bash
```

彻底卸载并尽量恢复安装前环境：

```bash
bash /opt/weixin-household-agent-acp/infra/scripts/linux/uninstall.sh --yes
```

在 Linux 服务器上用普通登录用户运行，不要加 `sudo`：

```bash
curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-agent-acp/main/infra/scripts/linux/bootstrap.sh | bash
```

脚本会自动完成：

1. 拉取或更新仓库到 `/opt/weixin-household-agent-acp`
2. 准备本地 pnpm/corepack 缓存
3. 安装依赖并构建
4. 写入 `.env` 和 systemd service
5. 如果还没有微信账号，停在终端二维码登录；扫码确认后继续
6. 启动 `weixin-household-agent-acp` 服务

### 权限说明

- 入口命令必须由普通登录用户执行，不要用 `sudo bash ...`。
- 如果 `/opt` 只有 root 可写，bootstrap 会用 `sudo` 创建 `/opt/weixin-household-agent-acp`，并只把这个项目目录 `chown` 给当前用户，方便后续 `git pull`、依赖安装和构建；不会修改 `/opt` 本身。
- 安装器会在需要写入 `/var/lib/weixin-household-agent-acp`、`/etc/systemd/system`、`/etc/sudoers.d` 和执行 `systemctl` 时单独请求 sudo。
- 默认 `USER_MODE=current`，systemd 服务用当前登录用户运行，适合你自己的 admin Codex 环境。
- 如果选择 `USER_MODE=dedicated`，安装器会创建或复用专用服务用户；卸载时只有安装器创建的用户才会自动删除。
- 默认 `PERMISSION_MODE=none`，不会给服务用户额外 sudo 权限；`limited/full` 要明确知道风险后再开。

常用覆盖方式：

```bash
curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-agent-acp/main/infra/scripts/linux/bootstrap.sh | PORT=18080 LOGIN_ROLE=admin PERMISSION_MODE=none bash
```

默认首个扫码账号绑定为 `admin`。后续添加家人账号：

```bash
cd /opt/weixin-household-agent-acp
node dist/apps/server/setup.js family --force
sudo systemctl restart weixin-household-agent-acp
```

## 本地直接运行

已经 clone 仓库时，Linux/macOS 可直接运行：

```bash
bash run.sh
```

Windows 可直接运行：

```powershell
.\infra\scripts\windows\run-local.cmd
```

这两个入口都会自动安装依赖、构建、必要时扫码绑定，然后启动服务。已有账号时会跳过扫码。

## 运维命令

```bash
sudo systemctl status weixin-household-agent-acp
journalctl -u weixin-household-agent-acp -f
curl http://127.0.0.1:18080/healthz
```

卸载：

```bash
bash /opt/weixin-household-agent-acp/infra/scripts/linux/uninstall.sh --yes
```

保留微信账号、会话和附件数据：

```bash
bash /opt/weixin-household-agent-acp/infra/scripts/linux/uninstall.sh --yes --keep-data
```

安装器会写入安装清单：

- `/opt/weixin-household-agent-acp/.install-state`
- `/var/lib/weixin-household-agent-acp/install-state.env`

卸载会按清单恢复环境：停用并删除本项目 systemd 服务，恢复安装前备份过的 service/sudoers，删除安装器创建的应用目录、数据目录和服务用户。使用 `--keep-data` 时会保留数据目录，并默认保留服务用户，避免保留的数据变成无人拥有。

## 当前能力

- SQLite 持久化
- iLink API client
- 终端二维码登录命令
- HTTP 健康检查和管理接口
- 多账号轮询 worker 骨架
- 文件发送链路骨架
- 服务器本地 CLI 文件发送
- admin 微信 `/file` 发送白名单目录文件
- admin 微信 `/files` 查看白名单目录文件
- admin 微信 `/accounts` 查看账号角色和状态
- family 输出过滤
- 北京时间上下文注入
- Codex CLI 非交互回复链路
- Codex 回复期间尝试显示微信“正在输入中”
- family Codex 子进程默认最小环境变量
- OpenAI-compatible API 中转 wrapper
- 账号管理 CLI 和 doctor 自检 CLI
- 收到图片/语音/文件/视频时转成文本摘要进入对话

## 当前接口

- `GET /healthz`
- `GET /readyz`
- `GET /api/accounts`
- `POST /api/logins`
- `GET /api/logins/:id`
- `GET /api/logins/:id/view`
- `GET /api/logins/:id/qrcode.png`
- `POST /api/accounts/:id/role`

## 开发策略

- 登录和 transport 优先参考 `CLI-WeChat-Bridge`
- iLink 协议和媒体链路参考 `openclaw-weixin`、`wechat-ilink-sdk-java`
- 先确保登录收发和安装体验，再继续补 Codex 自动回复、文件 E2E、skill/memory

## Codex 配置

默认调用方式：

```env
CODEX_ADMIN_COMMAND=codex
CODEX_ADMIN_ARGS=exec --skip-git-repo-check
CODEX_FAMILY_COMMAND=codex
CODEX_FAMILY_ARGS=exec --skip-git-repo-check
CODEX_TIMEOUT_MS=180000
```

### Codex CLI 的官方登录 / API key 模式

推荐让本项目始终调用 `codex exec`，然后用同一个服务用户的 `~/.codex/config.toml` 决定 Codex CLI 走官方登录还是 sub2api/API key。

官方登录模式：

```bash
codex login
codex exec --skip-git-repo-check "请用一句话回复：Codex 已接通"
```

sub2api/API key 模式：先改 `/opt/weixin-household-agent-acp/.env`，填入你的中转站地址和 key：

```env
CODEX_CLI_AUTH_MODE=api_key
CODEX_CLI_BASE_URL=https://你的-sub2api/v1
CODEX_CLI_API_KEY=sk-你的key
CODEX_CLI_MODEL=gpt-5.4
CODEX_CLI_REVIEW_MODEL=gpt-5.4
CODEX_CLI_REASONING_EFFORT=xhigh
CODEX_CLI_WIRE_API=responses
CODEX_CLI_DISABLE_RESPONSE_STORAGE=true
CODEX_CLI_NETWORK_ACCESS=enabled
CODEX_CLI_CONTEXT_WINDOW=1000000
CODEX_CLI_AUTO_COMPACT_TOKEN_LIMIT=900000
```

然后用运行 systemd 的同一个用户写入 Codex CLI 配置。默认安装一般就是当前用户；如果 `systemctl cat weixin-household-agent-acp` 里是 `User=ubuntu`，就直接运行：

```bash
cd /opt/weixin-household-agent-acp
node dist/apps/server/configure-codex.js --dry-run
node dist/apps/server/configure-codex.js --apply
codex exec --skip-git-repo-check "请用一句话回复：Codex 已接通"
sudo systemctl restart weixin-household-agent-acp
```

这个命令会写：

```text
~/.codex/config.toml
~/.codex/auth.json
```

并在覆盖前自动备份旧文件。`--dry-run` 会隐藏 API key，只打印将要写入的配置。

默认环境隔离：

```env
CODEX_ADMIN_ENV_MODE=inherit
CODEX_FAMILY_ENV_MODE=minimal
CODEX_FAMILY_ENV_PASSTHROUGH=
```

`family` 默认只继承 PATH、HOME、TMP 等运行必需环境变量，不继承服务进程里的 API key、内部配置和其他敏感变量。确实需要给 family 的 wrapper 放行变量时，用英文逗号白名单：

```env
CODEX_FAMILY_ENV_PASSTHROUGH=CODEX_API_BASE_URL,CODEX_API_KEY,CODEX_API_MODEL
```

服务会把微信消息整理成 prompt 后追加到 args 最后，相当于执行：

```bash
codex exec --skip-git-repo-check "<整理后的微信上下文>"
```

如需测试 admin 高权限模式，不建议写成默认值；请确认风险后手动改 `/opt/weixin-household-agent-acp/.env`，例如：

```env
CODEX_ADMIN_ARGS=exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox
```

改完后重启：

```bash
sudo systemctl restart weixin-household-agent-acp
```

如果后续要切到你的 API 中转站，推荐先做一个本地 wrapper 脚本，让本项目仍然只调用一个命令。比如把 `.env` 改成：

```env
CODEX_ADMIN_COMMAND=node
CODEX_ADMIN_ARGS=dist/apps/server/codex-api-wrapper.js
CODEX_FAMILY_COMMAND=node
CODEX_FAMILY_ARGS=dist/apps/server/codex-api-wrapper.js --family
CODEX_API_BASE_URL=https://你的中转站/v1
CODEX_API_KEY=你的中转站密钥
CODEX_API_MODEL=你的模型名
CODEX_FAMILY_ENV_PASSTHROUGH=CODEX_API_BASE_URL,CODEX_API_KEY,CODEX_API_MODEL
```

内置 wrapper 从最后一个参数读取本项目整理好的 prompt，再调用 OpenAI-compatible `/chat/completions` 中转站 API。这样微信 transport、权限、会话和文件链路都不用改，只替换 AI 后端。

## 文件发送

文件发送走 iLink 原生媒体链路：

```text
本地文件
-> 计算明文大小和 MD5
-> AES-128-ECB 加密
-> getuploadurl(media_type=3)
-> POST 上传密文到 CDN
-> sendmessage(FILE)
```

常用命令：

```bash
node dist/apps/server/send-file.js --list
node dist/apps/server/send-file.js --session <session_id> --file /path/to/file.pdf
node dist/apps/server/send-file.js --latest --file /tmp/test.txt --caption "给你一个文件"
```

注意：`<session_id>` 只是占位符，实际运行时要替换成 `--list` 输出里的真实 `session=` 值，并且不要带 `< >`。例如：

```bash
node dist/apps/server/send-file.js --session 845418ba79257a760be28115f12ac43b78a992f9 --file /tmp/test.txt --caption "测试文件"
```

如果出现 `CDN upload client error 404`，说明登录和会话已经通了，失败点在微信 CDN 上传。先确认代码已更新并重新构建；新版会优先使用 `getuploadurl` 返回的完整上传地址，并在报错里打印不含 query 的 CDN 目标路径，方便继续排查。

admin 微信命令：

```text
/file /tmp/test.txt 测试文件
/file /var/lib/weixin-household-agent-acp/outbox/report.pdf
/files
/accounts
```

微信里的 `/file` 只允许发送 `FILE_SEND_ALLOWED_DIRS` 里的文件，默认 Linux 安装为：

```env
FILE_SEND_ALLOWED_DIRS=/var/lib/weixin-household-agent-acp/outbox:/tmp
FILE_SEND_MAX_BYTES=52428800
```

如果要允许更多目录，改 `/opt/weixin-household-agent-acp/.env` 后重启服务。服务器本地 `send-file.js` CLI 默认不受这个白名单限制，因为能 SSH 到服务器本身就已经是运维权限。

接收侧目前会把图片、语音、文件、视频转成文字摘要交给 AI，例如“收到文件：xxx.pdf”。如果微信/iLink 把公众号文章卡片以 XML 文本交给我们，会尽量提取标题、描述和链接；但当前公开 iLink 消息结构没有正式列出公众号文章类型，OpenClaw 社区里这仍是开放需求，所以不能保证所有公众号转发都能收到。

## 正在输入中

普通聊天消息进入 Codex 回复链路时，服务会先调用 iLink `getconfig` 获取 `typing_ticket`，再用 `sendtyping(status=1)` 显示“正在输入中”，回复结束后用 `sendtyping(status=2)` 取消。这个能力依赖微信/iLink 当次是否返回 `typing_ticket`，失败时只写服务日志，不会影响正常回复。

## 文档

- [项目架构 v0](./docs/architecture-v0.md)
- [Windows 本地测试说明](./docs/windows-local-test.md)
