import { ToolkitProvider } from "@brandname/core";
import type { DecoratorFn, Parameters } from "@storybook/react";
import type { GlobalTypes } from "@storybook/csf";
import "@brandname/theme/index.css";
// TODO: Discuss what shall we do with global css, which we currently offer a little bit in TK1
import "@brandname/theme/global.css";

import { withThemeBackground } from "./theme-switch/helpers";
import { ResponsiveContainer } from "../stories/components/ResponsiveContainer";

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
    control: { type: "boolean" },

    toolbar: {
      icon: "collapse",
      items: ["wrap", "unwrap"],
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
          "Introduction",
          "*",
          "Styles and Theming",
          ["Introduction", "Foundation", "*"],
        ],
        "Released",
        "Unreleased",
      ],
    },
  },
};

const withToolkitProvider: DecoratorFn = (Story, context) => {
  const { density, theme } = context.globals;
  return (
    <ToolkitProvider density={density} theme={theme}>
      <Story {...context} />
    </ToolkitProvider>
  );
};

const withTestIdWrapper: DecoratorFn = (Story, context) => {
  return (
    // `display: inline-block` here to 'fix' the difference generated between TK1 and TK2 margin collapsed elements, e.g. h3
    <div data-testid="preview-area" style={{ display: "inline-block" }}>
      <Story {...context} />
    </div>
  );
};

const withResponsiveWrapper: DecoratorFn = (Story, context) => {
  const { responsive } = context.globals;

  return responsive === "wrap" ? (
    <ResponsiveContainer>
      <Story {...context} />
    </ResponsiveContainer>
  ) : (
    <Story {...context} />
  );
};

// Bottom most is outermost
export const decorators = [
  // When theme provider alone is outside of density provider, some variables can't be resolved. Use withToolkitProvider
  withResponsiveWrapper,
  withThemeBackground,
  withTestIdWrapper,
  withToolkitProvider,
];
