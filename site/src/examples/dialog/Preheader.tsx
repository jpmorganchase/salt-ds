import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormField,
  FormFieldLabel,
  Input,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

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

  const closeButton = (
    <Button
      aria-label="Close dialog"
      appearance="transparent"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open dialog with preheader</Button>
      <Dialog open={open} onOpenChange={onOpenChange} size="small" id={id}>
        <DialogHeader
          header="Subscribe"
          preheader="Recieve emails about the latest updates"
          actions={closeButton}
        />
        <DialogContent>
          <FormField necessity="asterisk">
            <FormFieldLabel> Email </FormFieldLabel>
            <Input defaultValue="Email Address" />
          </FormField>
        </DialogContent>
        <DialogActions>
          <Button appearance="bordered" onClick={handleClose}>
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
