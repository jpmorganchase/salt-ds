import {
  ModeValues,
  Panel,
  SaltProvider,
  SaltProviderNext,
} from "@salt-ds/core";
import type { Decorator } from "@storybook/react-vite";

export const withTheme: Decorator = (StoryFn, context) => {
  const { density, mode, styleInjection, theme } = context.globals;

  const Provider = theme === "brand" ? SaltProviderNext : SaltProvider;

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
        {ModeValues.map((mode) => (
          <Provider
            applyClassesTo={"child"}
            density={density}
            mode={mode}
            key={`${mode}-${styleInjection}`}
            enableStyleInjection={styleInjection === "enable"}
            accent="teal"
            corner="rounded"
            headingFont="Amplitude"
            actionFont="Amplitude"
          >
            <Panel>
              <StoryFn />
            </Panel>
          </Provider>
        ))}
      </div>
    );
  }

  return (
    <Provider
      density={density}
      mode={mode}
      key={`${mode}-${styleInjection}`}
      enableStyleInjection={styleInjection === "enable"}
      accent="teal"
      corner="rounded"
      headingFont="Amplitude"
      actionFont="Amplitude"
    >
      <StoryFn />
    </Provider>
  );
};
