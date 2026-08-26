import {
  Button,
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const InOverlay = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const headerId = useId();

  const handleClose = () => setOpen(false);

  const closeButton = (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <Overlay open={open} onOpenChange={setOpen} placement="bottom">
      <OverlayTrigger>
        <Button>Show reports</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={headerId}>
        <OverlayHeader header="Reports" actions={closeButton} id={headerId} />
        <OverlayPanelContent>
          <List aria-label="Reports" style={{ width: 320 }}>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Quarterly report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>
                  Annual report with a title that wraps in the narrow panel
                </ListItemContent>
              </ListItemTrigger>
            </ListItem>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Monthly performance report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
          </List>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
