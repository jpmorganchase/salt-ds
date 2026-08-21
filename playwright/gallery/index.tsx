import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@salt-ds/theme/css/theme-next.css";
import "@salt-ds/theme/index.css";
import "../../.storybook/styles.css";
import "./gallery.css";

import { SaltProvider } from "@salt-ds/core";
import type { ComponentType, ReactNode } from "react";
import * as ReactDOM from "react-dom";

interface StoryModule {
  [exportName: string]: unknown;
}

interface GalleryMountParams {
  story: string;
  props?: Record<string, unknown>;
}

interface SerializableViolation {
  help: string;
  id: string;
  impact: string | null;
  nodes: Array<{
    failureSummary?: string;
    html: string;
    target: string[];
  }>;
}

interface LegacyReactDOM {
  render(children: ReactNode, container: Element): void;
  unmountComponentAtNode(container: Element): boolean;
}

declare global {
  interface Window {
    mount(params: GalleryMountParams): Promise<void>;
    runAxe(): Promise<SerializableViolation[]>;
    unmount(): Promise<void>;
  }
}

const legacyReactDOM = ReactDOM as unknown as LegacyReactDOM;
const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Playwright component gallery requires a #root element");
}

const storyModules = import.meta.glob<StoryModule>("../stories/*.story.tsx");
const storyLoaders = new Map<string, () => Promise<StoryModule>>();

for (const [modulePath, loadStoryModule] of Object.entries(storyModules)) {
  const fileName = modulePath.split("/").at(-1)?.replace(".story.tsx", "");
  if (!fileName) continue;

  const prefix = fileName
    .split("-")
    .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
    .join("");
  storyLoaders.set(prefix, loadStoryModule);
}

const afterRender = async () => {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await document.fonts.ready;
};

window.mount = async ({ story, props = {} }) => {
  const [storyModuleName, exportName] = story.split("/");
  const loadStoryModule = storyLoaders.get(storyModuleName);
  if (!loadStoryModule || !exportName) {
    throw new Error(
      `Unknown Playwright component story "${story}". Available modules: ${[
        ...storyLoaders.keys(),
      ].join(", ")}`,
    );
  }
  const storyModule = await loadStoryModule();
  const storyExport = storyModule[exportName];
  if (typeof storyExport !== "function") {
    throw new Error(`Story module "${storyModuleName}" has no "${exportName}"`);
  }
  const Story = storyExport as ComponentType<Record<string, unknown>>;

  // Legacy render intentionally keeps this gallery usable in the React 16-18 CI matrix.
  legacyReactDOM.render(
    <SaltProvider density="medium" mode="light">
      <Story {...props} />
    </SaltProvider>,
    rootElement,
  );
  await afterRender();
};

window.unmount = async () => {
  legacyReactDOM.unmountComponentAtNode(rootElement);
  await afterRender();
};

window.runAxe = async () => {
  const { default: axe } = await import("axe-core");
  const { violations } = await axe.run(document, {
    // Component fixtures are not complete documents, but scanning the document
    // still includes portalled content such as Drawer.
    rules: {
      "landmark-one-main": { enabled: false },
      "page-has-heading-one": { enabled: false },
      region: { enabled: false },
    },
  });
  return violations.map(({ help, id, impact, nodes }) => ({
    help,
    id,
    impact: impact ?? null,
    nodes: nodes.map(({ failureSummary, html, target }) => ({
      failureSummary,
      html,
      target: target.map(String),
    })),
  }));
};
