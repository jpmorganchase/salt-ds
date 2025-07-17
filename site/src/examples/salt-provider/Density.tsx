import {
  capitalize,
  FlexLayout,
  SaltProvider,
  StackLayout,
  Text,
  useDensity,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./Density.module.css";

function Square() {
  return <div className={styles.square} />;
}

export const Density = (): ReactElement => {
  const density = useDensity();

  return (
    <SaltProvider density={density}>
      <FlexLayout direction="column">
        <Text>{capitalize(density)} Density</Text>
        <StackLayout direction="row" className={styles.squares}>
          <Square />
          <Square />
          <Square />
          <Square />
        </StackLayout>
      </FlexLayout>
    </SaltProvider>
  );
};
