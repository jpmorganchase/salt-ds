import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "../../../src";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const AccountCreatedDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmationDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={onOpenChange}
    size="small"
    status="success"
    initialFocus={0}
  >
    <DialogHeader header="Account created" />
    <DialogContent>You can now start using this new account.</DialogContent>
    <DialogActions>
      <Button sentiment="accented" onClick={onConfirm}>
        Done
      </Button>
    </DialogActions>
  </Dialog>
);
