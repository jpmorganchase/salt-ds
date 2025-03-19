import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

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

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection
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
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
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
            actions={<CloseButton />}
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

export const NoStyleInjectionCloseButton: StoryFn<
  QAContainerNoStyleInjectionProps
> = (props) => {
  return (
    <QAContainerNoStyleInjection
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
          <OverlayHeader
            header="Guidelines for optimal use of our application"
            actions={
              <Button
                aria-label="Close overlay"
                appearance="transparent"
                sentiment="neutral"
              >
                <CloseIcon aria-hidden />
              </Button>
            }
          />
          <OverlayPanelContent>
            <div>Content of Overlay</div>
          </OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </QAContainerNoStyleInjection>
  );
};

NoStyleInjectionCloseButton.parameters = {
  chromatic: { disableSnapshot: false },
};
