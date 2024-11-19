import { Button, FlowLayout, SplitLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

const startItem = (
  <FlowLayout gap={1}>
    <Button sentiment="accented">Button 1</Button>
    <Button sentiment="neutral">Button 2</Button>
    <Button appearance="transparent">Button 3</Button>
  </FlowLayout>
);
const endItem = (
  <FlowLayout gap={1}>
    <Button sentiment="accented">Button 4</Button>
    <Button sentiment="neutral">Button 5</Button>
  </FlowLayout>
);

export const ButtonBar = (): ReactElement => (
  <SplitLayout
    startItem={startItem}
    endItem={endItem}
    className={styles.splitLayout}
  />
);
