import {
  Card,
  SaltProvider,
  StackLayout,
  Text,
  useDensity,
  useTheme,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./NestedProviders.module.css";

const invertMode = (mode: string): "light" | "dark" =>
  mode === "light" ? "dark" : "light";

export const NestedProviders = (): ReactElement => {
  const { mode } = useTheme();
  const density = useDensity();
  return (
    <SaltProvider>
      <Card className={styles.card}>
        <StackLayout gap={1}>
          <Text as="p">
            This Card is wrapped with a Salt Provider, the mode is {mode} and
            the density is {density}.
          </Text>
          <SaltProvider mode={invertMode(mode)}>
            <Card>
              <Text as="p">
                This Card is wrapped with a nested Salt Provider, the mode
                is&nbsp;
                {invertMode(mode)} and the density is inherited from the parent
                provider.
              </Text>
            </Card>
          </SaltProvider>
        </StackLayout>
      </Card>
    </SaltProvider>
  );
};
