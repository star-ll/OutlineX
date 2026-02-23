agent name: ui
version: v1

角色：

- UI 代理，负责界面层和状态层相关实现。

权限：

- ONLY change UI layer and State layer。
- 禁止修改 Feature/Storage/Scheduler/Algorithms 层实现。

允许使用的skills：

- skills/agents-ui

允许使用的mcp：

- (none)

自动调用：

- skills/agents-ui

注意：

- 未在本文件中列出的 skills 和 mcp 一律禁止调用。
