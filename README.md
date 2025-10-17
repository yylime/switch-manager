# 交换机配置管理系统

**当管理的交换机数据足够多的时候，交换机配置的管理尤为重要，设备替换、了解每日网络配置的变更、查询IP对应的交换机等信息也很需要。**

在单位自开发的原系统上，我将核心功能重写，这是一个基于 FastAPI 和 React 的全栈应用程序，用于管理和监控网络交换机配置。系统支持自动备份交换机配置、分析配置数据、生成网络信息报告等功能。

## 功能特性

### 1. 交换机管理
- 交换机信息录入和管理
- 支持批量导入交换机信息（CSV格式）
- 支持多种厂商设备（华为、思科、H3C）
- 支持SSH/Telnet连接方式
- 巡检账号管理

### 2. 配置备份与分析
- 自动定时备份交换机配置
- 配置变更对比（diff）
- 配置历史版本管理
- 配置文件存储与检索

### 3. 网络数据生成
- 自动生成IP表信息
- VRF（Virtual Routing and Forwarding）信息提取
- ARP表信息收集
- 网络接口使用情况分析

### 4. 数据可视化
- 仪表板展示关键指标
- 交换机备份状态监控
- VRF和IP表统计信息
- 配置变更趋势分析

## 技术架构

### 后端 (FastAPI)
- Python 3.9+
- FastAPI 框架
- SQLModel ORM
- PostgreSQL 数据库
- Netmiko 网络设备连接
- TextFSM 配置解析
- Alembic 数据库迁移

### 前端 (React)
- React 18+
- TypeScript
- Vite 构建工具
- shadcn-admin 模版
- TanStack Router 路由管理
- TanStack Query 数据获取

### 基础设施
- Docker & Docker Compose 部署
- Traefik 反向代理
- GitHub Actions CI/CD

## 快速开始

### 环境要求
- Docker & Docker Compose
- Git

### 安装步骤

1. 克隆项目仓库：
```bash
git clone <repository-url>
cd full-stack-fastapi
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，设置合适的配置值
```

3. 启动服务：
```bash
docker-compose up -d
```

4. 访问应用：
- 前端: http://localhost:5173
- 后端API文档: http://localhost:8000/docs

## 使用说明

### 1. 初始化数据
- 创建管理员账户
- 导入交换机信息（通过CSV文件）
- 配置巡检账号信息
- 设置分支/区域信息

### 2. 配置备份
- 系统会自动定时备份所有交换机配置
- 也可手动触发单个或多个交换机的备份任务
- 备份失败的设备会自动重试

### 3. 数据查看
- 在"交换机管理"页面查看设备列表及状态
- 在"IP Tables"页面查看网络IP分配情况
- 在"VRF"页面查看路由实例信息
- 在"ARP"页面查看ARP表信息
- 在仪表板查看整体统计信息

### 4. 配置对比
- 系统每天自动生成配置变更对比
- 可在"配置变更"页面查看历史变更记录

## 安全注意事项

1. 请确保 `.env` 文件不被提交到版本控制系统中
2. 定期更换巡检账号密码
3. 限制对管理界面的访问权限
4. 监控系统日志，及时发现异常访问

## 开发指南

### 后端开发
```bash
# 进入后端容器初始化环境
cd backend
uv sync

# 准备工作，参考fastapi
sh ./scripts/prestart.sh

# 启动开发服务器
fastapi dev app/main.py
```

### 前端开发
```bash
# 进入前端容器
cd frontend

# 运行开发服务器
pnpm install
pnpm dev

# 构建生产版本
pnpm build
```


## 参考使用
- shadcn-admin: https://github.com/satnaing/shadcn-admin
- full-stack-fastapi-template: https://github.com/fastapi/full-stack-fastapi-template



