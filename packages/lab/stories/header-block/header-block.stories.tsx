import {
  Button,
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  StackLayout,
  Tooltip,
  Drawer,
  DrawerCloseButton,
  type DrawerProps,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Header Block",
  component: Dialog,
} as Meta<typeof Dialog>;

export const InDialog: StoryFn<typeof Dialog> = () => {
  const [open, setOpen] = useState(true);

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
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange} id="header-block-dialog">
        <DialogHeader header="Congratulations! You have created a Dialog." />
        <DialogContent>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
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
        <DialogCloseButton onClick={handleClose} />
      </Dialog>
    </>
  );
};

export const InOverlay = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(true);

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleClose = () => setOpen(false);

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby="header-block-overlay">
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent>
          <h3 id="header-block-overlay" className="content-heading">
            Title
          </h3>
          <div>
            Content of Overlay
            <br />
            <br />
            <Tooltip content={"I'm a tooltip"}>
              <Button>hover me</Button>
            </Tooltip>
          </div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const InOverlayWithLongContent = () => {
  const [open, setOpen] = useState(true);

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => setOpen(false);
  return (
    <Overlay placement="right" open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 300,
          height: 200,
          overflow: "auto",
        }}
      >
        <OverlayPanelCloseButton onClick={handleClose} />
        <OverlayPanelContent>
          <StackLayout>
            <div>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </div>
            <div>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const InDrawer: StoryFn<DrawerProps> = (args) => {
  const [openPrimary, setOpenPrimary] = useState(true);

  return (
    <>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        {...args}
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
        id="primary"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenPrimary(false)} />
      </Drawer>
    </>
  );
};
