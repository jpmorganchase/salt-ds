import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const InDialog = (): ReactElement => {
  const [open, setOpen] = useState(false);

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
    <>
      <Button onClick={() => setOpen(true)}>Open reports</Button>
      <Dialog open={open} onOpenChange={setOpen} size="small">
        <DialogHeader header="Reports" actions={closeButton} />
        <DialogContent>
          <List aria-label="Reports">
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Quarterly report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Annual report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
            <ListItem>
              <ListItemTrigger>
                <ListItemContent>Monthly performance report</ListItemContent>
              </ListItemTrigger>
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};
