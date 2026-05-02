# 项目架构 v0

## 1. 项目目标

`weixin-household-agent-acp` 是一个面向日常真实使用场景的微信 AI 网关。

核心目标：

- 让家里人直接在微信里和 AI 对话
- 给项目所有者保留一条单独的高权限运维路径
- 比当前 `weixin-agent-sdk + weixin-acp` 方案更容易部署
- 稳定支持文件发送
- 让普通用户几乎无感知地使用上下文能力
- 统一按北京时间理解和呈现时间


## 2. 参考来源

这个项目参考了以下仓库：

- `Tencent/openclaw-weixin`
  - 作为 iLink 官方协议形态参考
  - 参考其多账号模型
  - 参考其官方媒体上传流程
- `lith0924/wechat-ilink-sdk-java`
  - 参考更完整的媒体消息实现
  - 参考上下文缓存、重试、异常处理思路
  - 尤其参考文件发送链路
- `UNLINEARITY/CLI-WeChat-Bridge`
  - 参考线程映射和操作者工作流设计
- `wong2/weixin-agent-sdk`
  - 最早使用的


## 3. 产品形态

系统定位为 WeChat 与 Codex 之间的一层中控服务。

高层流程：

1. 微信账号通过 iLink 二维码登录
2. 网关接收微信消息
3. 网关识别发送者、角色、会话与策略
4. 网关构建带北京时间的上下文
5. 网关调用对应的 Codex 运行目标
6. 网关过滤、整理并渲染输出
7. 网关将文本、图片或文件发回微信

## 4. v0 不做的事

首个里程碑暂不覆盖：

- 群聊
- 语音发送
- 复杂 Web 管理后台
- 技能市场式系统
- 完整长期驻留的终端镜像能力
- 同一运行时里的细粒度路径 ACL

## 5. 核心需求

### 5.1 多账号

必须支持多个微信账号绑定。

每次扫码登录都生成独立账号记录，每个账号都有：

- 独立 token
- 独立长轮询 cursor
- 独立联系人路由
- 独立会话命名空间

### 5.2 角色分离

v0 固定两类角色：

- `admin`
- `family`

`admin` 面向项目所有者：

- 使用高权限 Codex 运行环境
- 可查看摘要和会话状态
- 可承担运维、代码、系统任务

`family` 面向普通家庭成员：

- 日常问答
- 办公场景辅助
- 文档生成
- 文件回传
- 不应默认拥有高风险操作能力

### 5.3 时间感知

所有用户可感知的时间统一按 `Asia/Shanghai`。

要求：

- 每条消息保存绝对时间
- 每次请求模型都注入当前北京时间
- “今天 / 明天 / 昨天 / 下午 / 晚上”等相对时间必须按北京时间解释
- 摘要必须带时间锚点

### 5.4 面向普通人的会话体验

不能假设家庭成员会主动切换会话或管理上下文。

系统必须：

- 对外看起来像连续自然对话
- 对内在合适时机自动拆分上下文
- 上下文过长时自动摘要
- 恢复时优先用摘要而不是全量历史

### 5.5 稳定的文件发送

文件发送是硬需求。

明确决策：

- 不沿用当前 `wong2/weixin-agent-sdk` 那条 ACP 出站文件路径
- 文件发送直接实现官方 iLink 媒体上传流程
- 设计上参考 `wechat-ilink-sdk-java` 的完整实现思路

原因：

- 官方协议原生支持 `FILE`
- 用户当前使用的 ACP 链路在实践中无法稳定发文件
- Java SDK 已经证明文件链路可以做完整

## 6. 总体架构

v0 推荐的运行形态：

- 一个 Node.js 主服务进程
- 两个 Codex 运行目标
  - `codex-admin`
  - `codex-family`
- 一个 SQLite 数据库
- 一个本地文件目录用于附件与缓存

v0 推荐的部署形态：

- 直接运行在 Linux 宿主机
- 使用 `systemd` 托管
- 第一阶段不强依赖 Docker

原因：

- 目标服务器上已经通过 `pnpm` 装好了 Codex
- 宿主机直跑比一开始就容器化更简单
- 先减少变量，把功能做稳

