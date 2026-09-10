import {
  Button,
  H3,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
  Text,
  useId,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const CloseButton = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleClose = () => setOpen(false);

  return (
    <Overlay placement="right" open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent>
          <H3
            id={id}
            style={{ margin: 0, marginBottom: "var(--salt-spacing-100)" }}
          >
            Title
          </H3>
          <Text>Content of Overlay</Text>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
