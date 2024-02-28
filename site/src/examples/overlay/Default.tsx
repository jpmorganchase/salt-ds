import { ReactElement } from "react";

import { Overlay, OverlayPanel, OverlayTrigger } from "@salt-ds/lab";
import { Tooltip, Button } from "@salt-ds/core";

import styles from "./index.module.css";

export const Default = (): ReactElement => {
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <h3 className={styles.contentHeading}>Title</h3>
        <div>
          Content of Overlay
          <br />
          <br />
          <Tooltip content={"im a tooltip"}>
            <Button>hover me</Button>
          </Tooltip>
        </div>
      </OverlayPanel>
    </Overlay>
  );
};
