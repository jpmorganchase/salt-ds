import { Button } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TabDescriptor,
} from "@salt-ds/lab";

export const CloseTabWarningDialog = ({
  closedTab,
  onCancel,
  onClose,
  onConfirm,
  open = false,
}: {
  closedTab: TabDescriptor;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  open?: boolean;
}) => (
  <Dialog
    open={open}
    status="warning"
    onOpenChange={(value) => {
      if (!value) {
        onClose();
      }
    }}
  >
    <DialogTitle title="Do you want to close this tab?" />

    <DialogContent>
      {`Closing the tab will cause any changes made to
                  '${closedTab.label}' to be lost.`}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} variant="cta">
        Close Tab
      </Button>
    </DialogActions>
  </Dialog>
);
