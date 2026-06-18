# Changelog / 更新日志

All notable changes to this project will be documented in this file.

---

## [v1.1] - 2026-06-18

### ✨ 新功能
- 新增 28 个漫剧风格预设（日漫清爽/暗黑、国漫仙侠、韩漫条漫、赛博朋克、水彩、油画、像素、恐怖悬疑、浪漫唯美等）
- 新增 `fillTemplate()` 提示词模板工具，统一模板变量替换
- ComfyUI 工作流引擎支持 UNETLoader/CLIPLoader/VAELoader/Lora 节点识别
- 工作流导入增加 schema 校验（节点结构、输出节点检查）
- 提示词模板支持版本号管理（catalog 中 version 字段）
- 模板缓存支持文件修改时间热重载，开发时无需重启服务

### 🔧 优化
- **提示词系统重构**: 全部 handler 统一使用 `fillTemplate()` 替代 38+ 处手动 `.replace()` 链
- **中英模板对齐**: `single_panel_image` 英文版补全摄影规则、slot 规则、原文优先原则；`image_prompt_modify` 英文版补全场景/人物描述规则
- **默认工作流升级**: 模型从 `animosity_illustriousV11` 更新为 `majicmixRealistic_v7`，负向提示词增强为 14 项缺陷关键词
- **IP-Adapter 升级**: 从 `ip-adapter-plus_sd15` 更新为 `ip-adapter-plus_sdxl_vit-h`
- **ComfyUI 输出目录**: SaveImage 输出到 `output/waoowaoo/<timestamp>/` 子目录
- **道具图像提示词增强**: 新增白背景、居中构图、studio 灯光等约束
- **buildPrompt() 校验放宽**: 支持自动提取模板变量，缺失变量使用空字符串填充
- **工作流存储异步化**: 全部改用 `fs/promises` API
- **模型能力目录异步化**: 并行读取 JSON 文件，添加同步兼容包装器
- **工作流深拷贝优化**: `JSON.parse(JSON.stringify())` → `structuredClone()`
- **角色描述放宽**: 眼色/唇色从绝对禁止改为可选（动漫/奇幻角色适用）

### 🐛 修复
- 修复 `image_prompt_modify.zh.txt` 中 `video_prompt` 固定返回空字符串的问题
- 修复 `character-image-task-handler` 测试中使用已变为有效值的 `noir` 作为无效样式测试用例
- 清理 `provider-test.ts` 中 3 处调试 `console.log` 调用

### 🧪 测试
- 新增 `art-styles.test.ts`（13 个测试），覆盖所有风格预设的字段完整性、中英文返回、类型校验、同步性
- 更新 `character-image-task-handler.test.ts` 适配新增风格值

---

## [v0.2] - 2026-02-28

### ✨ 新功能
- 增加 OpenAI 兼容图片、视频格式支持

### 🐛 修复
- 修复默认模型配置后项目模型需要二次选择的问题
- 修复部分情况 resolution 无法读取的问题
- 修复模型链路为 LangGraph
- 修复默认参数无选择问题
- 修复关闭计费依然触发计费问题
- 修复 openai-compatible 被误判为原生 OpenAI 推理问题
- 修复 JSON 解析失败问题

### ⚙️ 优化
- 修改为默认计费 off
- 增强提示词 JSON 格式限制

---

## [v0.2.1] - 2026-02-28

### 🐛 修复
- 修复 AI 生成内容语言不跟随网站语言设置的问题
- 修复前端 API 请求未携带 Accept-Language header 导致 locale 回退到浏览器默认语言
---

## [v0.1] - 2026-02-27

### 🎉 首次发布
- 项目初始开源版本
