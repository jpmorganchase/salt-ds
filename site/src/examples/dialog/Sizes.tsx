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

const SmallDialog = (): ReactElement => {
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
    <Button sentiment="accented" onClick={handleClose}>
      Close
    </Button>
  );

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Small Dialog</Button>
      <Dialog open={open} onOpenChange={onOpenChange} size="small" id={id}>
        <DialogHeader header="Small dialog" />
        <DialogContent style={{ height: "2lh" }}>Content area</DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {close}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>{close}</FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

const MediumDialog = (): ReactElement => {
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
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const close = (
    <Button sentiment="accented" onClick={handleClose}>
      Close
    </Button>
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open Medium Dialog
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange} size="medium">
        <DialogHeader header="Medium dialog" />
        <DialogContent style={{ height: "2lh" }}>Content area</DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {close}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>{close}</FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

const LargeDialog = (): ReactElement => {
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
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const close = (
    <Button sentiment="accented" onClick={handleClose}>
      Close
    </Button>
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open Large Dialog
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange} size="large">
        <DialogHeader header="Large dialog" />
        <DialogContent style={{ height: "2lh" }}>Content area</DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {close}
            </StackLayout>
          ) : (
            <FlexLayout gap={1}>{close}</FlexLayout>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export const Sizes = (): ReactElement => {
  return (
    <>
      <SmallDialog />
      <MediumDialog />
      <LargeDialog />
    </>
  );
};
