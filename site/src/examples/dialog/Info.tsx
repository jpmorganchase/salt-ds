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
          <StackLayout
            gap={1}
            direction={{
              xs: "column-reverse",
              sm: "row",
            }}
            style={{ width: "100%", justifyContent: "flex-end" }}
          >
            <Button appearance="bordered" onClick={handleClose}>
              Close
            </Button>
            <Button sentiment="accented" onClick={handleClose}>
              See updates
            </Button>
          </StackLayout>
        </DialogActions>
      </Dialog>
    </>
  );
};
