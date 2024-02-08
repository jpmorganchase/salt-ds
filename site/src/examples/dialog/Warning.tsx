import { ReactElement, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/core";

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
        open={open}
        onOpenChange={onOpenChange}
        status="warning"
        size={"small"}
        id={"warning-dialog"}
      >
        <DialogTitle>File access</DialogTitle>
        <DialogContent>
          Users will be able to make edits and modify Trades 2023 file. Give
          access anyway?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Give access
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
