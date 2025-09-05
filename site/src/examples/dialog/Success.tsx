import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  StackLayout,
  type StackLayoutProps,
  useId,
  useResponsiveProp,
} from "@salt-ds/core";
import { type ElementType, type ReactElement, useState } from "react";

export const Success = (): ReactElement => {
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

  const close = (
    <Button appearance="bordered" onClick={handleClose}>
      Close
    </Button>
  );

  const file = (
    <Button sentiment="accented" onClick={handleClose}>
      Go to file
    </Button>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open success dialog</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status="success"
        size="small"
        id={id}
      >
        <DialogHeader header="File uploaded" />
        <DialogContent>
          File has been successfully uploaded to the shared drive.
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {file}
              {close}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>
              {close}
              {file}
            </FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
