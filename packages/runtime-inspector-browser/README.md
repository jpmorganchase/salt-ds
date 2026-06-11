# @salt-ds/runtime-inspector-browser

Optional Playwright-backed browser-session adapter for `@salt-ds/runtime-inspector-core`.

This package is private and is not a supported public API on its own. It is bundled into `@salt-ds/cli` and `@salt-ds/mcp` so that `salt-ds runtime inspect --mode browser` and `--mode auto` can capture computed-layout evidence, screenshots, runtime errors, and hydrated DOM state when Playwright is installed in the consuming project.

`playwright` is declared as an **optional** peer dependency. Consumers who do not want browser-session evidence can omit it: the inspector falls back to `--mode fetched-html` automatically, or surfaces a clear install hint when `--mode browser` is requested explicitly.

