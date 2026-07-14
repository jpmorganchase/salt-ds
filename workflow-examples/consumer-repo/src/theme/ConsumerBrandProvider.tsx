import { SaltProvider } from "@salt-ds/core";
import type { ComponentProps } from "react";

export type ConsumerBrandProviderProps = ComponentProps<typeof SaltProvider>;

/** Repo-owned provider declared by `.salt/team.json`. */
export function ConsumerBrandProvider(props: ConsumerBrandProviderProps) {
  return <SaltProvider {...props} />;
}
