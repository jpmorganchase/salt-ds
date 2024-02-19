import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
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
        open={open}
        onOpenChange={onOpenChange}
        role="alertdialog"
        status="error"
        size="small"
        aria-labelledby="error-dialog"
      >
        <DialogTitle id="error-dialog-heading">Can`t move file</DialogTitle>
        <DialogContent>
          You don’t have permission to move or delete this file.
        </DialogContent>
        <DialogActions>
          <Button variant="cta" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
