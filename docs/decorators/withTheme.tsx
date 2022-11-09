import { DecoratorFn } from "@storybook/react";
import { Panel, ToolkitProvider } from "@jpmorganchase/uitk-core";

const MODES = ["light", "dark"];

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

export const withTheme: DecoratorFn = (StoryFn, context) => {
  const { density, mode } = context.globals;

  if (mode === "side-by-side" || mode === "stacked") {
    const isStacked = mode === "stacked";

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
        {MODES.map((mode) => (
          <ToolkitProvider
            applyClassesTo={"child"}
            density={density}
            mode={mode}
            key={mode}
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
    <ToolkitProvider density={density} mode={mode}>
      <Panel>
        {/*<SetBackground viewMode={context.viewMode} id={context.id} />*/}
        <StoryFn />
      </Panel>
    </ToolkitProvider>
  );
};
