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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const cancel = (
    <Button appearance="bordered" sentiment="accented" onClick={handleClose}>
      Cancel
    </Button>
  );

  const deleteAction = (
    <Button sentiment="accented" onClick={handleClose}>
      Delete
    </Button>
  );

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
          Are you sure you want to permanently delete transaction?
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {deleteAction}
              {cancel}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>
              {cancel}
              {deleteAction}
            </FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
