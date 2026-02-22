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

# Commands

Package manager: npm

- android: `npm run android`
- ios: `npm run ios`
- web: `npm run web`
- lint: `npm run lint`

You MUST run `npm run lint` after code changes to check compiler error.

# AI Code Constraint

**You Must follow the rules at the top of every file.**