## 7. 运行拓扑

```text
WeChat
  -> iLink 传输层
  -> weixin-household-agent-acp
      -> 账号路由
      -> 会话管理
      -> 策略层
      -> Codex 适配层
          -> codex-admin
          -> codex-family
      -> 输出渲染
  -> WeChat
```

## 8. 代码模块规划

推荐目录结构：

```text
apps/
  server/
    src/
      index.ts
      config/
      transport/
      router/
      sessions/
      codex/
      policy/
      render/
      storage/
      commands/
docs/
infra/
  systemd/
  scripts/
packages/
  shared/
```

模块职责：

- `config/`
  - 读取环境变量与配置文件
- `transport/`
  - 二维码登录
  - 长轮询
  - 发消息
  - 上传文件
  - 输入态
- `router/`
  - 按 `accountId + contactId` 映射角色与策略
- `sessions/`
  - 上下文窗口
  - 摘要
  - 自动开新会话规则
- `codex/`
  - 调用 Codex
  - 分离 admin 和 family 两套运行目标
- `policy/`
  - 输出过滤
  - 允许操作范围
  - 不同角色的会话策略
- `render/`
  - 文本整理
  - 文件/图片消息渲染
  - 微信输出适配
- `storage/`
  - SQLite 持久化
- `commands/`
  - `/new` 等控制指令

## 9. 角色与运行环境策略

项目使用两套独立的 Codex 执行目标。

### 9.1 `codex-admin`

只给所有者使用。

预期属性：

- 高权限
- 可访问所有者工作目录
- 可执行运维或代码任务
- 可保留更完整的内部过程信息

### 9.2 `codex-family`

只给家庭成员使用。

预期属性：

- 独立工作目录
- 最好使用独立 Linux 用户
- 不挂载敏感生产凭据
- 不默认开放高风险 shell 能力
- 输出过滤更严格

关键原则：

- 权限隔离主要依赖运行环境隔离，而不是只靠 prompt

## 10. 会话模型

### 10.1 会话键

v0 默认会话键：

`session_key = wechat_account_id + contact_id`

第一阶段先做到这一步即可，后续再扩展显式会话分支。

### 10.2 每个会话保存的数据

每个会话保存：

- 最近消息
- 滚动摘要
- 稳定用户偏好
- 未完成事项
- 最后活跃时间
- 当前运行角色

### 10.3 自动摘要与恢复

当上下文变长时，系统应：

1. 生成摘要
2. 持久化摘要
3. 裁剪旧消息
4. 以“摘要 + 最近若干轮”继续对话

摘要必须带时间信息，例如：

- `2026-04-28 20:15 CST：用户咨询报销模板，并希望下次直接生成可发送文件。`

### 10.4 自动开新会话

普通家庭成员不需要手动切换会话。

系统内部应在以下条件触发时自动开一个新的内部会话：

- 空闲时间超过阈值
- 上下文长度超过阈值
- 先前任务已完成并归档
- 话题切换明显
- 明确检测到“重新开始”之类语义

这是内部优化，对用户尽量无感。

### 10.5 手动指令

优先级不高但很有用：

- `/new`
- `/reset`
- `/summary`
- `/time`
- `/recent`

前期最重要的是 `/new` 与 `/reset`。

## 11. 时间注入策略

模型必须始终收到轻量、自然的时间提示。

对于家庭成员，提示风格要更像微信助手：

```text
此条消息是用户在【北京时间 {YYYY-MM-DD HH:mm}】和你对话的：
用户说今天、明天、昨天、上午、下午、晚上时，都按这个时间理解。
你是一个耐心、靠谱、口语自然的微信助手，优先直接帮用户把事情办成。
```

对于 admin 路由，可以允许更偏运维的上下文提示。

所有摘要也统一使用北京时间标记。

## 12. 出站消息策略

### 12.1 文本

默认文本路径：

- 获取模型输出
- 按策略清理不适合发给微信的内容
- 格式化为适合微信阅读的文本
- 必要时安全分段

### 12.2 思考过程过滤

