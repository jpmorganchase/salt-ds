import type { Parameters } from "@storybook/react";
import type { GlobalTypes } from "@storybook/csf";
import "@jpmorganchase/uitk-theme/index.css";

import { ComponentProps } from "react";
import { withThemeBackground } from "./theme-switch/helpers";
import { withResponsiveWrapper } from "docs/decorators/withResponsiveWrapper";
import { withTestIdWrapper } from "docs/decorators/withTestIdWrapper";
import { withToolkitProvider } from "docs/decorators/withToolkitProvider";
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
    description: "Global theme for components",
    defaultValue: DEFAULT_THEME,
    // We used a custom toolbar implementation in ./theme-switch
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
      showName: true,
      items: ["disable", "enable"],
    },
  },
  strictMode: {
    name: "Strict Mode",
    description: "Enables React's Strict Mode",
    defaultValue: "enable",
    toolbar: {
      items: ["disable", "enable"],
      showName: true,
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
    }: ComponentProps<typeof DocsContainer>) => (
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
  withThemeBackground,
  withTestIdWrapper,
  withToolkitProvider,
  WithTextSpacingWrapper,
  withStrictMode,
];
