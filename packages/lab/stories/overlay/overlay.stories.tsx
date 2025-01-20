import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { OverlayHeader } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Overlay Header",
} as Meta<typeof Overlay>;

const HeaderTemplate: StoryFn = ({ onOpenChange, ...props }: OverlayProps) => {
  const [open, setOpen] = useState(false);

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 500,
        }}
      >
        <OverlayHeader header="Header block" {...props} />
        <OverlayPanelContent>
          <StackLayout gap={1}>
            <Text>
              Content of Overlay. Lorem Ipsum is simply dummy text of the
              printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s. When an
              unknown printer took a galley of type and scrambled it to make a
              type specimen book.
            </Text>
            <div>
              <Tooltip content={"I'm a tooltip"}>
                <Button>hover me</Button>
              </Tooltip>
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const Header = HeaderTemplate.bind({});
Header.args = {};

export const LongHeader = HeaderTemplate.bind({});
LongHeader.args = {
  header:
    "Comprehensive guidelines and detailed instructions for the optimal use and application of our services to ensure maximum efficiency and user satisfaction",
  actions: (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
    >
      <CloseIcon aria-hidden />
    </Button>
  ),
};

export const HeaderWithCloseButton = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleClose = () => setOpen(false);

  const CloseButton = () => (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 500,
        }}
      >
        <OverlayHeader
          preheader="Preheader"
          description="Description"
          header="Header block"
          actions={<CloseButton />}
        />
        <OverlayPanelContent>
          <StackLayout gap={1}>
            <Text>
              Content of Overlay. Lorem Ipsum is simply dummy text of the
              printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s. When an
              unknown printer took a galley of type and scrambled it to make a
              type specimen book.
            </Text>
            <div>
              <Tooltip content={"I'm a tooltip"}>
                <Button>hover me</Button>
              </Tooltip>
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