家庭成员路由必须过滤不适合直接发出的内部内容。

过滤目标：

- 去掉链式推理风格文本
- 去掉命令噪音
- 去掉异常堆栈
- 去掉不必要的绝对路径
- 保留真正有用、自然的答案

实现原则：

- 以确定性过滤为主
- 不把“再让另一个 AI 改写”当成主方案

### 12.3 文件发送

本项目必须支持真正的微信文件发送。

实现规则：

- 直接走官方 iLink `FILE` 上传流程
- 以 Java SDK 的产品完成度作为实现参考

必须具备的步骤：

1. 本地生成目标文件
2. 计算明文大小与 MD5
3. 用 AES-128-ECB 加密
4. 计算密文大小
5. 调用 `getuploadurl`，`media_type = 3`
6. 用返回的上传参数将密文 PUT 到 CDN
7. 构造 `FILE` 消息项
8. 调用 `sendmessage`

这部分要做成独立媒体模块，不能继续依赖当前 ACP 里那种“顺带支持一下”的思路。

### 12.4 图片

图片可以复用同样的上传架构，但需要按协议补齐缩略图逻辑。

## 13. 二维码登录与账号绑定

预期运维流程：

1. 启动网关服务
2. 执行登录命令
3. 在终端打印二维码
4. 用目标微信扫码
5. 本地保存该账号 token
6. 给该账号分配角色与策略

后续适合支持的管理员命令：

- 列出账号
- 查看登录状态
- 重新登录
- 设置角色
- 禁用账号

## 14. 持久化模型

v0 使用 SQLite 即可。

计划中的数据表：

### `wechat_accounts`

- `id`
- `display_name`
- `role`
- `auth_token`
- `uin`
- `status`
- `created_at`
- `updated_at`

### `contacts`

- `id`
- `wechat_account_id`
- `contact_id`
- `display_name`
- `last_seen_at`

### `polling_state`

- `wechat_account_id`
- `cursor`
- `updated_at`

### `sessions`

- `id`
- `wechat_account_id`
- `contact_id`
- `role`
- `status`
- `summary_text`
- `memory_json`
- `last_active_at`
- `created_at`
- `updated_at`

### `messages`

- `id`
- `session_id`
- `direction`
- `message_type`
- `text_content`
- `file_path`
- `created_at`
- `source_message_id`

### `attachments`

- `id`
- `session_id`
- `local_path`
- `mime_type`
- `file_name`
- `size_bytes`
- `outbound_status`
- `created_at`

## 15. 配置模型

初版配置形态：

```toml
[server]
port = 18080
timezone = "Asia/Shanghai"
data_dir = "/var/lib/weixin-household-agent-acp"

[codex.admin]
command = "codex"
workspace = "/var/lib/weixin-household-agent-acp/runtime/admin"
mode = "full-auto"

[codex.family]
command = "codex"
workspace = "/var/lib/weixin-household-agent-acp/runtime/family"
mode = "suggest"

[policy.admin]
strip_reasoning = false
allow_files = true

[policy.family]
strip_reasoning = true
strip_paths = true
strip_commands = true
allow_files = true
```

## 16. Linux 部署方案

目标环境：

- 服务器位于新加坡
- 但业务逻辑统一按北京时间工作
- Codex 已在宿主机通过 `pnpm` 安装

### 16.1 首阶段部署方式

v0 优先用宿主机直跑。

原因：

- 最简单
- 最容易调试
- 不需要先解决容器里找 Codex 的路径与权限问题

### 16.2 预期目录

```text
/opt/weixin-household-agent-acp
/var/lib/weixin-household-agent-acp
/var/lib/weixin-household-agent-acp/runtime/admin
/var/lib/weixin-household-agent-acp/runtime/family
/var/lib/weixin-household-agent-acp/inbox
/var/lib/weixin-household-agent-acp/office
/var/lib/weixin-household-agent-acp/outbox
```

### 16.3 预期命令

v0 的部署入口应尽量傻瓜式。推荐让用户只输入一条命令：

```bash
curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-agent-acp/main/infra/scripts/linux/bootstrap.sh | bash
```

