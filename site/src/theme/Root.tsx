import { useMemo } from "react";
import {
  ToolkitProvider,
  useCurrentBreakpoint,
} from "@jpmorganchase/uitk-core";
import "@jpmorganchase/uitk-theme/index.css";

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
