import { useMemo, useEffect } from "react";
import { DecoratorFn } from "@storybook/react";

// Modified from storybook background addon
// https://github.com/storybookjs/storybook/blob/next/addons/backgrounds/src/helpers/index.ts
export const addBackgroundStyle = (selector: string, css: string) => {
  const existingStyle = document.getElementById(selector);
  if (existingStyle) {
    if (existingStyle.innerHTML !== css) {
      existingStyle.innerHTML = css;
    }
  } else {
    const style = document.createElement("style");
    style.setAttribute("id", selector);
    style.innerHTML = css;

    document.head.appendChild(style);
  }
};

// Modified from storybook background addon
// https://github.com/storybookjs/storybook/blob/master/addons/backgrounds/src/decorators/withBackground.ts
export const withThemeBackground: DecoratorFn = (StoryFn, context) => {
  const { globals } = context;
  const theme = globals.theme;

  const selectedBackgroundColor = useMemo(() => {
    return theme === "light" ? "white" : "#242526";
  }, [theme]);

  const selectedTextColor = useMemo(() => {
    // TODO: var(--uitk-text-primary-foreground)" can't be resolved
    return theme === "light" ? "rgb(22, 22, 22)" : "rgb(255,255,255)";
  }, [theme]);

  const selector =
    context.viewMode === "docs"
      ? `#anchor--${context.id} .docs-story`
      : ".sb-show-main";

  const backgroundStyles = useMemo(() => {
    return `
        ${selector} {
          background: ${selectedBackgroundColor};
          color: ${selectedTextColor};
          transition: background-color 0.3s;
        }
      `;
  }, [selectedBackgroundColor, selector]);

  useEffect(() => {
    const selectorId =
      context.viewMode === "docs"
        ? `addon-backgrounds-docs-${context.id}`
        : `addon-backgrounds-color`;

    addBackgroundStyle(selectorId, backgroundStyles);
  }, [backgroundStyles, context]);

  return StoryFn();
};
