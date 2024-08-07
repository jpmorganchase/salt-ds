import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  Tooltip,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";

import styles from "./index.module.css";

export const Default = (): ReactElement => {
  const id = useId();
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <h3 className={styles.contentHeading} id={id}>
            Title
          </h3>
          <div>
            Content of Overlay
            <br />
            <br />
            <Tooltip content={"I'm a tooltip"}>
              <Button>hover me</Button>
            </Tooltip>
          </div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
