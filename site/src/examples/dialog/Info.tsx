import { ReactElement, useState } from "react";
import { Button, useId } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/lab";

export const Info = (): ReactElement => {
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
        Open info dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status="info"
        size="small"
        aria-labelledby={id}
      >
        <DialogTitle title="File update" id={id} />
        <DialogContent>
          A new version of this file is available with 26 updates.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button variant="cta" onClick={handleClose}>
            See updates
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
