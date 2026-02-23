# Project Intro

An outline notes app that is based on React Native.

This project uses Expo Development Build (dev client), not Expo Go.

# Code

## Table of contents

- app: UI screen and route components.
- assets: static assets.
- components: shared UI components.
- constants: constants and configuration.
- scripts: executable scripts.
- test: test files.
- utils: shared utility methods.
- hooks: shared React hooks.
- lib:
  - algorithms: pure reusable algorithms (debounce, stack, queue, etc.).
  - features: business logic APIs for UI/State.
  - storage: db/cache layer.
  - scheduler: system-level scheduling (not React UI scheduling).
- skills: prompt templates & agent playbooks (non-runtime, docs only).
- agents: includes all agent config files.

## System Architecture

- UI layer
- State layer
- Feature layer
- Storage layer
- Scheduler layer
- Algorithms layer

Directory-specific and layer dependency rules are defined in module-level `AGENTS.override.md` files.

## Code Constraint

### Review

After any code generation, summarize changes + testing steps in a short bullet list.

Document-first and Test-first rules for specific directories are defined in module-level `AGENTS.override.md` files.

### Add dependency rules

Adding a new third-party dependency is allowed ONLY if at least one of the following is true:

- It improves environment/runtime compatibility (explain which environments and why).
- It significantly reduces implementation complexity or risk compared to writing/maintaining our own code.
- We need a coherent utility set from the same library (not a single small helper function).

Any new dependency MUST be explicitly confirmed by the user/owner before merging.

# Agents

Agent Routing Rules:

You MUST automatically select an agent based on the user's request.
Agents MUST be evaluated from top to bottom.
Select the first matching agent and stop.

you must automatically activate and use the corresponding skills defined below, and keep these rules.

- test: use `agents/test.md`
- ui: use `agents/ui.md`
- product: use `agents/product.md`
- ops: use `agents/ops.md`
- dev: use `agents/dev.md`
- default: use `agents/default.md` (behave as dev)

Agent config files are the source of truth for each agent's role, permissions, allowed skills, and allowed MCP.
Any skills or MCP not explicitly listed in an agent config file are forbidden for that agent.

YOU MUST first tell me `<agent name>/<agent version>`. Then, if you need change files, you MUST create and switch to a new branch before making any changes. Branch name is `agents/<agent name>/<agent version>/<short-task-name>`

# Commands

You MUST run `npm run lint` after code changes to check compiler error.

# AI Code Constraint

**You Must follow the rules at the top of every file.**

If anything is unclear, you may ask questions, but you MUST NOT guess.
