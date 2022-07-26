import { Button } from "@jpmorganchase/uitk-core";
import {
  TabDescriptor,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@jpmorganchase/uitk-lab";

export const CloseTabWarningDialog = ({
  closedTab,
  onCancel,
  onClose,
  onConfirm,
  open = false,
}: {
  closedTab: string;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
  open?: boolean;
}) => (
  <Dialog open={open} state="warning" onClose={onClose}>
    <DialogTitle onClose={onClose}>Do you want to close this tab?</DialogTitle>
    <DialogContent>
      {`Closing the tab will cause any changes made to
                  '${closedTab}' to be lost.`}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} variant="cta">
        Close Tab
      </Button>
    </DialogActions>
  </Dialog>
);
