import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  H2,
  NavigationItem,
  ParentChildLayout,
  SplitLayout,
  StackLayout,
  Step,
  Stepper,
  useId,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

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

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Small Dialog</Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="small"
        status="warning"
        id={id}
      >
        <DialogHeader disableAccent header="Reset grid settings?" />
        <DialogContent>
          Are you sure you want to reset all grid data? Any previous settings
          will not be saved
        </DialogContent>
        <DialogActions>
          <Button appearance="bordered" onClick={handleClose}>
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AccountView = () => {
  return <>Account View</>;
};

const GenralView = () => {
  return <>General View</>;
};

const GridView = () => {
  return <>Grid View</>;
};

const ExportView = () => {
  return <>Export View</>;
};

const items = [
  { label: "Account", view: AccountView },
  { label: "General", view: GenralView },
  { label: "Grid", view: GridView },
  { label: "Export", view: ExportView },
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

  const parent = (
    <nav
      style={{
        borderRight:
          "var(--salt-borderStyle-solid) var(--salt-separable-tertiary-borderColor) var(--salt-size-fixed-100)",
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
          <li key={item.label}>
            <NavigationItem
              active={active === item}
              href="#"
              orientation="vertical"
              onClick={(event) => {
                event.preventDefault();
                setActive(item);
              }}
            >
              {item.label}
            </NavigationItem>
          </li>
        ))}
      </StackLayout>
    </nav>
  );

  const child = (
    <StackLayout
      direction="column"
      style={{ paddingLeft: "var(--salt-spacing-200)" }}
    >
      <H2>{active.label}</H2>
      {active.view?.()}
    </StackLayout>
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open Medium Dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="medium"
        aria-labelledby="preferences-dialog"
      >
        <DialogHeader header="Preferences" disableAccent />
        <DialogContent>
          <StackLayout direction="row">
            <ParentChildLayout parent={parent} child={child} />
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button appearance="bordered" onClick={handleClose}>
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
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
        size="large"
        aria-labelledby="wizard-dialog"
      >
        <SplitLayout
          align="center"
          startItem={
            <DialogHeader
              header="Add a Beneficiary"
              preheader="Customize your Experience"
            />
          }
          endItem={
            <Stepper style={{ width: "400px" }}>
              <Step label="Beneficiary" stage="active" />
              <Step label="Amount" />
              <Step label="Account" />
              <Step label="Delivery" />
            </Stepper>
          }
        />

        <DialogContent
          style={{
            height: "548px",
            border:
              "var(--salt-borderStyle-solid) var(--salt-separable-tertiary-borderColor) var(--salt-size-fixed-100)",
            padding: "var(--salt-spacing-100)",
          }}
        >
          Wizard Content Area
        </DialogContent>
        <DialogActions>
          <Button
            appearance="bordered"
            onClick={handleClose}
            style={{ marginRight: "auto" }}
          >
            Cancel
          </Button>
          <Button sentiment="accented" onClick={handleClose}>
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
