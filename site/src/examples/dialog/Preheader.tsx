import { ReactElement, useState } from "react";
import { Button, FormField, FormFieldLabel, Input, useId } from "@salt-ds/core";
import {
  Dialog,
  DialogHeader,
  DialogActions,
  DialogContent,
  DialogCloseButton,
} from "@salt-ds/lab";

export const Preheader = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>Open dialog with preheader</Button>
      <Dialog open={open} onOpenChange={onOpenChange} size="small" id={id}>
        <DialogHeader
          header="Subscribe"
          preheader="Recieve emails about the latest updates"
        />
        <DialogCloseButton onClick={handleClose} />

        <DialogContent>
          <FormField necessity="asterisk">
            <FormFieldLabel> Email </FormFieldLabel>
            <Input defaultValue="Email Address" />
          </FormField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
