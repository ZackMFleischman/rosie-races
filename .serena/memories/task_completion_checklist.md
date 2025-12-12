# Task Completion Checklist

When completing a task, run these commands to verify quality:

## 1. Format Code
```bash
npm run format
```
Ensures consistent formatting with Prettier.

## 2. Lint Check
```bash
npm run lint
```
Catches code quality issues and style violations.

## 3. Run Tests
```bash
npm run test
```
Verifies all tests pass (Jest with jsdom environment).

## 4. Build Check
```bash
npm run build
```
TypeScript check + production build to catch type errors.

## Order of Operations
1. `npm run format` - Fix formatting
2. `npm run lint` - Check for issues
3. `npm run test` - Run tests
4. `npm run build` - Final verification

## Notes
- Tests are colocated with components
- Phaser is mocked in tests to avoid WebGL issues
- Path alias `@/` resolves to `src/`
