# 🔄 Web Integration - Status & Next Steps

**Date:** 2026-06-10  
**Status:** ⏸️ Paused - Technical blocker with Turbopack

---

## 📋 Summary

Web integration into `@aria/core` monorepo started but was **paused due to Turbopack limitations** with resolving modules outside the Next.js workspace. Mobile integration completed successfully with the same pattern.

---

## ✅ Completed

### Mobile (@aria/core + Expo)
- ✅ Type checking PASSED (see `MOBILE_TESTING_STATUS.md`)
- ✅ Monorepo migration completed (397 lines of duplication eliminated)
- ✅ @aria/core stores initialized with mobile-specific config
- ✅ ApiClient using SecureStore for token management
- ✅ Ready for device testing (blocks: Java Runtime)

### @aria/core Package
- ✅ Shared types (User, Message, Conversation, MemoryNode, etc.)
- ✅ ApiClient with axios + platform-specific token getters
- ✅ Auth store (Zustand) with login/register/logout/hydrate
- ✅ Chat store (Zustand) with streaming support
- ✅ TypeScript compilation successful (`npm run build`)

---

## 🚫 Blocker - Web Integration

### Issue
Turbopack (Next.js 16's default bundler) cannot resolve `@aria/core` module even though:
- ✅ `node_modules/@aria/core` symlink exists
- ✅ `packages/core/dist/` compiled files exist
- ✅ `next.config.js` configured with `turbopack.resolveAlias`
- ❌ Turbopack still fails: "Module not found: Can't resolve '@aria/core'"

### Root Cause
Turbopack does not follow symlinks outside the Next.js workspace directory. This is a fundamental limitation of how Turbopack resolves modules compared to webpack.

### Failed Attempts
1. `npm install` with `"file:../packages/core"` path dependency
2. TypeScript path aliases in `tsconfig.json`
3. `next.config.js` with `turbopack.resolveAlias`
4. Relative imports (`import from '../../../packages/core/src'`)
5. webpack config override (conflicts with Turbopack)

---

## 🔧 Recommended Solutions for Web

Choose one of the following approaches:

### Option A: **Monorepo Root with Workspaces** (Recommended)
Create a root `package.json` with npm workspaces:
```json
{
  "workspaces": ["packages/*", "ai-companion-web", "ai-companion-mobile"]
}
```
Then:
```bash
npm install
```
This makes `@aria/core` resolvable as a true workspace dependency. Turbopack will recognize it natively.

**Effort:** Low (one file change + reinstall)  
**Benefit:** Proper monorepo setup, works with all tools

---

### Option B: **Build @aria/core to node_modules**
After building `@aria/core`:
```bash
npm run build  # compiles packages/core/src → packages/core/dist
npm install   # web picks up pre-compiled dist/index.js
```
Then in web, import from the compiled dist:
```typescript
import { createApiClient } from '@aria/core' // resolves to dist/index.js
```

**Effort:** Low (next.config.js must reference dist)  
**Benefit:** Works with current setup, no new infrastructure

---

### Option C: **Monorepo Lite (Duplicate Stores)**
Keep web's existing `store/auth.ts` and `store/chat.ts`, but:
- Share only types by creating `packages/core/types-only.d.ts`
- Web maintains its own store implementations
- Reduces duplication to ~100 lines (types only), not 397

**Effort:** Medium  
**Benefit:** Least risky, web stays independent

---

### Option D: **Use Yarn Workspaces** (if available)
Yarn handles symlinks better than npm:
```bash
rm -rf node_modules package-lock.json
npm install -g yarn
yarn install
```

**Effort:** Low  
**Benefit:** Better symlink support

---

## 📋 What Was Done For Web (Before Revert)

### Files Updated
- ✅ `web/package.json` — added `"@aria/core": "file:../packages/core"`
- ✅ `web/src/lib/api.ts` — refactored to use `createApiClient`
- ✅ `web/src/store/auth.ts` — replaced with re-exports from `@aria/core`
- ✅ `web/src/store/chat.ts` — replaced with re-exports from `@aria/core`
- ✅ `web/src/types/index.ts` — updated to import shared types
- ✅ `web/tsconfig.json` — added path alias
- ✅ `web/next.config.js` — created with Turbopack config

### Changes Reverted
All files above were reverted to original state to restore build stability.

---

## 🚀 Next Steps

### Immediate (Unblock Web)
1. Choose one of the solutions above (recommend **Option A: Workspaces**)
2. Implement the solution
3. Re-run web integration following the same pattern as mobile

### Long-term
- Test web integration with device/browser
- Sync both web and mobile type definitions
- Consider shared UI component library if there's overlap

---

## 📚 Reference

- **Mobile Status:** `/Users/yefersonbc/herd/MOBILE_TESTING_STATUS.md`
- **@aria/core:** `/Users/yefersonbc/herd/packages/core/`
- **Mobile Integration Commit:** `b2d6193`

