import {
  Button,
  H3,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
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
          <StackLayout gap={0.5}>
            <H3 id={id}>
              <strong>Title</strong>
            </H3>
            <Text>Content of Overlay</Text>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
