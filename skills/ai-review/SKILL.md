---
name: ai-review
description: 严格的代码审计技能，仅基于外部传入的 `git diff HEAD` 文本进行安全、代码质量、架构与工程约束审计。Use when asked to review patch/diff changes for high-risk issues, especially security vulnerabilities, permission bypass, sensitive data exposure, serious reliability risks, or architecture constraint violations. Do not use for full-repo scan, style suggestions, or speculative findings.
---

# AI Review

仅分析外部传入的 diff 内容。
不要执行 `git` 命令。
不要扫描仓库。
不要基于猜测推断未在 diff 中出现的内容。

## Input Contract

1. 执行 `git show -1 --patch` 并将内容作为输入。
2. 仅基于该 diff 做审计。
3. 如果缺少 diff 或 diff 为空，直接按输出规则返回 `MUST_FIX: (none)`。

## Audit Workflow

执行 `git show -1 --patch` 并将内容作为输入。

1. 逐文件阅读 diff，定位新增/修改代码与对应行号。
2. 执行安全审计，仅报告可明确判断的问题：
   - XSS、CSRF、SSRF、路径遍历、命令注入、反序列化风险。
   - 鉴权或权限校验绕过。
   - 敏感信息泄露（密钥、token、内部地址等）。
   - 新增依赖仅在能明确判断存在明显安全风险时提示，不臆测 CVE。
   - 其他明确的高风险安全问题。
3. 执行代码质量审计，仅报告高风险问题：
   - 隐形副作用（全局状态、共享可变对象）。
   - 异步竞态、重复执行、非幂等风险。
   - 边界条件问题（空值、溢出、异常处理缺失等）。
   - 资源泄露。
   - 其他严重代码质量风险。
4. 执行架构与工程约束审计，仅在 diff 可明确判断时报告：
   - 明显破坏分层或架构结构。
   - 跨层依赖或绕过抽象。
   - 公共 API 破坏性变更。
   - 明确违反工程约束。
5. 过滤输出：
   - 只保留真实存在且证据充分的问题。
   - 不输出风格类问题。
   - 不输出低价值建议。
   - 按风险级别排序：High -> Medium -> Low。

## Output Format

严格使用以下结构输出：

```text
MUST_FIX:
- [file:line] 问题标题
  Risk: 风险说明
  Fix: 最小修复建议

SHOULD_FIX:
- [file:line] 问题标题
  Risk: 说明
  Fix: 建议
```

规则：

1. 如果不存在 MUST_FIX 问题，必须输出：

```text
MUST_FIX: (none)
```

2. 如果没有任何问题，可仅输出：

```text
MUST_FIX: (none)
```

3. 不添加额外章节、前言、总结或免责声明。
4. 每个问题必须标注 `[file:line]`，且必须能从 diff 明确定位。
