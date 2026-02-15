# Project Intro

An outline notes app that is based on React Native.

# Code

## Table of contents

- app:
- assets: static sources.
- components: public componnets, like outline-item component.
- constants: constatns, like sql.
- scripts: some execution script.
- test: test files.
- utils: public util methods.
- hooks: public react hooks.
- lib:
  - algorithms: public algorithms, like debounce, stack, queue...
  - features: convergence core logic, between UI and DB/Schedule/...
  - storage: db or cache
- skills: prompt templates & agent playbooks (non-runtime, docs only).

## System Architecture

- UI layer
- State layer
- Feature layer
- Storage layer
- Scheduler layer
- Algorithms layer

State layer includes:

- Based on Zustand, Context and others(like custom tree in memory).
- Supply State for UI.
- May call `lib/features`（Feature layer）.
- Must not directly call Scheduler and Storage.

Feature layer includes:

- Core business logic
- Supply API for UI layer or State layer based on FP, OOP, etc.
- Must not directly manipulate UI components.
- May call `lib/`

## Dependency Rules

- UI layer -> State layer -> Feature layer -> (Storage layer, Scheduler layer) -> Algorithms layer
- UI/State MUST NOT import from `lib/storage/**` directly (use `lib/features/**`).
- `lib/algorithms/**` MUST be pure (no IO, no React Native APIs).
- `lib/storage/**` MUST NOT depend on UI/State/Feature.

## Code Constraint

If you modify these files, you **must** update `DESCRIPTION.md` in same directory.

- `lib/storage/**`
- `lib/algorithms/**`
- `lib/features/**`

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)

# Commands

Package manager: npm

- android: `npm run android`
- ios: `npm run ios`
- web: `npm run web`
- lint: `npm run lint`

You MUST run `npm run lint` and `npm run android` after code changes to check compiler error.
