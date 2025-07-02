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

import "@salt-ds/theme/css/salt/index.css";
import "@salt-ds/theme/css/uitk/index.css";

import "@salt-ds/theme/index.css";
import "./styles.css";

import { SaltProvider, SaltProviderNext } from "@salt-ds/core";
import { DocsContainer } from "@storybook/addon-docs";
import { initialize, mswLoader } from "msw-storybook-addon";
import type { ComponentProps } from "react";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import { withLocalization } from "./decorators/withLocalization";
import { withResponsiveWrapper } from "./decorators/withResponsiveWrapper";
import { withTextSpacingWrapper } from "./decorators/withTextSpacingWrapper";
import { withTheme } from "./decorators/withTheme";

import type { Preview } from "@storybook/react-vite";
import {
  defaultValues as themeNextDefaultValues,
  globalOptions as themeNextGlobals,
} from "./toolbar/ThemeNextToolbar";

// @ts-ignore
if (!window.Cypress) {
  // Initialize MSW
  initialize({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/apiMockServiceWorker.js" },
  });
}

const preview: Preview = {
  initialGlobals: {
    mode: "light",
    density: "medium",
    responsive: "unwrap",
    textSpacing: "disable",
    styleInjection: "enable",
    dateAdapter: "date-fns",
    ...themeNextDefaultValues,
  },
  globalTypes: {
    mode: {
      name: "Mode",
      description: "Set the theme mode",
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
      toolbar: {
        // Storybook built in icons here - https://www.chromatic.com/component?appId=5a375b97f4b14f0020b0cda3&name=Basics%2FIcon&buildNumber=20654
        icon: "graphbar",
        // array of plain string values or MenuItem shape (see below)
        items: ["touch", "low", "medium", "high"],
      },
    },
    responsive: {
      name: "Responsive Container",
      description: "wrap example in responsive container",
      toolbar: {
        icon: "collapse",
        items: ["wrap", "unwrap"],
      },
    },
    textSpacing: {
      name: "Text Spacing",
      description:
        "Applies styles meeting minimum required for WCAG 1.4.12 Text Spacing",
      toolbar: {
        title: "Text Spacing",
        items: ["disable", "enable"],
      },
    },
    styleInjection: {
      name: "Component Style Injection",
      description: "Turn on/off component style injection",
      toolbar: {
        items: ["disable", "enable"],
        title: "Component Style Injection",
      },
    },
    dateAdapter: {
      name: "Date Adapter",
      description: "Date adapter type",
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
  },
  argTypes: {
    ref: { control: false },
  },
  parameters: {
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
        ],
      },
    },
    docs: {
      codePanel: true,
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
    // disables snapshotting on a global level and enable modes
    chromatic: {
      disableSnapshot: true,
    },
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        xs: {
          name: "Extra small",
          styles: {
            width: "599px",
            height: "100%",
          },
        },
        sm: {
          name: "Small",
          styles: {
            width: "959px",
            height: "100%",
          },
        },
        md: {
          name: "Medium",
          styles: {
            width: "1279px",
            height: "100%",
          },
        },
        lg: {
          name: "Large",
          styles: {
            width: "1919px",
            height: "100%",
          },
        },
        xl: {
          name: "Extra large",
          styles: {
            width: "2000px",
            height: "100%",
          },
        },
        reflow: {
          name: "A11y reflow",
          styles: {
            width: "320px",
            height: "256px",
          },
        },
      },
    },
  },
  // Bottom most is outermost
  decorators: [
    withResponsiveWrapper,
    withTheme,
    withLocalization,
    withTextSpacingWrapper,
  ],
  loaders: [mswLoader],
};

export default preview;
