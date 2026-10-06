# 驭鬼者论坛

基于小说《神秘复苏》世界观设定的灵异论坛全栈应用。纯黑冷峻的界面风格,黄金点缀克制邪祟——在这里,每一位注册者都是驭鬼者。

> **三条铁律**
> 一、鬼,无法被杀死。
> 二、只有鬼能对付鬼。
> 三、洞察鬼的规律。

> 本项目为粉丝向的同人创作练习,与原著作者无关,请勿用于商业用途。

## 功能特性

- **帖子系统** — 板块、发帖、回帖(盖楼)、精华/置顶、浏览计数
- **用户系统** — 注册、登录(JWT + scrypt 密码哈希)、个人资料(驭鬼信息、危险等级、声望)
- **悬赏榜** — 发布/浏览悬赏任务,按危险等级(S/A/B/C)分类
- **通缉令** — 追缉危险驭鬼者与肇事体,标注最后出现位置
- **交易区** — 灵性道具与线索的买卖信息
- **总部事件与任务** — S/A 级事件通报,护送、看守等委托任务
- **申请中心** — 组织加入、道具申领等审批流(管理员审核)
- **论坛公告** — 官方置顶公告

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19 · Vite 8 · Tailwind CSS 4 · Radix UI · React Router 7 |
| 后端 | NestJS 10 · Drizzle ORM · PostgreSQL 16 |
| 认证 | 自实现 JWT(HMAC-SHA256)+ scrypt 密码哈希 |

## 快速开始

### 前置要求

- Node.js **≥ 22.12**
- PostgreSQL **≥ 14**(本地安装,或用下面的 Docker 一键启动)

### 1. 克隆并安装依赖

```bash
git clone https://github.com/zhangxinxi000-bit/ghost-tamer-forum.git
cd ghost-tamer-forum
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 按需修改数据库连接串与 JWT 密钥
```

### 3. 启动数据库

有 Docker 的话一条命令:

```bash
docker compose up -d
```

没有 Docker 就用本地 PostgreSQL,手动建库:

```sql
CREATE DATABASE ghost_forum;
```

### 4. 初始化表结构与演示数据

```bash
npm run db:push    # 按 server/database/schema.ts 同步建表
npm run db:seed    # 写入演示板块/用户/帖子(空库时执行,已有数据会自动跳过)
```

### 5. 启动开发服务

```bash
npm run dev
```

- 前端:<http://localhost:8080>(API 请求自动代理到后端)
- 后端:<http://localhost:3000/api>

**演示账号**(seed 数据内置,密码均为 `123456`):`admin`、`yeshexing`、`zhirenzhang`、`guijianchou`

## 生产构建

```bash
npm run build      # 前端产物 → dist/client,后端产物 → dist/server
npm run start      # 单进程运行在 SERVER_PORT(默认 3000),同时托管页面与 API
```

生产环境请务必设置强随机的 `JWT_SECRET`,并修改 `.env` 中的数据库凭证。

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL 连接串 |
| `JWT_SECRET` | 建议 | 登录令牌签名密钥,默认使用开发用弱密钥 |
| `SERVER_PORT` | | 后端端口,默认 `3000` |
| `SERVER_HOST` | | 监听地址,默认 `localhost`;容器/服务器部署用 `0.0.0.0` |

## 项目结构

```
├── client/                  # 前端(React + Vite)
│   ├── index.html
│   └── src/
│       ├── api/             # 接口封装(axios 实例 + 各模块 API)
│       ├── components/      # Layout、ui/(shadcn 风格基础组件)
│       ├── context/         # AuthContext(登录态)
│       ├── pages/           # 各页面(Board / Post / Bounty / Wanted / Trade / Hq ...)
│       └── index.css        # Tailwind v4 入口 + 暗色主题变量
├── server/                  # 后端(NestJS)
│   ├── database/
│   │   ├── schema.ts        # Drizzle 表结构(唯一数据源)
│   │   ├── database.module.ts
│   │   └── seed.ts          # 演示数据
│   ├── common/              # 全局异常过滤器、响应码
│   └── modules/             # auth / users / boards / posts / bounties
│                            # wanted / trades / announcements / hq-events
│                            # hq-missions / applications / view
├── shared/                  # 前后端共享类型(api.interface.ts)
├── drizzle.config.ts        # drizzle-kit 配置(db:push / db:generate)
└── docker-compose.yml       # 一键启动 PostgreSQL
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 同时启动前后端开发服务 |
| `npm run build` / `npm run start` | 生产构建 / 运行 |
| `npm run db:push` | 同步 schema 到数据库 |
| `npm run db:generate` | 生成迁移文件(输出到 `drizzle/`) |
| `npm run db:seed` | 写入演示数据(空库时) |
| `npm run type:check` | 前后端类型检查 |
| `npm run lint` | ESLint |

## 设计说明

- **纯黑暗风**:近黑背景(`#0a0a0a`)+ 低饱和灰阶文字,克制、压抑、无装饰动效
- **黄金点缀**:关键信息与主要操作用金色(`#d4af37`)——对应设定中"黄金克制鬼"
- **危险等级**:S 毁灭级(红)/ A 灾难级(橙)/ B 危险级(黄)/ C 限制级(绿)
- 完整色彩与排版规范见 [AGENTS.md](./AGENTS.md)

## License

[MIT](./LICENSE)
