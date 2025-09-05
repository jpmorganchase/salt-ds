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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const cancel = (
    <Button appearance="bordered" onClick={handleClose}>
      Cancel
    </Button>
  );

  const giveAccess = (
    <Button sentiment="accented" onClick={handleClose}>
      Give access
    </Button>
  );

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
        <DialogHeader header="File access" />

        <DialogContent>
          Users will be able to make edits and modify Trades 2023 file. Give
          access anyway?
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {giveAccess}
              {cancel}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>
              {cancel}
              {giveAccess}
            </FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
