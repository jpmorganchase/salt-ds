import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { HeaderBlock } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const InDialogWithLongContent = (): ReactElement => {
  const [open, setOpen] = useState(true);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        id="header-block-dialog"
      >
        <HeaderBlock
          accent={true}
          preheader="Account conversation"
          header="Edit details"
          onClose={handleClose}
        />
        <DialogContent>
          <StackLayout gap={1}>
            <Text>
              A global leader, we deliver strategic advice and solutions,
              including capital raising, risk management, and trade finance to
              corporations, institutions and governments. A global leader, we
              deliver strategic advice and solutions, including capitai raising,
              risk management, and trade finance to corporations, institutions
              and governments. A global leader, we deliver strategic advice and
              solutions, including capital raising, risk management, and trade
              finance to corporations, institutions and governments.
            </Text>
            <Text>
              A global leader, we deliver strategic advice and solutions,
              including capital raising, risk management, and trade finance to
              corporations, institutions and governments. A global leader, we
              deliver strategic advice and solutions, including capital raising,
              risk management, and trade finance to corporations, institutions
              and governments. A global leader, we deliver strategic advice and
              solutions, including capital raising, risk management, and trade
              finance to corporations, institutions and governments. A global
              leader, we deliver strategic advice and solutions, including
              capital raising, risk management, and trade finance to
              corporations, institutions and governments.
            </Text>
            <Text>Markets</Text>
            <Text>
              Serving the world's largest corporate clients and institutional
              investors, we support the investment cycle with market-leading
              research, analytics and trade execution across multiple asset
              classes.
            </Text>
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose}>Previous</Button>
          <Button variant="cta" onClick={handleClose}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
