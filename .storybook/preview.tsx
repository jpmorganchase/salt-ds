import "@fontsource/open-sans/300-italic.css";
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/500-italic.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/800-italic.css";
import "@fontsource/open-sans/800.css";
import "@fontsource/pt-mono";
import "@salt-ds/theme/css/theme-next.css";
import "@salt-ds/theme/index.css";
import type { ArgTypes, GlobalTypes, Parameters } from "@storybook/types";
import "./styles.css";

import { SaltProvider, SaltProviderNext } from "@salt-ds/core";
import { DocsContainer } from "@storybook/addon-docs";
import { withDateMock } from "docs/decorators/withDateMock";
import { withLocalization } from "docs/decorators/withLocalization";
import { withResponsiveWrapper } from "docs/decorators/withResponsiveWrapper";
import { withScaffold } from "docs/decorators/withScaffold";
import { WithTextSpacingWrapper } from "docs/decorators/withTextSpacingWrapper";
import { withTheme } from "docs/decorators/withTheme";
import { initialize, mswLoader } from "msw-storybook-addon";
import type { ComponentProps } from "react";

import { globalOptions as themeNextGlobals } from "./toolbar/ThemeNextToolbar";

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
  scaffold: {
    name: "Scaffold",
    description: "Enables the testing scaffold",
    defaultValue: "disable",
    toolbar: {
      items: ["disable", "enable"],
      title: "Scaffold",
    },
  },
  styleInjection: {
    name: "Component Style Injection",
    description: "Turn on/off component style injection",
    defaultValue: "enable",
    toolbar: {
      items: ["disable", "enable"],
      title: "Component Style Injection",
    },
  },
  dateAdapter: {
    name: "Date Adapter",
    description: "Date adapter type",
    defaultValue: "dayjs",
    toolbar: {
      items: [
        { value: "date-fns", title: "date-fns" },
        { value: "dayjs", title: "dayjs" },
        { value: "luxon", title: "luxon" },
        { value: "moment", title: "moment (legacy)" },
      ],
      title: "Date Adapter",
    },
  },
  ...themeNextGlobals,
};

export const argTypes: ArgTypes = {
  ref: { control: false },
};

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  mockDate: "2024-05-06",
  layout: "centered",
  // Show props description in Controls panel
  controls: { expanded: true, sort: "requiredFirst" },
  options: {
    storySort: {
      method: "alphabetical",
      order: [
        "Documentation",
        ["Introduction", "*", "Lab"],
        "Patterns",
        "Core",
        "Icons",
        "Lab",
        "*",
        "Theme",
        [
          "About the Salt Theme",
          "Palettes",
          ["*", "Opacities"],
          "Characteristics",
        ],
      ],
    },
  },
  docs: {
    container: ({
      children,
      context,
      ...rest
    }: ComponentProps<typeof DocsContainer>) => {
      const ChosenProvider =
        /* @ts-ignore Waiting for https://github.com/storybookjs/storybook/issues/12982 */
        context.store.userGlobals.globals?.themeNext === "enable"
          ? SaltProviderNext
          : SaltProvider;
      return (
        <DocsContainer context={context} {...rest}>
          <ChosenProvider
            /* @ts-ignore Waiting for https://github.com/storybookjs/storybook/issues/12982 */
            mode={context.store.userGlobals.globals?.mode}
            enableStyleInjection={
              /* @ts-ignore Waiting for https://github.com/storybookjs/storybook/issues/12982 */
              context.store.userGlobals.globals?.styleInjection === "enable"
            }
            /* @ts-ignore Waiting for https://github.com/storybookjs/storybook/issues/12982 */
            accent={context.store.userGlobals.globals?.accent}
          >
            {children}
          </ChosenProvider>
        </DocsContainer>
      );
    },
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
  withLocalization,
  WithTextSpacingWrapper,
  withDateMock,
];

export const loaders = [mswLoader];
