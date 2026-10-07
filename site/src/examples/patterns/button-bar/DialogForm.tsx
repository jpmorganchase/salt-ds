import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FlexItem,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  useResponsiveProp,
} from "@salt-ds/core";
import { type ElementType, useState } from "react";
import { formFields } from "./SingleStepForm";

export const DialogForm = () => {
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

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const save = (
    <FlexItem>
      <Button
        variant="secondary"
        onClick={handleClose}
        style={{ width: "100%" }}
      >
        Save as draft
      </Button>
    </FlexItem>
  );
  const cancel = (
    <FlexItem>
      <Button
        appearance="bordered"
        onClick={handleClose}
        style={{ width: "100%" }}
      >
        Cancel
      </Button>
    </FlexItem>
  );

  const submit = (
    <FlexItem>
      <Button
        sentiment="accented"
        onClick={handleClose}
        style={{ width: "100%" }}
      >
        Submit
      </Button>
    </FlexItem>
  );

  const endItem = (
    <StackLayout direction={{ xs: "column", sm: "row" }} gap={1}>
      {cancel}
      {submit}
    </StackLayout>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open default dialog</Button>
      <Dialog
        aria-label="Form"
        open={open}
        onOpenChange={onOpenChange}
        style={{ width: "378px" }}
      >
        <DialogContent>{formFields}</DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {submit}
              {cancel}
              {save}
            </StackLayout>
          ) : (
            <SplitLayout
              direction={"row"}
              startItem={save}
              endItem={endItem}
              style={{ width: "100%" }}
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
