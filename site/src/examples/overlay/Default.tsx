import { ReactElement } from "react";

import { Overlay } from "@salt-ds/lab";
import { Tooltip, Button } from "@salt-ds/core";
import styles from "./index.module.css";

const OverlayContent = (
  <>
    <h3 id="overlay_label" className={styles.contentHeading}>
      Title
    </h3>
    <div id="overlay_description">
      Content of Overlay
      <br />
      <br />
      <Tooltip content={"im a tooltip"}>
        <Button>hover me</Button>
      </Tooltip>
    </div>
  </>
);

export const Default = (): ReactElement => (
  <Overlay
    aria-labelledby="overlay_label"
    aria-describedby="overlay_description"
    content={OverlayContent}
  >
    <Button>Show Overlay</Button>
  </Overlay>
);
