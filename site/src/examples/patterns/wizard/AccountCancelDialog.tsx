import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  StackLayout,
  type StackLayoutProps,
  useResponsiveProp,
} from "@salt-ds/core";
import type { ElementType } from "react";
import type { ConfirmationDialogProps } from "./AccountCreatedDialog";

export const AccountCancelDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmationDialogProps) => {
  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const no = (
    <Button
      appearance="bordered"
      sentiment="accented"
      onClick={() => onOpenChange(false)}
    >
      No
    </Button>
  );

  const yes = (
    <Button sentiment="accented" onClick={onConfirm}>
      Yes
    </Button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      status="warning"
      size="small"
    >
      <DialogHeader header="Are you sure you want to cancel" />
      <DialogContent>
        Any updates you've made so far will be lost after you confirm
        cancellation.
      </DialogContent>
      <DialogActions>
        {direction === "column" ? (
          <StackLayout gap={1} style={{ width: "100%" }}>
            {yes}
            {no}
          </StackLayout>
        ) : (
          <FlexLayout gap={1}>
            {no}
            {yes}
          </FlexLayout>
        )}
      </DialogActions>
    </Dialog>
  );
};
