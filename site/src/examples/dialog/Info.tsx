import { ReactElement, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/core";

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
        open={open}
        onOpenChange={onOpenChange}
        status="info"
        size="small"
        aria-labelledby="info-dialog"
      >
        <DialogTitle id="info-dialog-heading">File update</DialogTitle>
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
