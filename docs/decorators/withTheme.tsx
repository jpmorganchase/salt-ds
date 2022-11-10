import { DecoratorFn } from "@storybook/react";
import { Panel, ToolkitProvider, useTheme } from "@jpmorganchase/uitk-core";
import { useEffect } from "react";

const THEMES = ["light", "dark"];

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

function SetBackground({ viewMode, id }: { viewMode: string; id: string }) {
  const [theme] = useTheme();
  const selectorId =
    viewMode === "docs"
      ? `addon-backgrounds-docs-${id}`
      : `addon-backgrounds-color`;

  const selector = viewMode === "docs" ? `.docs-story` : ".sb-show-main";

  useEffect(() => {
    const color = theme.getCharacteristicValue("text", "primary-foreground");
    const background = theme.getCharacteristicValue(
      "container",
      "background-medium"
    );

    addBackgroundStyle(
      selectorId,
      `
        ${selector} {
          background: ${background || "unset"};
          color: ${color || "unset"};
          transition: background-color 0.3s;
        }
      `
    );
  }, [selectorId, selector, theme]);

  return null;
}

export const withTheme: DecoratorFn = (StoryFn, context) => {
  const { density, theme } = context.globals;

  if (theme === "side-by-side" || theme === "stacked") {
    const isStacked = theme === "stacked";

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isStacked
            ? "1fr"
            : "repeat(auto-fit, minmax(0px, 1fr))",
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {THEMES.map((theme) => (
          <ToolkitProvider
            applyClassesTo={"child"}
            density={density}
            theme={theme}
            key={theme}
          >
            <Panel>
              <StoryFn />
            </Panel>
          </ToolkitProvider>
        ))}
      </div>
    );
  }

  return (
    <ToolkitProvider density={density} theme={theme}>
      <SetBackground viewMode={context.viewMode} id={context.id} />
      <StoryFn />
    </ToolkitProvider>
  );
};
