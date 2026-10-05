import {
  ModeValues,
  Panel,
  SaltProvider,
  SaltProviderNext,
} from "@salt-ds/core";
import mobileInterimCss from "@salt-ds/theme/css/experimental/mobile-interim.css?inline";
import type { Decorator } from "@storybook/react-vite";
import { useInsertionEffect } from "react";

const useMobileInterimStyles = (enabled: boolean) => {
  useInsertionEffect(() => {
    if (!enabled) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-storybook-style", "mobile-interim");
    styleElement.textContent = mobileInterimCss;
    // Appended last so it wins specificity ties with the theme's mobile density tokens
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, [enabled]);
};

export const withTheme: Decorator = (StoryFn, context) => {
  const { mode, styleInjection, theme } = context.globals;

  const isMobileInterim = context.globals.density === "mobile-interim";
  const density = isMobileInterim ? "mobile" : context.globals.density;
  useMobileInterimStyles(isMobileInterim);

  const Provider = theme === "brand" ? SaltProviderNext : SaltProvider;
  const themeName = theme === "salt-interim" ? "salt-interim" : undefined;

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
            theme={themeName}
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
      theme={themeName}
    >
      <StoryFn />
    </Provider>
  );
};
