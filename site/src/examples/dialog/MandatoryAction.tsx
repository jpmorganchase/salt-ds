import { ReactElement, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/core";

export const MandatoryAction = (): ReactElement => {
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
        Open Mandatory Action Dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        disableDismiss
        size="small"
        status="error"
        aria-labelledby="error-dialog"
      >
        <DialogTitle id="error-dialog-heading">Delete Transaction</DialogTitle>
        <DialogContent>
          Are you sure you want to permenantly delete transaction?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
