import {
  Button,
  Overlay,
  OverlayFooter,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const WithSections = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onOpenChange = (newOpen: boolean) => setOpen(newOpen);

  const handleClose = () => setOpen(false);

  return (
    <Overlay open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel style={{ width: 320, maxHeight: 200 }} aria-labelledby={id}>
        <OverlayHeader header="Review changes" id={id} />
        <OverlayPanelContent>
          <StackLayout>
            <Text as="p">
              Review the account updates before saving. The footer remains
              available while this content scrolls.
            </Text>
            <Text as="p">
              Contact details, notification preferences, and security settings
              will be updated when you save.
            </Text>
            <Text as="p">
              You can cancel to close the overlay without applying these
              changes.
            </Text>
          </StackLayout>
        </OverlayPanelContent>
        <OverlayFooter>
          <Button appearance="bordered" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose}>Save changes</Button>
        </OverlayFooter>
      </OverlayPanel>
    </Overlay>
  );
};
