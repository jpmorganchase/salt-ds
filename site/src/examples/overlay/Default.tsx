import { ReactElement } from "react";

import {
  Overlay,
  OverlayPanel,
  OverlayProps,
  OverlayTrigger,
} from "@salt-ds/lab";
import { Tooltip, Button } from "@salt-ds/core";

export const Default = (props: OverlayProps): ReactElement => {
  const { style, ...rest } = props;
  const id = "overlay-default";

  return (
    <Overlay id={id} {...rest}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel style={style}>
        <h3 id={`${id}-header`} className="content-heading">
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
