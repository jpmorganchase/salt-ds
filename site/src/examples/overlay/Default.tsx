import { ReactElement } from "react";
import {
  Tooltip,
  Button,
  useId,
  Overlay,
  OverlayPanel,
  OverlayTrigger,
  H3,
} from "@salt-ds/core";

import styles from "./index.module.css";

export const Default = (): ReactElement => {
  const id = useId();
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <H3 className={styles.contentHeading} id={id}>
          Title
        </H3>
        Content of Overlay
        <br />
        <br />
        <Tooltip content={"im a tooltip"}>
          <Button>hover me</Button>
        </Tooltip>
      </OverlayPanel>
    </Overlay>
  );
};
