import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogCloseButton,
} from "@salt-ds/lab";

export const Warning = (): ReactElement => {
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
        Open warning dialog
      </Button>
      <Dialog
        style={{ width: 500 }}
        open={open}
        onOpenChange={onOpenChange}
        role="alertdialog"
        status="warning"
      >
        <DialogTitle>File access</DialogTitle>
        <DialogContent>
          Users will be able to make edits and modify Trades 2023 file. Give
          access anyway?
        </DialogContent>
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
            Continue
          </Button>
        </DialogActions>
        <DialogCloseButton onClick={handleClose} />
      </Dialog>
    </>
  );
};
