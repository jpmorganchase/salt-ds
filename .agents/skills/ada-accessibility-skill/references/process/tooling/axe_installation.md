# axe-core/cli Installation Guide

This document covers prerequisites, installation methods, verification, and troubleshooting for `@axe-core/cli`. **Load this file ONLY when axe-core/cli is not detected** (i.e., `npx @axe-core/cli --version` fails). Do not load on repeat runs where axe-core/cli is already installed and working.

---

## Prerequisites

### Node.js

- **Required:** Node.js ≥18 LTS
- Verify: `node --version` — must return `v18.x.x` or higher
- The npm README states "Node 6+" but modern `@axe-core/cli` (v4.10+) depends on Puppeteer versions that require Node 18+
- If Node.js is missing or outdated: direct the developer to [nodejs.org](https://nodejs.org/) or their organization's approved installation method

### Chrome / Chromium

`@axe-core/cli` runs Chrome in **headless mode** by default. A Chrome or Chromium installation must be available.

- **macOS:** Chrome is typically installed at `/Applications/Google Chrome.app`. If not, Chromium can be used.
- **Linux:** Requires `google-chrome-stable` or `chromium-browser` package. Check with `which google-chrome-stable || which chromium-browser`.
- **Windows:** Chrome is typically installed in `Program Files`. The installer usually adds it to PATH.
- **Docker/CI:** Additional system libraries are often needed — see Troubleshooting below.

When `@axe-core/cli` is installed via npm, it uses Puppeteer internally, which may download its own bundled Chrome for Testing binary to `~/.cache/puppeteer/`. If this download is blocked (corporate environment, `PUPPETEER_SKIP_DOWNLOAD=true`), you must point to an existing Chrome installation via the `PUPPETEER_EXECUTABLE_PATH` environment variable.

### npm / npx

- Verify: `npm --version` — must return a version number
- `npx` ships with npm ≥5.2.0 and is the preferred way to run axe-core/cli without permanent installation
- If npm is unavailable: the developer must install Node.js first, which includes npm

### Network Access

- npm registry access is required to download `@axe-core/cli` and its dependencies
- Corporate environments may require proxy configuration (see Corporate / Restricted Environments section below)

---

## Installation Methods

### Method 1 — npx (Preferred for Agent Use)

```bash
npx --yes @axe-core/cli <URL>
```

- Downloads and runs axe-core/cli on-demand without permanent installation
- The `--yes` flag auto-confirms the npx install prompt (avoids hanging on interactive confirmation)
- No modification to the project's `package.json`
- Re-downloads if not cached locally (may be slow on first run)

### Method 2 — Project-Level Install (Recommended for Repeatable Scans)

```bash
npm install --save-dev @axe-core/cli
```

- Adds `@axe-core/cli` to `devDependencies` in `package.json`
- Version pinned by lockfile — consistent results across team members
- **Requires developer permission** before modifying `package.json`
- After install, run via `npx @axe-core/cli <URL>` (npx resolves local packages first)

### Method 3 — Global Install (Not Recommended)

```bash
npm install -g @axe-core/cli
```

- Installs the `axe` command globally
- Not recommended: version conflicts between projects, not project-scoped, may require elevated permissions (`sudo`)
- Only use if the developer explicitly requests it

---

## Verification

After installation, verify axe-core/cli is working:

### Step 1 — Check Version

```bash
npx @axe-core/cli --version
```

Should print the axe-core version (e.g., `4.11.1`). If this fails, the installation did not succeed — see Troubleshooting.

### Step 2 — Test Scan (Optional)

If a dev server or any accessible URL is available:

```bash
npx @axe-core/cli https://www.deque.com --stdout | head -c 200
```

Should return JSON output within a few seconds. This confirms Chrome headless is working and axe can reach external URLs.

---

## Versioning Note

`@axe-core/cli` does **not** follow Semantic Versioning (SemVer). It uses the **major and minor version** of axe-core that it bundles:

- `@axe-core/cli@4.11.x` bundles `axe-core@4.11.x`
- Patch versions may include bug fixes and new API features but not breaking changes

**Recommendation:** Use `^4.10.1` or later in `package.json` to stay within the v4 line while receiving updates.

---

## Common Errors & Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Cannot find Chrome` / `Could not find expected browser locally` | Puppeteer can't locate a Chrome/Chromium binary. The bundled download may have been blocked or the cache cleared. | Install Chrome, or set `PUPPETEER_EXECUTABLE_PATH` to the Chrome binary path. **macOS:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. **Linux:** `which google-chrome-stable` or `which chromium-browser`. |
| `ECONNREFUSED` on scan URL | Dev server is not running or listening on a different port | Verify the server is running at the target URL: `curl http://localhost:<port>`. Check the port matches. |
| Exit code 1 | **This is NOT an error.** axe found accessibility violations. | Proceed normally — read the JSON output for violation details. |
| Exit code 2+ / `Error: spawn` | Actual failure — axe-core/cli couldn't launch Chrome or execute | Check Chrome availability, PATH, and file permissions. See Chrome-specific errors below. |
| `No usable sandbox!` | Chrome sandboxing failed (common on Linux, Docker, CI environments) | Use `--chrome-options="no-sandbox,disable-setuid-sandbox,disable-dev-shm-usage"` |
| `TimeoutError` / scan hangs | Page is too large, slow to load, or uses heavy client-side rendering | Increase timeout: `--timeout=120`. For SPAs with client-side routing, add `--load-delay=2000` to wait for rendering. |
| `net::ERR_BLOCKED_BY_CLIENT` | Chrome's `HttpsFirstBalancedModeAutoEnable` feature blocking HTTP URLs | Use `--chrome-options="disable-features=HttpsFirstBalancedModeAutoEnable"`, or use `https://` if the server supports it. |
| `ENOENT: no such file or directory` on `--save` path | The `--save` path was resolved relative to CWD, producing a non-existent doubled path (e.g., `/project/dir/absolute/path/to/scans/file.json`). This is the most common `--save` error. | **Use a relative path from the project CWD** for the `--save` flag instead of an absolute path. axe-core/cli resolves `--save` relative to CWD, so when you `cd` into the project directory first, an absolute path gets the CWD prepended. Compute the relative path from the project directory to the scans directory (see `agent.md` → Path Construction → Step 2). Also run `mkdir -p "${SCANS_DIR}"` before the scan to ensure the target directory exists. |
| `EPERM` / permission denied on `--save` path | No write access to the target directory, or directory doesn't exist | Verify the `scans/` directory exists and is writable. Use a relative path from the project CWD for `--save` (see `agent.md` → Path Construction). Create directory with `mkdir -p "${SCANS_DIR}"` if needed. |
| ChromeDriver version mismatch | System ChromeDriver version doesn't match installed Chrome | Install browser-driver-manager: `npm install -g browser-driver-manager && npx browser-driver-manager install chrome`. Or specify path: `--chromedriver-path="/path/to/chromedriver"`. |
| `npm ERR! code ENETWORK` / proxy errors | Corporate firewall or proxy blocking npm registry access | See Corporate / Restricted Environments section below. |
| `Cannot find module 'puppeteer-core/internal/...'` | Node.js version too old or resolver conflict | Upgrade Node.js to ≥18 LTS. If using Jest or custom resolvers, upgrade those as well. |

---

## Corporate / Restricted Environments

### npm Registry / Proxy Issues

If the npm registry is unreachable:

```bash
# Check current registry
npm config get registry

# Configure corporate proxy
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080

# For certificate issues (temporary workaround — not recommended for production)
npm config set strict-ssl false

# For custom CA certificates (preferred over disabling strict-ssl)
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
```

Ask the developer if a corporate mirror or Artifactory instance is configured.

### Chrome Download Blocked

Some corporate environments set `PUPPETEER_SKIP_DOWNLOAD=true` or block Chrome binary downloads:

```bash
# Point to existing Chrome installation instead
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"  # macOS
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"  # Linux
```

### npx Blocked or Unavailable

If `npx` is restricted by corporate policy:
- Ask the developer to install via `npm install --save-dev @axe-core/cli` using their approved package installation method
- After installation, run via: `./node_modules/.bin/axe <URL>` or `npx @axe-core/cli <URL>` (npx resolves local packages)

### Chromium as Alternative

If Google Chrome is not available but Chromium is:

```bash
# Use Chromium instead
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"  # Linux
# Then run axe-core/cli normally
npx @axe-core/cli http://localhost:3000
```
