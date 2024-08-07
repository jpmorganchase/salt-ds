import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  Tooltip,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const OverlayTemplate = (props: OverlayProps): ReactElement => {
  const { placement, ...rest } = props;
  const id = useId();

  return (
    <Overlay placement={placement} {...rest}>
      <OverlayTrigger>
        <Button>{placement}</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <h3 id={id} className={styles.contentHeading}>
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

export const Placement = (): ReactElement => (
  <div>
    <div style={{ marginBottom: 10 }}>
      <OverlayTemplate placement="top" />
    </div>
    <div style={{ marginBottom: 40 }}>
      <OverlayTemplate placement="bottom" />
    </div>
    <div style={{ marginBottom: 10 }}>
      <OverlayTemplate placement="left" />
    </div>
    <OverlayTemplate placement="right" />
  </div>
);
