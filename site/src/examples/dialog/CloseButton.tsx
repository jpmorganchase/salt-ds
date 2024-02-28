import { ReactElement, useState } from "react";
import { Button, H3, StackLayout, useId } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogCloseButton,
} from "@salt-ds/lab";

export const CloseButton = (): ReactElement => {
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
      <Button onClick={handleRequestOpen}>Open dialog with close button</Button>
      <Dialog open={open} onOpenChange={onOpenChange} id={id}>
        <DialogTitle title="Terms and conditions" />
        <DialogContent>
          <StackLayout>
            <div>
              When you add a Chase Card to a Wallet, you agree to these Terms:
            </div>
            <H3>Adding Your Chase Card</H3>
            <div>
              You can add an eligible Chase Card to a Wallet by either following
              our instructions as they appear on a Chase proprietary platform
              (e.g., Chase Mobile® app or chase.com) or by following the
              instructions of the Wallet provider. Only Chase Cards that we
              determine are eligible can be added to the Wallet.
            </div>
            <div>
              If your Chase Card or underlying account is not in good standing,
              that Chase Card will not be eligible to be added to or enrolled in
              the Wallet. We may determine other eligibility criteria in our
              sole discretion.
            </div>
            When you add a Chase Card to a Wallet, the Wallet may allow you to
            (a) use the Chase Card to (i) enable transfers of money between you
            and others who are enrolled with the Wallet provider or a partner of
            such Wallet provider, and/or (ii) enter into transactions where the
            Wallet is accepted, including the ability to use the Chase Card to
            complete transactions at participating merchants' physical
            locations, e-commerce locations, and at ATMs; and (b) use other
            services that are described in the Wallet provider's agreement or
            that they may offer from time to time. The Wallet may not be
            accepted at all places where your Chase Card is accepted.
            <div>
              We reserve the right to terminate our participation in a Wallet or
              with a Wallet provider at any time and the right to designate a
              maximum number of Chase Cards that may be added to a Wallet.
            </div>
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Accept
          </Button>
        </DialogActions>
        <DialogCloseButton onClick={handleClose} />
      </Dialog>
    </>
  );
};
