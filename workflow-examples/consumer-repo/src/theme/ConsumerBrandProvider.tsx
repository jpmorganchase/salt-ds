import { SaltProvider } from "@salt-ds/core";
import type { ComponentProps } from "react";

import "@salt-ds/theme/index.css";
import "./consumer-brand.css";

export type ConsumerBrandProviderProps = ComponentProps<typeof SaltProvider>;

/** Consumer-owned provider composition used by this package fixture. */
export function ConsumerBrandProvider(props: ConsumerBrandProviderProps) {
  return <SaltProvider density="high" {...props} />;
}
