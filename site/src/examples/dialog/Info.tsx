import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogCloseButton,
} from "@salt-ds/lab";

export const Info = (): ReactElement => {
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
        Open info dialog
      </Button>
      <Dialog
        style={{ width: 500 }}
        open={open}
        onOpenChange={onOpenChange}
        role="alertdialog"
        status="info"
      >
        <DialogTitle>Info</DialogTitle>
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
