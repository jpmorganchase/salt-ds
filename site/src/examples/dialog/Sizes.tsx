import { ReactElement, useState } from "react";
import { Button, StackLayout, NavigationItem } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  SteppedTracker,
  TrackerStep,
  StepLabel,
} from "@salt-ds/lab";

const SmallDialog = (): ReactElement => {
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

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open Small Dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        size={"small"}
        status={"warning"}
        aria-describedby={`dialog-description`}
      >
        <DialogTitle disableAccent>Reset grid settings?</DialogTitle>
        <DialogContent>
          Are you sure you want to reset all grid data? Any previous settings
          will not be saved
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const items = [
  { heading: "Account", content: "Account" },
  { heading: "General", content: "General" },
  { heading: "Grid", content: "Grid" },
  { heading: "Export", content: "Export" },
];

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

  const [active, setActive] = useState(items[0]);

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open Medium Dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        size={"medium"}
        aria-describedby={`dialog-description`}
      >
        <DialogTitle disableAccent>Preferences</DialogTitle>
        <DialogContent>
          <StackLayout direction={"row"}>
            <nav
              style={{
                borderRight:
                  "var(--salt-container-borderStyle) var(--salt-separable-tertiary-borderColor) var(--salt-size-border)",
              }}
            >
              <StackLayout
                as="ul"
                gap={1}
                style={{
                  listStyle: "none",
                }}
              >
                {items.map((item) => (
                  <li key={item.heading}>
                    <NavigationItem
                      active={active === item}
                      href="#"
                      orientation="vertical"
                      onClick={() => {
                        setActive(item);
                      }}
                    >
                      {item.heading}
                    </NavigationItem>
                  </li>
                ))}
              </StackLayout>
            </nav>
            {items[0].heading}
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Save
          </Button>
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

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open Large Dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        size={"medium"}
        aria-describedby={`dialog-description`}
      >
        <DialogTitle>
          <div style={{ flexGrow: 1 }}>Add a Beneficiary</div>
          <SteppedTracker activeStep={0} style={{ width: "400px" }}>
            <TrackerStep>
              <StepLabel>Beneficiary</StepLabel>
            </TrackerStep>
            <TrackerStep>
              <StepLabel>Amount</StepLabel>
            </TrackerStep>
            <TrackerStep>
              <StepLabel>Account</StepLabel>
            </TrackerStep>
            <TrackerStep>
              <StepLabel>Delivery</StepLabel>
            </TrackerStep>
          </SteppedTracker>
        </DialogTitle>

        <DialogContent
          style={{
            height: "548px",
            border:
              "var(--salt-container-borderStyle) var(--salt-separable-tertiary-borderColor) var(--salt-size-border)",
            padding: "var(--salt-spacing-100)",
          }}
        >
          Wizard Content Area
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="cta" onClick={handleClose}>
            Next
          </Button>
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
