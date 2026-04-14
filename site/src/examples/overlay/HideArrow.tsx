import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";

import styles from "./index.module.css";

export const HideArrow = (): ReactElement => {
  const id = useId();
  return (
    <Overlay placement="bottom" hideArrow>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <h3 className={styles.contentHeading} id={id}>
            Title
          </h3>
          <div>Content of Overlay</div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
