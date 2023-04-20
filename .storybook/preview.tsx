import type { ArgTypes, Parameters } from "@storybook/react";
import type { GlobalTypes } from "@storybook/csf";
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

import { ComponentProps, ReactNode } from "react";
import { withTheme } from "docs/decorators/withTheme";
import { withResponsiveWrapper } from "docs/decorators/withResponsiveWrapper";
import { WithTextSpacingWrapper } from "docs/decorators/withTextSpacingWrapper";
import { withStrictMode } from "docs/decorators/withStrictMode";
import { withScaffold } from "docs/decorators/withScaffold";
import { SaltProvider } from "@salt-ds/core";
import { DocsContainer } from "@storybook/addon-docs";
import { initialize, mswDecorator } from "msw-storybook-addon";

const densities = ["touch", "low", "medium", "high"];
const DEFAULT_DENSITY = "medium";
const DEFAULT_MODE = "light";

// @ts-ignore
if (!window.Cypress) {
  // Initialize MSW
  initialize({
    onUnhandledRequest: "bypass",
  });
}

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
  responsive: {
    name: "Responsive Container",
    description: "wrap example in responsive container",
    defaultValue: "unwrap",
    toolbar: {
      icon: "collapse",
      items: ["wrap", "unwrap"],
    },
  },
  textSpacing: {
    name: "Text Spacing",
    description:
      "Applies styles meeting minimum required for WCAG 1.4.12 Text Spacing",
    defaultValue: "disable",
    toolbar: {
      title: "Text Spacing",
      items: ["disable", "enable"],
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
  scaffold: {
    name: "Scaffold",
    description: "Enables the testing scaffold",
    defaultValue: "disable",
    toolbar: {
      items: ["disable", "enable"],
      title: "Scaffold",
    },
  },
};

export const argTypes: ArgTypes = {
  ref: { control: { type: null } },
};

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: "centered",
  // Show props description in Controls panel
  controls: { expanded: true, sort: "requiredFirst" },
  options: {
    storySort: {
      method: "alphabetical",
      order: [
        "Documentation",
        ["Core", "Icons", "Lab"],
        "Theme",
        [
          "About the Salt Theme",
          "Foundations",
          "Palettes",
          ["*", "Opacities"],
          "Characteristics",
        ],
        "Core",
        "Icons",
        "Lab",
      ],
    },
  },
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
  // disables snapshotting on a global level
  chromatic: { disableSnapshot: true },
};

// Bottom most is outermost
export const decorators = [
  // When theme provider alone is outside of density provider, some variables can't be resolved. Use withSaltProvider
  withScaffold,
  withResponsiveWrapper,
  withTheme,
  WithTextSpacingWrapper,
  withStrictMode,
  mswDecorator,
];
