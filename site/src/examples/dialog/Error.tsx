import { ReactElement, useState } from "react";
import { Button, useId } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/lab";

export const Error = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const id = useId();

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
        aria-labelledby={id}
      >
        <DialogTitle title="Can`t move file" id={id} />
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
