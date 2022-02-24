import { useRef, useState } from "react";
import { Button, useDensity } from "@brandname/core";
import {
  ButtonBar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  OrderedButton,
} from "@brandname/lab";

import "./dialog.stories.css";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
  title: "Lab/Dialog",
  component: Dialog,
} as ComponentMeta<typeof Dialog>;

const densityDialogWidths = {
  touch: 640,
  low: 600,
  medium: 500,
  high: 500,
};

const DialogTemplate: ComponentStory<typeof Dialog> = (args) => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const density = useDensity();

  const densityBreakpoint = density === "touch" ? "xl" : "xs";

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        width={densityDialogWidths[density]}
        {...args}
      >
        <DialogTitle>Congratulations! You have created a Dialog.</DialogTitle>
        <DialogContent>This is a dialog</DialogContent>
        <DialogActions>
          <ButtonBar
            className={`DialogButtonBar-${density}Density`}
            stackAtBreakpoint={densityBreakpoint}
          >
            <OrderedButton variant="cta" onClick={handleClose}>
              CTA BUTTON
            </OrderedButton>
            <OrderedButton style={{ cursor: "pointer" }} onClick={handleClose}>
              REGULAR BUTTON
            </OrderedButton>
            <OrderedButton
              className="DialogButton"
              variant="secondary"
              onClick={handleClose}
            >
              SECONDARY BUTTON
            </OrderedButton>
          </ButtonBar>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const BasicDialog = DialogTemplate.bind({});

export const InfoDialog = DialogTemplate.bind({});

InfoDialog.args = {
  state: "info",
};

export const WarningDialog = DialogTemplate.bind({});
WarningDialog.args = {
  state: "warning",
};

export const CloseDialog: ComponentStory<typeof Dialog> = () => {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const density = useDensity();

  // Comment out the ButtonBar references until we have ButtonBar in the repo
  const densityBreakpoint = density === "touch" ? "xl" : "xs";

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleOpen}>
        Click to open dialog
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        width={densityDialogWidths[density]}
      >
        <DialogTitle ref={headerRef} onClose={handleClose}>
          Congratulations! You have created a Dialog.
        </DialogTitle>
        <DialogContent>
          If you delete this file, you won’t be able to recover it again. Are
          you sure you want to delete it?
        </DialogContent>
        <DialogActions>
          <ButtonBar
            className={`DialogButtonBar-${density}Density`}
            stackAtBreakpoint={densityBreakpoint}
          >
            <OrderedButton variant="cta">CTA BUTTON</OrderedButton>
            <OrderedButton style={{ cursor: "pointer" }}>
              REGULAR BUTTON
            </OrderedButton>
            <OrderedButton
              className="DialogButtonBar-secondary"
              variant="secondary"
            >
              SECONDARY BUTTON
            </OrderedButton>
          </ButtonBar>
        </DialogActions>
      </Dialog>
    </>
  );
};
export const DialogAlignTop: ComponentStory<typeof Dialog> = () => {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const density = useDensity();

  // Comment out the ButtonBar references until we have ButtonBar in the repo
  const densityBreakpoint = density === "touch" ? "xl" : "xs";

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleOpen}>
        Click to open dialog
      </Button>
      <Dialog
        className="Dialog-alignTop"
        open={open}
        onClose={handleClose}
        width={densityDialogWidths[density]}
      >
        <DialogTitle ref={headerRef} onClose={handleClose}>
          Congratulations! You have created a Dialog.{" "}
        </DialogTitle>
        <DialogContent>
          If you delete this file, you won’t be able to recover it again. Are
          you sure you want to delete it?
        </DialogContent>
        <DialogActions>
          <ButtonBar
            className={`DialogButtonBar-${density}Density`}
            stackAtBreakpoint={densityBreakpoint}
          >
            <OrderedButton variant="cta">CTA BUTTON</OrderedButton>
            <OrderedButton style={{ cursor: "pointer" }}>
              REGULAR BUTTON
            </OrderedButton>
            <OrderedButton
              className="DialogButtonBar-secondary"
              variant="secondary"
            >
              SECONDARY BUTTON
            </OrderedButton>
          </ButtonBar>
        </DialogActions>
      </Dialog>
    </>
  );
};
