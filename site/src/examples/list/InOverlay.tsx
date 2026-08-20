import {
  Button,
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const InOverlay = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <Overlay open={open} onOpenChange={setOpen} placement="bottom">
      <OverlayTrigger>
        <Button>Show reports</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelCloseButton />
        <OverlayPanelContent>
          <List aria-label="Reports" style={{ width: 320 }}>
            <ListItem>
              <ListItemAction>
                <ListItemContent>Quarterly report</ListItemContent>
              </ListItemAction>
              <ListItemActions>
                <Button aria-label="Download quarterly report">Download</Button>
              </ListItemActions>
            </ListItem>
            <ListItem>
              <ListItemAction>
                <ListItemContent>
                  Annual report with a title that wraps in the narrow panel
                </ListItemContent>
              </ListItemAction>
            </ListItem>
          </List>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
