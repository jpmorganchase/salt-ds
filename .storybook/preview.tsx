import type { Parameters } from "@storybook/react";
import type { GlobalTypes } from "@storybook/csf";
import "@jpmorganchase/uitk-theme/index.css";

import { ComponentProps, ReactNode } from "react";
import { withTheme } from "docs/decorators/withTheme";
import { withResponsiveWrapper } from "docs/decorators/withResponsiveWrapper";
import { withTestIdWrapper } from "docs/decorators/withTestIdWrapper";
import { WithTextSpacingWrapper } from "docs/decorators/withTextSpacingWrapper";
import { withStrictMode } from "docs/decorators/withStrictMode";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { DocsContainer } from "@storybook/addon-docs";

const densities = ["touch", "low", "medium", "high"];
const DEFAULT_DENSITY = "medium";
const DEFAULT_THEME = "light";

export const globalTypes: GlobalTypes = {
  theme: {
    name: "Theme",
    description: "Set the color theme",
    defaultValue: DEFAULT_THEME,
    toolbar: {
      title: "Theme",
      // show the theme name once selected in the toolbar
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
        [
          "Styles and Theming",
          [
            "Introduction",
            "Foundations",
            ["Introduction", "*"],
            "Palette",
            "Characteristics",
            ["Introduction", "*"],
          ],
          "Icons",
          "Core",
          "Lab",
        ],
        "Icons",
        "Core",
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
        <ToolkitProvider theme={context.globals?.theme}>
          {children}
        </ToolkitProvider>
      </DocsContainer>
    ),
  },
  // disables snapshotting on a global level
  chromatic: { disableSnapshot: true },
};

// Bottom most is outermost
export const decorators = [
  // When theme provider alone is outside of density provider, some variables can't be resolved. Use withToolkitProvider
  withResponsiveWrapper,
  withTestIdWrapper,
  withTheme,
  WithTextSpacingWrapper,
  withStrictMode,
];
