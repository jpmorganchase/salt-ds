import {
  Button,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { OverlayHeader } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Overlay Header/Overlay Header QA",
  component: Overlay,
} as Meta<typeof Overlay>;

export const Default: StoryFn<QAContainerProps> = (props) => {
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
      cols={1}
      itemPadding={80}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <Overlay open>
        <OverlayTrigger>
          <Button>Show Overlay</Button>
        </OverlayTrigger>
        <OverlayPanel
          style={{
            width: "30ch",
          }}
        >
          <OverlayHeader
            preheader="Preheader"
            description="Description"
            header="Guidelines for optimal use of our application"
            actions={<CloseButton />}
          />
          <OverlayPanelContent>
            <div>Content of Overlay</div>
          </OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
