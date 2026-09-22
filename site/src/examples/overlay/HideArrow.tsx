import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  Text,
  useId,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const HideArrow = (): ReactElement => {
  const id = useId();
  return (
    <Overlay placement="bottom" hideArrow>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayHeader header="Title" id={id} />
        <OverlayPanelContent>
          <Text as="p">Content of Overlay</Text>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
