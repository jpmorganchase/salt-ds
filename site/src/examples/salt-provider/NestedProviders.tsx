import { ReactElement } from "react";
import { Card, SaltProvider, useDensity, useTheme } from "@salt-ds/core";
import styles from "./NestedProviders.module.css";

const invertMode = (mode: string): "light" | "dark" =>
  mode === "light" ? "dark" : "light";

export const NestedProviders = (): ReactElement => {
  const { mode } = useTheme();
  const density = useDensity();
  return (
    <SaltProvider>
      <Card className={styles.card}>
        This Card is wrapped with a Salt Provider, the mode is {mode} and the
        density is {density}.
        <SaltProvider mode={invertMode(mode)}>
          <Card className={styles.nestedCard}>
            This Card is wrapped with a nested Salt Provider, the mode is{" "}
            {invertMode(mode)} and the density is inherited from the parent
            provider.
          </Card>
        </SaltProvider>
      </Card>
    </SaltProvider>
  );
};
