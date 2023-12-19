import { ReactElement } from "react";

import { Overlay, OverlayProps } from "@salt-ds/lab";
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

const OverlayTemplate = (
  placement?: OverlayProps["placement"]
): ReactElement => (
  <Overlay
    aria-labelledby="overlay_label"
    aria-describedby="overlay_description"
    content={OverlayContent}
    placement={placement}
  >
    <Button>{placement}</Button>
  </Overlay>
);

export const Placement = (): ReactElement => (
  <div>
    <div style={{ marginBottom: 10 }}>{OverlayTemplate("top")}</div>
    <div style={{ marginBottom: 40 }}>{OverlayTemplate("bottom")}</div>
    <div style={{ marginBottom: 10 }}>{OverlayTemplate("left")}</div>
    {OverlayTemplate("right")}
  </div>
);
