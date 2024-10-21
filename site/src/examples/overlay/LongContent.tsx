import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const LongContent = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleClose = () => setOpen(false);

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
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent style={{ height: 200 }}>
          <StackLayout>
            <div>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industrys standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </div>
            <div>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
