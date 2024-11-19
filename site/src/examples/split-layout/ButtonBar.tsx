import { Button, FlowLayout, SplitLayout } from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

const startItem = (
  <FlowLayout gap={1}>
    <Button appearance="bordered" style={{ marginRight: "auto" }}>
      My privacy settings
    </Button>
  </FlowLayout>
);
const endItem = (
  <FlowLayout gap={1}>
    <Button sentiment="accented" appearance="bordered">
      Cancel
    </Button>
    <Button sentiment="accented">Accept</Button>
  </FlowLayout>
);

export const ButtonBar = (): ReactElement => (
  <SplitLayout
    startItem={startItem}
    endItem={endItem}
    className={styles.splitLayout}
  />
);
