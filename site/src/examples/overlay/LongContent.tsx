import { ReactElement, useState } from "react";
import {
  Button,
  StackLayout,
  Overlay,
  OverlayPanel,
  OverlayTrigger,
  OverlayPanelCloseButton,
  OverlayPanelContent,
} from "@salt-ds/core";

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
          height: 200,
          overflow: "auto",
        }}
      >
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent>
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
