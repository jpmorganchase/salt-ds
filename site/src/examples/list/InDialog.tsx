import {
  Button,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const InDialog = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open reports</Button>
      <Dialog open={open} onOpenChange={setOpen} size="small">
        <DialogHeader header="Reports" actions={<DialogCloseButton />} />
        <DialogContent>
          <List aria-label="Reports">
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
                <ListItemContent>Annual report</ListItemContent>
              </ListItemAction>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};
