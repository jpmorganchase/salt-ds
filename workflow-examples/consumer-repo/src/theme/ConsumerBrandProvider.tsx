import { SaltProvider } from "@salt-ds/core";
import type { ComponentProps } from "react";

import "@salt-ds/theme/index.css";
import "./consumer-brand.css";

export type ConsumerBrandProviderProps = ComponentProps<typeof SaltProvider>;

/** Repo-owned provider declared by `.salt/team.json`. */
export function ConsumerBrandProvider(props: ConsumerBrandProviderProps) {
  return (
    <SaltProvider density="high" {...props} />
  );
}
