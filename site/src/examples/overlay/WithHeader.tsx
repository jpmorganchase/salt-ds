import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { OverlayHeader } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const WithHeader = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleClose = () => setOpen(false);

  const headerActions = (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
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
        <OverlayHeader
          header={<h4 id={id}>Title</h4>}
          actions={headerActions}
        />
        <OverlayPanelContent>
          <div>Content of Overlay</div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
