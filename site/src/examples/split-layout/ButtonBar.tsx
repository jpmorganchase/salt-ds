import { ReactElement } from "react";
import { SplitLayout, Button, FlowLayout } from "@salt-ds/core";
import styles from "./index.module.css";

const startItem = (
  <FlowLayout gap={1}>
    <Button variant="cta">Button 1</Button>
    <Button variant="primary">Button 2</Button>
    <Button variant="secondary">Button 3</Button>
  </FlowLayout>
);
const endItem = (
  <FlowLayout gap={1}>
    <Button variant="cta">Button 4</Button>
    <Button variant="primary">Button 5</Button>
  </FlowLayout>
);

export const ButtonBar = (): ReactElement => (
  <SplitLayout
    startItem={startItem}
    endItem={endItem}
    className={styles.splitLayout}
  />
);
