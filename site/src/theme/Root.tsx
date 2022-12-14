import { useMemo } from "react";
import { ToolkitProvider, useCurrentBreakpoint } from "@salt-ds/core";
import "@salt-ds/theme/index.css";
import "@fontsource/open-sans/300.css";
import "@fontsource/open-sans/300-italic.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/500.css";
import "@fontsource/open-sans/500-italic.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/600-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";
import "@fontsource/open-sans/800.css";
import "@fontsource/open-sans/800-italic.css";

const DensityProvider = ({ children }) => {
  const viewport = useCurrentBreakpoint();

  const density = useMemo(
    () => (viewport === "xl" || viewport === "lg" ? "low" : "touch"),
    [viewport]
  );

  return <ToolkitProvider density={density}>{children}</ToolkitProvider>;
};

export default function Root({ children }) {
  return (
    <ToolkitProvider mode="dark">
      <DensityProvider>{children}</DensityProvider>
    </ToolkitProvider>
  );
}
