import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
  type StackLayoutProps,
  useId,
  useResponsiveProp,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { type ElementType, type ReactElement, useState } from "react";

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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const closeButton = (
    <Button
      aria-label="Close dialog"
      appearance="transparent"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  const cancel = (
    <Button appearance="bordered" onClick={handleClose}>
      Cancel
    </Button>
  );

  const subscribe = (
    <Button sentiment="accented" onClick={handleClose}>
      Subscribe
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
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {subscribe}
              {cancel}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>
              {cancel}
              {subscribe}
            </FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
