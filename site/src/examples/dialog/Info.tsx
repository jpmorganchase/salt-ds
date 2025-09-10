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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const close = (
    <Button appearance="bordered" sentiment="accented" onClick={handleClose}>
      Close
    </Button>
  );

  const seeUpdates = (
    <Button sentiment="accented" onClick={handleClose}>
      See updates
    </Button>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open info dialog</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        status="info"
        size="small"
        id={id}
      >
        <DialogHeader header="File update" />
        <DialogContent>
          A new version of this file is available with 26 updates.
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {seeUpdates}
              {close}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>
              {close}
              {seeUpdates}
            </FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
