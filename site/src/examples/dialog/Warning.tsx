import { ReactElement, useState } from "react";
import { Button, useId } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@salt-ds/lab";

export const Warning = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>Open warning dialog</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status="warning"
        size="small"
        id={id}
      >
        <DialogTitle title="File access" />

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
