import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const HideArrow = (): ReactElement => {
  return (
    <Overlay placement="bottom" hideArrow>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayHeader header="Title" />
        <OverlayPanelContent>
          <Text as="p">Content of Overlay</Text>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
