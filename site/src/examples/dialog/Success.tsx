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
              Go to file
            </Button>
          </StackLayout>
        </DialogActions>
      </Dialog>
    </>
  );
};
