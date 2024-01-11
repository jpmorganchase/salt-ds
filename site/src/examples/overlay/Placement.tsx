import { ReactElement } from "react";

import {
  Overlay,
  OverlayPanel,
  OverlayProps,
  OverlayTrigger,
} from "@salt-ds/lab";
import { Tooltip, Button } from "@salt-ds/core";
import styles from "./index.module.css";

export const OverlayTemplate = (props: OverlayProps): ReactElement => {
  const { id, placement, ...rest } = props;

  return (
    <Overlay id={id} placement={placement} {...rest}>
      <OverlayTrigger>
        <Button>{placement}</Button>
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

export const Placement = (): ReactElement => (
  <div>
    <div style={{ marginBottom: 10 }}>
      <OverlayTemplate id="overlay-top" placement="top" />
    </div>
    <div style={{ marginBottom: 40 }}>
      <OverlayTemplate id="overlay-bottom" placement="bottom" />
    </div>
    <div style={{ marginBottom: 10 }}>
      <OverlayTemplate id="overlay-left" placement="left" />
    </div>
    <OverlayTemplate id="overlay-right" placement="right" />
  </div>
);