这条命令负责：

1. 拉取或更新仓库到 `/opt/weixin-household-agent-acp`
2. 准备 pnpm/corepack 本地缓存
3. 安装依赖并构建
4. 写入 `.env` 和 `systemd` service
5. 如果没有已绑定微信账号，在终端打印二维码并等待扫码确认
6. 扫码完成后继续启动服务

权限和可恢复性要求：

- 用户必须用普通登录用户运行，不直接 `sudo bash`。
- `/opt` 不可写时，bootstrap 只对 `/opt/weixin-household-agent-acp` 这个项目目录使用 `sudo mkdir` 和 `sudo chown 当前用户`，不修改 `/opt` 本身。
- 安装器必须清楚提示 sudo 用途：创建/写入应用目录、数据目录、systemd service、可选 sudoers、启动服务。
- 默认服务用户为当前登录用户；如选择 dedicated，则只删除安装器实际创建的用户和用户组。
- 面向个人家庭服务器的一键安装默认授予服务用户 full sudo，让 admin 具备运维能力；如需降权，用户必须显式设置 `PERMISSION_MODE=none` 或 `PERMISSION_MODE=limited`。
- 安装必须写入清单，记录应用目录、数据目录、服务用户、systemd 文件、sudoers 文件哪些是安装器创建的，哪些是覆盖前备份的。
- 卸载默认恢复到安装前状态：停止并禁用服务，恢复覆盖前备份的 service/sudoers，删除安装器创建的应用目录、数据目录、服务用户。
- 如果用户传入 `--keep-data`，必须保留 SQLite、账号 token、二维码和附件缓存，并默认保留服务用户以保持文件属主可读。

已有本地仓库时，也可以直接运行：

```bash
bash run.sh
```

或执行系统安装器：

```bash
bash infra/scripts/linux/install.sh --yes
```

### 16.4 `systemd` 方向

计划模型：

- 一个 `systemd` 服务负责主网关
- Codex 由网关作为子进程或短命令调用

运维命令大致如下：

```bash
sudo systemctl daemon-reload
sudo systemctl enable weixin-household-agent-acp
sudo systemctl start weixin-household-agent-acp
sudo systemctl status weixin-household-agent-acp
journalctl -u weixin-household-agent-acp -f
```

### 16.5 Docker 位置

Docker 不是 v0 默认路径，但代码结构会尽量保持后续可容器化。

## 17. 安全原则

v0 的安全主要依赖运行环境分离。

原则：

- admin 和 family 不共享工作目录
- family 运行环境不挂敏感环境变量
- family 出站消息必须经过过滤
- 账号角色是显式配置，不临时猜测
- 生成文件统一放在受控目录

## 18. MVP 范围

第一个可用版本需要交付：

- 多账号登录
- 文本消息收发
- 文件发送
- admin / family 分权
- Codex 路由
- 北京时间注入
- 自动摘要与恢复
- 简单操作指令
- 宿主机 + `systemd` 部署

## 19. MVP 后的 backlog

已经明确记下、后续需要做的能力：

- 自动开新会话
- 定时 sum-up
- skill 层
- memory 层
- 用指令切回历史对话
- 更稳的话题切换检测
- 更好的管理员可观测性

这些都是真需求，但不是第一阶段的阻塞项。

## 20. 立即开发顺序

建议顺序：

1. 搭建项目脚手架
2. 定义配置读取
3. 定义 SQLite schema
4. 抽象 iLink 传输层
5. 实现账号登录与轮询
6. 实现带北京时间注入的会话管理
7. 实现 Codex 适配层
8. 实现家庭成员输出过滤
9. 实现文件发送
10. 补齐 `systemd` 文件

## 21. 已锁定决策

除非出现明确 blocker，v0 暂时锁定以下决策：

- 仓库名固定为 `weixin-household-agent-acp`
- 时区固定为 `Asia/Shanghai`
- 第一版优先 Linux 宿主机直跑
- 角色固定为 `admin` 和 `family`
- 家庭成员默认不手动管理会话
- 文件发送必须直接按 iLink 官方媒体流程实现
