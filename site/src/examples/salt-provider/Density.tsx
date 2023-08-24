import { ReactElement } from "react";
import { useDensity, StackLayout, Text, capitalize } from "@salt-ds/core";
import styles from "./Density.module.css";

function Square() {
  return <div className={styles.square} />;
}

export const Density = (): ReactElement => {
  const density = useDensity();

  return (
    <div>
      <Text styleAs="h4">{capitalize(density)} Density</Text>
      <StackLayout direction="row" className={styles.squares}>
        <Square />
        <Square />
        <Square />
        <Square />
      </StackLayout>
    </div>
  );
};
