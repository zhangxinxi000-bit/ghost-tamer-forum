# 灵异论坛 / 驭鬼者论坛

基于《神秘复苏》原著设定的驭鬼者论坛应用。冷峻、压抑、专业、严肃的黑暗风格。

## 设计规范

### 视觉风格
- 纯黑暗风：深黑背景 + 低饱和度灰阶文字
- 整体克制，无花哨装饰与动效
- 关键信息用金色点缀（黄金克制鬼的设定）
- 危险等级用红/橙/黄/绿分级标识

### 色彩系统
```
背景：
  --background: #0a0a0a          主背景（近黑）
  --surface: #141414             卡片/面板背景
  --surface-hover: #1a1a1a       悬浮态
  --border: #262626              边框线
  --divider: #1f1f1f             分隔线

文字：
  --foreground: #e5e5e5          主文字
  --foreground-muted: #a3a3a3    次要文字
  --foreground-dim: #737373      辅助/时间文字
  --foreground-faint: #525252    最淡文字

强调色：
  --gold: #d4af37                金色（黄金克制鬼）
  --gold-dim: #8b7355            暗金
  --danger-s: #dc2626            S级 毁灭级 红色
  --danger-a: #ea580c            A级 灾难级 橙色
  --danger-b: #ca8a04            B级 危险级 黄色
  --danger-c: #16a34a            C级 限制级 绿色
```

### 排版
- 字体：系统默认 sans-serif
- 标题：字重 600，紧凑字距
- 正文：字重 400，行高 1.6
- 等宽：用于等级代号、ID等

### 布局
- 左侧导航栏（固定宽度 220px）+ 主内容区
- 顶部全局栏：论坛名 + 搜索 + 用户入口
- 内容区最大宽度 960px，居中
- 间距以 4px 为基准单位，常用 8/12/16/24px

### 组件风格
- 按钮：深色底 + 细边框 + 悬浮微亮
- 卡片：深色底 + 1px 边框，无阴影
- 徽章：圆角 2px，实色底 + 白字
- 链接：金色，无下划线，悬浮加下划线
- 输入框：深色底 + 边框，聚焦金色边框

## 技术架构

### 后端模块
- `users` - 用户系统（注册、登录、个人资料）
- `boards` - 板块管理
- `posts` - 帖子与回帖
- `bounties` - 悬赏任务
- `wanted` - 通缉令
- `trades` - 交易区
- `announcements` - 论坛公告

### 前端页面
- `HomePage` - 首页（论坛概览）
- `BoardPage` - 板块帖子列表
- `PostDetailPage` - 帖子详情与回帖
- `NewPostPage` - 发帖
- `BountyPage` - 悬赏榜
- `WantedPage` - 通缉令
- `TradePage` - 交易区
- `AnnouncementPage` - 论坛公告
- `LoginPage` - 登录
- `RegisterPage` - 注册
- `ProfilePage` - 个人资料

### 数据库表
- `forum_user` - 用户表（驭鬼者账号）
- `board` - 板块表
- `post` - 帖子表
- `reply` - 回帖表
- `bounty` - 悬赏任务表
- `wanted_person` - 通缉令表
- `trade` - 交易帖表
- `announcement` - 公告表

## 三大铁律
鬼无法被杀死；只有鬼能对付鬼；洞察鬼的规律。
