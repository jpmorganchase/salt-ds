import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogCloseButton,
} from "@salt-ds/lab";

export const DialogCloseButton = (): ReactElement => {
  const [open, setOpen] = useState(true);

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
        Open default dialog
      </Button>
      <Dialog style={{ width: 500 }} open={open} onOpenChange={onOpenChange}>
        <DialogTitle>Congratulations! You have created a Dialog.</DialogTitle>
        <DialogContent>This is the content of the dialog.</DialogContent>
        <DialogActions>
          <Button
            style={{ marginRight: "auto" }}
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button onClick={handleClose}>Previous</Button>
          <Button variant="cta" onClick={handleClose}>
            Next
          </Button>
        </DialogActions>
        <DialogCloseButton onClick={handleClose} />
      </Dialog>
    </>
  );
};
