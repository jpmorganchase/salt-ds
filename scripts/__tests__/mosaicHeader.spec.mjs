import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { describe, expect, it } from "vitest";

const siteRequire = createRequire(
  new URL("../../site/package.json", import.meta.url),
);
const React = siteRequire("react");
const { renderToStaticMarkup } = siteRequire("react-dom/server");
const headerPath = new URL(
  "../../site/src/components/app-header/AppHeader.tsx",
  import.meta.url,
);

async function renderHeader(mobile) {
  const source = await readFile(headerPath, "utf8");
  const fixtures = {
    "@jpmorganchase/mosaic-store":
      'export const useAppHeader = () => ({ homeLink: "/salt/index" });',
    "@salt-ds/core": `
      import { createElement } from "react";
      export const Button = ({ appearance, sentiment, ...props }) => createElement("button", props);
      export const Tooltip = ({ children }) => children;
    `,
    "@salt-ds/icons":
      "export const GithubIcon = () => null; export const MenuIcon = () => null;",
    "next/dynamic": `
      import { createElement } from "react";
      export default () => () => createElement("input", { "aria-label": "Site Search" });
    `,
    "../../layouts/LayoutContext": `
      import { createContext } from "react";
      export const LayoutContext = createContext({
        mainId: "salt-main-content", setMainId() {}, setDrawerOpen() {}
      });
    `,
    "../../utils/useIsMobileView": `export const useIsMobileView = () => ${mobile};`,
    "../cta-link/CTALink": `
      import { createElement } from "react";
      export const CTALink = ({ sentiment, ...props }) => createElement("a", props);
    `,
    "../link/Link": `
      import { createElement } from "react";
      export const LinkBase = (props) => createElement("a", props);
    `,
    "../logo/Logo": "export const Logo = () => null;",
    "../mode-switch/ModeToggle": "export const ModeToggle = () => null;",
    "../search": "export const Search = () => null;",
    "./AppHeader.module.css":
      "export default new Proxy({}, { get: (_, name) => String(name) });",
  };
  const { outputFiles } = await build({
    stdin: {
      contents: source,
      sourcefile: fileURLToPath(headerPath),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    tsconfigRaw: {},
    plugins: [
      {
        name: "header-server-fixture",
        setup(builder) {
          builder.onResolve({ filter: /^react(?:\/|$)/ }, ({ path }) => ({
            path: pathToFileURL(siteRequire.resolve(path)).href,
            external: true,
          }));
          builder.onResolve({ filter: /.*/ }, ({ path }) =>
            Object.hasOwn(fixtures, path)
              ? { path, namespace: "header-fixture" }
              : undefined,
          );
          builder.onLoad(
            { filter: /.*/, namespace: "header-fixture" },
            ({ path }) => ({
              contents: fixtures[path],
            }),
          );
        },
      },
    ],
  });
  const url = `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`;
  const { AppHeader } = await import(/* @vite-ignore */ url);
  return renderToStaticMarkup(React.createElement(AppHeader));
}

describe("Mosaic site header first render", () => {
  it("includes every responsive control before browser JavaScript determines the viewport", async () => {
    const html = await renderHeader(true);
    expect(html).toContain('aria-label="Salt Design System Homepage"');
    expect(html).toContain('aria-label="GitHub repository"');
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain('aria-label="Site Search"');
    // Even a registered drawer host cannot handle a server-rendered click yet.
    expect(html).toMatch(
      /<button\b[^>]*aria-label="Open menu"[^>]*disabled=""/,
    );
  });

  it("does not replace header controls when the breakpoint hook changes", async () => {
    expect(await renderHeader(false)).toBe(await renderHeader(true));
  });
});
