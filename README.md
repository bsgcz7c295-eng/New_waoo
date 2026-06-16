<p align="center">
  <img src="public/banner.png" alt="New_waoo" width="600">
</p>

<h1 align="center">New_waoo - waoowaoo 优化版</h1>

<p align="center">
  基于 waoowaoo 的优化版本，新增 ComfyUI 本地供应商、工作流导入、分镜生成重构、重试功能修复等。
</p>

<p align="center">
  <a href="https://github.com/saturndec/waoowaoo">原始项目</a>
</p>

---

## ✨ 新增与优化功能

### ComfyUI 本地供应商
- 支持连接本地 ComfyUI 服务器
- 通过 `api.json` 一键导入工作流
- 9 个预置工作流（图像/视频生成）
- 工作流管理 UI（导入/选择/删除）

### 分镜生成重构
- 提取共享工具函数到 `common.ts`，减少 300+ 行重复代码
- Panel 数据库写入改为批量操作（`createManyAndReturn`）
- Voice analyze 重试次数 2 → 3

### 重试功能修复
- 修复前端状态机 `failed → running` 转换死锁
- 用户点击重试按钮后可正常恢复任务

### 其他优化
- 删除死代码 `persistStoryboardsAndPanels`
- 统一 `shouldRetryStepError` 逻辑
- 共享类型 `ScriptToStoryboardStepMeta` 迁移至公共模块

---

## 🚀 快速开始

**前提条件**：安装 [Docker Desktop](https://docs.docker.com/get-docker/)

```bash
git clone https://github.com/bsgcz7c295-eng/New_waoo.git
cd New_waoo
docker compose up -d
```

访问 http://localhost:13000

---

## 🔧 配置

### AI API Key
启动后进入**设置中心**配置 AI 服务的 API Key。

### ComfyUI（可选）
1. 确保本地 ComfyUI 服务器运行中
2. 在设置中心配置 ComfyUI 地址（如 `http://127.0.0.1:8188`）
3. 导入工作流（`api.json` 格式）

---

## 📦 技术栈

- **框架**: Next.js 15 + React 19
- **数据库**: MySQL + Prisma ORM
- **队列**: Redis + BullMQ
- **样式**: Tailwind CSS v4
- **认证**: NextAuth.js
- **图像生成**: ComfyUI / Fal.ai / 百炼 / SiliconFlow

---

## 📝 变更日志

### v1.0 (2026-06-16)
- 新增 ComfyUI 本地供应商支持
- 新增 api.json 工作流导入功能
- 重构分镜生成模块（common.ts）
- 优化 panel 数据库写入性能
- 修复重试功能状态机死锁
- 提升 voice analyze 重试次数

---

## 📄 许可证

基于原项目 waoowaoo 的 LICENSE。

---

**Based on [waoowaoo](https://github.com/saturndec/waoowaoo) by waoowaoo team**
