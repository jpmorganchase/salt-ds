import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";
import { CloseIcon } from "@salt-ds/icons";

export default {
  title: "Core/Overlay/Overlay QA",
  component: Overlay,
} as Meta<typeof Overlay>;

export const Default: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Overlay open>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>
          <OverlayHeader header="Title" />
          <OverlayPanelContent>
            <div>Content of Overlay</div>
          </OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CloseButton: StoryFn<QAContainerProps> = (props) => {
  const CloseButton = () => (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
    >
      <CloseIcon aria-hidden />
    </Button>
  );
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Overlay open>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel>
          <OverlayHeader header="Title" actions={<CloseButton />} />
          <OverlayPanelContent>
            <div>Content of Overlay</div>
          </OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </QAContainer>
  );
};

CloseButton.parameters = {
  chromatic: { disableSnapshot: false },
};
