import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogCloseButton,
} from "@salt-ds/lab";

export const Error = (): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open error dialog
      </Button>
      <Dialog
        style={{ width: 500 }}
        open={open}
        onOpenChange={onOpenChange}
        role="alertdialog"
        status="error"
      >
        <DialogTitle>Can't move file</DialogTitle>
        <DialogContent>
          You don’t have permission to move or delete this file.
        </DialogContent>
        <DialogActions>
          <Button variant="cta" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
        <DialogCloseButton onClick={handleClose} />
      </Dialog>
    </>
  );
};
