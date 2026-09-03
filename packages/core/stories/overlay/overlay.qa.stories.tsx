import {
  Button,
  Overlay,
  OverlayFooter,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { CSSProperties } from "react";

import "./overlay.stories.css";
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
          <OverlayPanelContent>
            <h3 className="content-heading">Title</h3>
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
  },
};

export const CloseButton: StoryFn<QAContainerProps> = (props) => {
  const closeButton = (
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
            header="Guidelines for optimal use of our application"
            actions={closeButton}
          />
          <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </QAContainer>
  );
};

CloseButton.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

const footerFrameStyle = {
  alignItems: "flex-end",
  blockSize: 360,
  display: "flex",
  inlineSize: 360,
  justifyContent: "center",
} satisfies CSSProperties;

export const WithFooter: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height="auto"
      itemWidthAuto
      transposeDensity
      vertical
      {...props}
    >
      <div style={footerFrameStyle}>
        <Overlay open>
          <OverlayTrigger>
            <Button>Show Overlay</Button>
          </OverlayTrigger>
          <OverlayPanel style={{ width: 320 }}>
            <OverlayHeader header="Review changes" />
            <OverlayPanelContent style={{ height: 120 }}>
              <StackLayout>
                <Text>
                  Review the account updates before saving. The footer remains
                  available while this content scrolls.
                </Text>
                <Text>
                  Contact details, notification preferences, and security
                  settings will be updated when you save.
                </Text>
                <Text>
                  You can cancel to close the overlay without applying these
                  changes.
                </Text>
              </StackLayout>
            </OverlayPanelContent>
            <OverlayFooter>
              <Button appearance="bordered">Cancel</Button>
              <Button>Save changes</Button>
            </OverlayFooter>
          </OverlayPanel>
        </Overlay>
      </div>
    </QAContainer>
  );
};

WithFooter.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

export const DeprecatedCloseButton: StoryFn<QAContainerProps> = (props) => {
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
          <OverlayPanelCloseButton />
          <OverlayHeader header="Guidelines for optimal use of our application" />
          <OverlayPanelContent>Content of Overlay</OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </QAContainer>
  );
};

DeprecatedCloseButton.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

const HideArrowTemplate: StoryFn<typeof Overlay> = (args) => (
  <Overlay hideArrow open {...args}>
    <OverlayTrigger>
      <Button>Show Overlay</Button>
    </OverlayTrigger>
    <OverlayPanel>
      <OverlayPanelContent>
        <h3 className="content-heading">Title</h3>
        <div>Content of Overlay</div>
      </OverlayPanelContent>
    </OverlayPanel>
  </Overlay>
);

export const HideArrow: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      itemPadding={100}
      itemWidthAuto
      vertical
      width={1200}
      {...props}
    >
      <HideArrowTemplate placement="top" />
      <HideArrowTemplate placement="right" />
      <HideArrowTemplate placement="bottom" />
      <HideArrowTemplate placement="left" />
    </QAContainer>
  );
};

HideArrow.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
