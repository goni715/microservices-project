# Microservices Chat App

## Useful Commands

### 1. Install Dependencies to Workspace Root

To install a development dependency across the entire workspace root:

```bash
pnpm add -D -w tsx
```

> **Note:** If you encounter `ERR_PNPM_IGNORED_BUILDS` (for packages like `esbuild`), approve the build scripts by running:
> ```bash
> pnpm approve-builds
> ```

---

### 2. Install Dependencies to a Specific Package

To install a development dependency inside a specific package (such as `packages/common`):

```bash
cd packages/common
pnpm add -D tsx
```

Alternatively, you can install it directly from the workspace root using the `--filter` flag without changing directories:

```bash
pnpm --filter @chatapp/common add -D tsx
```
