import {
  Button,
  H4,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  StackLayout,
  Text,
  Tooltip,
  useId,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { OverlayHeader } from "@salt-ds/lab";
import type { Meta } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Overlay Header",
} as Meta<typeof Overlay>;

export const Header = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();

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
        aria-labelledby={id}
        style={{
          width: 500,
        }}
      >
        <OverlayHeader header={<H4 id={id}>Header block</H4>} />
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

export const HeaderWithCloseButton = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();

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
        aria-labelledby={id}
        style={{
          width: 500,
        }}
      >
        <OverlayHeader
          preheader="Preheader"
          description="Description"
          header={<H4 id={id}>Header block</H4>}
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
