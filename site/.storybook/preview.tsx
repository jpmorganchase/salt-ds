import { ComponentProps, ReactNode } from "react";
import type { Parameters } from "@storybook/react";
import type { GlobalTypes } from "@storybook/csf";
import { DocsContainer } from "@storybook/addon-docs";
import "@salt-ds/theme/index.css";
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/300-italic.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/500-italic.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/800.css";
import "@fontsource/open-sans/800-italic.css";
import "./styles.css";
import "../src/css/custom.css";

import { SaltProvider } from "@salt-ds/core";
import { withTheme } from "../../docs/decorators/withTheme";
import { withStrictMode } from "../../docs/decorators/withStrictMode";

const densities = ["touch", "low", "medium", "high"];
const DEFAULT_DENSITY = "low";
const DEFAULT_MODE = "light";

export const globalTypes: GlobalTypes = {
  mode: {
    name: "Mode",
    description: "Set the theme mode",
    defaultValue: DEFAULT_MODE,
    toolbar: {
      title: "Mode",
      // show the mode name once selected in the toolbar
      dynamicTitle: true,
      items: [
        { value: "light", right: "⚪", title: "Light" },
        { value: "dark", right: "⚫", title: "Dark" },
        {
          value: "side-by-side",
          icon: "sidebaralt",
          title: "Side by side",
        },
        { value: "stacked", icon: "bottombar", title: "Stacked" },
      ],
    },
  },
  density: {
    name: "Density",
    description: "Global density for components",
    defaultValue: DEFAULT_DENSITY,
    toolbar: {
      // Storybook built in icons here - https://www.chromatic.com/component?appId=5a375b97f4b14f0020b0cda3&name=Basics%2FIcon&buildNumber=20654
      icon: "graphbar",
      // array of plain string values or MenuItem shape (see below)
      items: densities,
    },
  },
  strictMode: {
    name: "Strict Mode",
    description: "Enables React's Strict Mode",
    defaultValue: "enable",
    toolbar: {
      items: ["disable", "enable"],
      title: "Strict Mode",
    },
  },
};

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: "centered",
  controls: { expanded: true, sort: "requiredFirst" },
  docs: {
    container: ({
      children,
      context,
    }: ComponentProps<typeof DocsContainer> & { children?: ReactNode }) => (
      // @ts-ignore DocsContainer does not support React18 types
      <DocsContainer context={context}>
        <SaltProvider mode={context.globals?.mode}>{children}</SaltProvider>
      </DocsContainer>
    ),
  },
};

export const decorators = [withTheme, withStrictMode];
