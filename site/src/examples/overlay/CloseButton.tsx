import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  useId,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";
import { CloseIcon } from "@salt-ds/icons";

export const CloseButton = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleClose = () => setOpen(false);
  const CloseButton = () => (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );
  return (
    <Overlay placement="right" open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayHeader id={id} header="Title" actions={<CloseButton />} />
        <OverlayPanelContent>
          <div>Content of Overlay</div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
