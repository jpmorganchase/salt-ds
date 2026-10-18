import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, it } from "vitest";
import { createPropsProvider } from "../props.mjs";

const roots = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

it("resolves inherited props from another package's source before a build", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "salt-agent-props-"));
  roots.push(root);
  const files = {
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        strict: true,
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "Bundler",
        paths: { "@salt-ds/base": ["./packages/base/src/index.ts"] },
      },
    }),
    "packages/base/src/index.ts": `export interface BaseProps {
      /** The visual emphasis. */
      tone?: "quiet" | "loud";
    }`,
    "packages/controls/src/index.ts": 'export { Control } from "./Control";',
    "packages/controls/src/Control.tsx": `import type { BaseProps } from "@salt-ds/base";
    export interface ControlProps extends BaseProps {
      /** Number of items. */
      count: number;
    }
    export function Control({ tone, count }: ControlProps) {
      return <div data-tone={tone}>{count}</div>;
    }`,
  };
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  await symlink(
    fileURLToPath(new URL("../../../../node_modules", import.meta.url)),
    path.join(root, "node_modules"),
    "junction",
  );

  const props = createPropsProvider({
    packagesDir: path.join(root, "packages"),
  }).get("controls", "Control").props;
  expect(props.tone).toMatchObject({
    required: false,
    description: "The visual emphasis.",
    type: { name: "enum", value: [{ value: '"quiet"' }, { value: '"loud"' }] },
  });
  expect(props.count).toMatchObject({
    required: true,
    type: { name: "number" },
  });
});
