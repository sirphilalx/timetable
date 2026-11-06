# 02 · Coding Standards & Tooling

Status: done

## Goal

Establish code quality tooling covering linting, formatting, type checking, and verification scripts, ensuring code conventions remain consistent across all development slices.

## Decisions

- Linting: ESLint configured with `eslint-config-expo` and `.eslintrc.js` ignoring `/dist/*`.
- Formatting: Prettier with `.prettierrc` (single quotes, trailing commas, 2 space indentation) and `.prettierignore`.
- Scripts: Add `"format": "prettier --write ."` and `"format:check": "prettier --check ."` to `package.json`.
- Unified validation: Add `"check": "npm run typecheck && npm run lint && npm run format:check"` script in `package.json`.
- Pre commit strategy: Lightweight verification command (`npm run check`) run before milestone commits without blocking emergency local WIP saves.

## Out of scope

- Remote GitHub Actions CI pipelines.
- Unit and end to end tests for application business logic (covered in dedicated feature slices).

## Steps

### 1. Verify ESLint configuration

Confirm `.eslintrc.js` extends `expo` and excludes `/dist/*`. Verify `npm run lint` executes cleanly across the project.

### 2. Install and configure Prettier

Install `prettier` as a dev dependency. Create `.prettierrc` with consistent rules and `.prettierignore` covering `dist/`, `.expo/`, `drizzle/`, and lockfiles.

### 3. Add quality scripts to package.json

Add `format`, `format:check`, and `check` scripts to `package.json`.

### 4. Format existing files and run full check suite

Run `npm run format` across the codebase, then verify `npm run check` (typecheck, lint, and format check) passes cleanly with zero errors.

## Verification

- Lint check: `npm run lint` passes with 0 errors.
- Type check: `npm run typecheck` passes with 0 errors.
- Format check: `npm run format:check` passes with 0 warnings.
- Unified check: `npm run check` runs all three gates in sequence and exits 0.

## AGENTS.md updates

Add `npm run check` and `npm run format` to the Commands section in `AGENTS.md`.

## Result

Configured ESLint with eslint-config-expo, installed Prettier with custom rules and ignore list, added format and unified check scripts to package.json, formatted the codebase, and verified that npm run check runs typecheck, lint, and format checking with zero errors or warnings.
