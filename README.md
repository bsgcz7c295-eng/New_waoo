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
- 工作流导入 schema 校验
- 支持 UNETLoader/CLIPLoader/VAELoader/Lora 等新型工作流节点

### 28 个漫剧风格预设
- 日漫清爽/暗黑、精致国漫、国漫仙侠、韩漫条漫
- 电影质感、超写实、黑色电影
- 西方奇幻、赛博朋克、蒸汽朋克、太阳朋克
- 水彩、油画、像素复古、扁平插画
- 恐怖悬疑、浪漫唯美、忧郁文艺、热血战斗
- 古风历史、现代都市、Q版可爱、哥特暗黑、科幻机甲

### 提示词系统重构
- 统一使用 `fillTemplate()` 替代 38+ 处手动字符串替换
- 中英文模板详细度对齐
- 提示词模板版本管理
- 模板缓存支持热重载

### 分镜生成重构
- 提取共享工具函数到 `common.ts`，减少 300+ 行重复代码
- Panel 数据库写入改为批量操作（`createManyAndReturn`）
- Voice analyze 重试次数 2 → 3

### 重试功能修复
- 修复前端状态机 `failed → running` 转换死锁
- 用户点击重试按钮后可正常恢复任务

### 性能优化
- 工作流深拷贝改用 `structuredClone()`
- 模型能力目录异步并行读取
- 工作流存储异步化
- ComfyUI 输出到 `waoowaoo/` 子目录

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

### v1.1 (2026-06-18)
- 新增 28 个漫剧风格预设
- 提示词系统重构（fillTemplate 统一替换）
- ComfyUI 工作流引擎增强（UNETLoader/CLIPLoader 支持）
- 工作流导入 schema 校验
- 中英文模板详细度对齐
- 模板缓存热重载
- 性能优化（structuredClone、异步 fs）
- 模型能力目录异步化
- 角色描述禁止项放宽

### v1.0 (2026-06-16 15:44)
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
