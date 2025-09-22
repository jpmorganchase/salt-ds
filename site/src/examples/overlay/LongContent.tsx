import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const LongContent = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleClose = () => setOpen(false);

  const closeButton = (
    <Button
      aria-label="Close dialog"
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
      <OverlayPanel
        style={{
          width: 300,
        }}
      >
        <OverlayHeader header="Long content" actions={closeButton} />
        <OverlayPanelContent style={{ height: 200 }}>
          <StackLayout>
            <div>
              This example text is intended to demonstrate layout and formatting within the component. The content shown here is for illustrative purposes and does not represent actual information or advice.
            </div>
            <div>
              Sample paragraphs like this can be used to visualize how text will appear in different scenarios. The wording is generic and designed to help review spacing, alignment, and overall presentation in the user interface.
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
