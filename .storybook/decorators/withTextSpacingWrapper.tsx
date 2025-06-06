import type { Decorator } from "@storybook/react-vite";
import "./text-spacing.css";
import { useEffect } from "react";

export const withTextSpacingWrapper: Decorator = (Story, context) => {
  const isActive = context.globals.textSpacing === "enable";

  useEffect(() => {
    if (isActive) {
      document.body.classList.add("addon-text-spacing-enabled");
    } else {
      document.body.classList.remove("addon-text-spacing-enabled");
    }

    return () => {
      document.body.classList.remove("addon-text-spacing-enabled");
    };
  }, [isActive]);

  return <Story {...context} />;
};
