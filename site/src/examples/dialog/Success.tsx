import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/lab";

export const Success = (): ReactElement => {
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
        Open success dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status="success"
        size="small"
        aria-labelledby="success-dialog"
      >
        <DialogTitle id="success-dialog-heading">File uploaded</DialogTitle>
        <DialogContent>
          File has been successfully uploaded to the shared drive.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button variant="cta" onClick={handleClose}>
            Go to file
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
