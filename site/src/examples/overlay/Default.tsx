import { ReactElement } from "react";

import { Overlay, OverlayPanel, OverlayTrigger } from "@salt-ds/lab";
import { Tooltip, Button, useId } from "@salt-ds/core";

import styles from "./index.module.css";

export const Default = (): ReactElement => {
  const id = useId();

  return (
    <Overlay id={id}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <h3 id={`${id}-header`} className={styles.contentHeading}>
          Title
        </h3>
        <div id={`${id}-content`}>
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
