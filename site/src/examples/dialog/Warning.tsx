import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  StackLayout,
  useId,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

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
        <DialogHeader header="File access" />

        <DialogContent>
          Users will be able to make edits and modify Trades 2023 file. Give
          access anyway?
        </DialogContent>
        <DialogActions>
          <StackLayout
            gap={1}
            direction={{
              xs: "column-reverse",
              sm: "row",
            }}
            style={{ width: "100%", justifyContent: "flex-end" }}
          >
            <Button appearance="bordered" onClick={handleClose}>
              Cancel
            </Button>
            <Button sentiment="accented" onClick={handleClose}>
              Give access
            </Button>
          </StackLayout>
        </DialogActions>
      </Dialog>
    </>
  );
};
