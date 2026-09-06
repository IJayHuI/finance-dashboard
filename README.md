# 理财大屏

个人理财可视化追踪仪表盘，实时展示各投资项目的本金、盈亏、资产配置和历史趋势。

## 简介

- **多项目管理** — 灵活增删投资项目，每个项目独立设定币种（USD / RMB）
- **本金流水** — 记录每一笔投入或减少本金，自动累计计算各项目本金
- **资产快照** — 每次更新项目金额生成一条历史记录，支持追溯
- **可视化大屏** — KPI 总览、盈亏排行、资产配置饼图、历史趋势折线图
- **多币种切换** — 一键切换显示货币，汇率自动获取
- **明暗主题** — 支持暗色 / 亮色 / 跟随系统三种模式
- **数据持久化** — 基于 Supabase 云端存储，多端同步

## 技术栈

Vue 3 · Vite · Pinia · Naive UI · TailwindCSS · Supabase · Chart.js · xicons

## 目录结构

```
finance-dashboard/
├── index.html                    # HTML 入口
├── package.json                  # 依赖配置
├── vite.config.js                # Vite 配置
├── tailwind.config.js            # TailwindCSS 配置
├── postcss.config.js             # PostCSS 配置
├── .env                          # 环境变量（Supabase 配置）
└── src/
    ├── main.js                   # 应用入口
    ├── App.vue                   # 根组件
    ├── assets/
    │   └── styles/
    │       └── main.css          # 全局样式（Tailwind 指令）
    ├── views/
    │   └── DashboardView.vue     # 首页视图
    ├── components/
    │   ├── common/               # 通用组件
    │   │   ├── HeaderBar.vue     # 顶部栏（汇率/主题/货币切换）
    │   │   ├── KpiCards.vue      # KPI 数据卡片
    │   │   └── ProjectTable.vue  # 项目明细表格
    │   ├── charts/               # 图表组件
    │   │   ├── ProjectHistoryChart.vue  # 项目历史趋势（本金 vs 金额）
    │   │   ├── ChartCurrent.vue  # 各项目当前金额柱状图
    │   │   ├── ChartPnl.vue      # 各项目盈亏柱状图
    │   │   ├── ChartAlloc.vue    # 资产配置环形图
    │   │   └── ChartTrend.vue    # 总资产趋势折线图
    │   └── modals/               # 弹窗与抽屉
    │       ├── ProjectManageModal.vue  # 项目管理（增删/改币种）
    │       ├── AddInvestModal.vue      # 投入/减少本金
    │       ├── UpdateAssetModal.vue    # 更新项目金额
    │       └── RecordDrawer.vue        # 完整记录抽屉
    ├── stores/                   # Pinia 状态管理
    │   ├── settings.js           # 偏好设置（主题/货币/汇率，持久化）
    │   └── finance.js            # 财务数据（项目/投入/资产 CRUD）
    ├── composables/              # 组合式函数
    │   └── useExchangeRate.js    # 汇率获取逻辑
    └── utils/                    # 工具函数
        ├── supabase.js           # Supabase 客户端
        └── helpers.js            # 格式化/计算/图表配色
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build

# 预览构建结果
pnpm preview
```

## 环境变量

在 `.env` 文件中配置：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
