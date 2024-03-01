import { ReactElement, useState } from "react";
import { Button, useId } from "@salt-ds/core";
import {
  Dialog,
  DialogHeader,
  DialogActions,
  DialogContent,
} from "@salt-ds/lab";

export const MandatoryAction = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>Open Mandatory Action Dialog</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        disableDismiss
        size="small"
        status="error"
        id={id}
      >
        <DialogHeader header="Delete Transaction" />
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
