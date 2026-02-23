# Note App

一个面向结构化思考与快速记录的 React Native 大纲笔记应用。项目基于 Expo Development Build（Dev Client）运行，目标不是“能跑就行”的 Demo，而是一个可持续演进的产品工程基线。

## Product

- 以大纲（Outline）为核心交互模型，支持从想法捕获到层级整理的连续工作流。
- 通过清晰的分层架构（UI / State / Feature / Storage / Scheduler / Algorithms）保障复杂功能可维护、可扩展。
- 关注跨端一致性与可演进性，使用 React Native + Expo Dev Client 承载长期开发，而非依赖 Expo Go 的受限运行环境。

## AI Engineering System

本项目将 AI 视为工程协作者，而不是一次性代码生成器，重点体现在以下机制：

- 多层 AGENTS 约束：根级 `AGENTS.md` 定义全局规则，模块级 `AGENTS.override.md` 细化目录边界与依赖方向，减少跨层污染。
- 多 Agent 协同：按意图与路径自动路由到 `test` / `ui` / `product` / `ops` / `dev`，避免“单一 Agent 包办所有任务”的失焦问题。
- 可审计流程：要求在代码生成后给出变更摘要与测试步骤，并执行 lint 作为基础质量门禁。
- 约束优先于能力：任何未授权的 skill / MCP 默认禁止，确保自动化行为可控、可追踪、可复现。

这套体系的优势在于：在保持开发速度的同时，显式管理上下文边界、职责边界和质量边界，让 AI 参与开发具备团队级可用性。

## Project Structure

- `app`: UI 页面与路由组件
- `components`: 可复用 UI 组件
- `hooks`: 共享 React hooks
- `utils`: 通用工具方法
- `constants`: 常量与配置
- `lib/algorithms`: 纯算法能力（如 debounce、stack、queue）
- `lib/features`: 业务特性 API（面向 UI / State）
- `lib/storage`: 存储与缓存层
- `lib/scheduler`: 系统级调度
- `test`: 测试文件
- `scripts`: 脚本与工程自动化
- `skills`: AI 提示模板与 agent playbooks（文档用途）
- `agents`: agent 配置与权限定义

## Development

1. 安装依赖

```bash
npm install
```

2. 启动开发

```bash
npm run start
```

3. 在 Dev Client / 模拟器中运行（本项目默认开发方式）

- Development Build
- Android Emulator
- iOS Simulator

## Contributing

- 提交前先确认改动遵循对应目录的 `AGENTS.md` / `AGENTS.override.md` 规则。
- 如果引入新依赖，需满足仓库约束并由 owner 明确确认。
- 保持文档、实现、测试三者同步更新，避免“代码先行、约束滞后”。
