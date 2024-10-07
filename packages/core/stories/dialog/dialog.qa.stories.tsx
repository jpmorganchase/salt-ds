import {
  Button,
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  type DialogProps,
  FlowLayout,
  SaltProvider,
  ownerWindow,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import "./dialog.stories.css";
import font300iCss from "@fontsource/open-sans/300-italic.css";
import font300Css from "@fontsource/open-sans/300.css";
import font400iCss from "@fontsource/open-sans/400-italic.css";
import font400Css from "@fontsource/open-sans/400.css";
import font500iCss from "@fontsource/open-sans/500-italic.css";
import font500Css from "@fontsource/open-sans/500.css";
import font600iCss from "@fontsource/open-sans/600-italic.css";
import font600Css from "@fontsource/open-sans/600.css";
import font700iCss from "@fontsource/open-sans/700-italic.css";
import font700Css from "@fontsource/open-sans/700.css";
import font800iCss from "@fontsource/open-sans/800-italic.css";
import font800Css from "@fontsource/open-sans/800.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import themeCss from "@salt-ds/theme/index.css";
import { WindowProvider, useWindow } from "@salt-ds/window";
import { Fragment, type ReactNode, useCallback, useState } from "react";
import { createPortal } from "react-dom";

const StyleInjection = () => {
  const targetWindow = useWindow();

  useComponentCssInjection({ css: themeCss, window: targetWindow });
  useComponentCssInjection({ css: font300Css, window: targetWindow });
  useComponentCssInjection({ css: font300iCss, window: targetWindow });
  useComponentCssInjection({ css: font400Css, window: targetWindow });
  useComponentCssInjection({ css: font400iCss, window: targetWindow });
  useComponentCssInjection({ css: font500Css, window: targetWindow });
  useComponentCssInjection({ css: font500iCss, window: targetWindow });
  useComponentCssInjection({ css: font600Css, window: targetWindow });
  useComponentCssInjection({ css: font600iCss, window: targetWindow });
  useComponentCssInjection({ css: font700Css, window: targetWindow });
  useComponentCssInjection({ css: font700iCss, window: targetWindow });
  useComponentCssInjection({ css: font800Css, window: targetWindow });
  useComponentCssInjection({ css: font800iCss, window: targetWindow });

  return null;
};

export default {
  title: "Core/Dialog/QA",
  component: Dialog,
} as Meta<typeof Dialog>;

const DialogTemplate: StoryFn<DialogProps & { header: string }> = ({
  status,
  header,
}) => {
  return (
    <Dialog status={status} open>
      <DialogHeader header={header} />
      <DialogContent>This is dialog content...</DialogContent>
      <DialogActions>
        <Button style={{ marginRight: "auto" }} appearance="transparent">
          Cancel
        </Button>
        <Button>Previous</Button>
        <Button sentiment="accented" appearance="transparent">
          Next
        </Button>
      </DialogActions>
      <DialogCloseButton />
    </Dialog>
  );
};

function FakeWindow({
  children,
  title,
}: {
  children?: ReactNode;
  title: string;
}) {
  const [mountNode, setMountNode] = useState<HTMLElement | undefined>(
    undefined,
  );

  const handleFrameRef = useCallback((node: HTMLIFrameElement) => {
    setMountNode(node?.contentWindow?.document?.body);
  }, []);

  return (
    <iframe
      ref={handleFrameRef}
      title={title}
      style={{
        border: "none",
        width: 1200,
        height: 380,
      }}
    >
      <WindowProvider window={ownerWindow(mountNode)}>
        <StyleInjection />
        <SaltProvider applyClassesTo="root">
          {mountNode && createPortal(children, mountNode)}
        </SaltProvider>
      </WindowProvider>
    </iframe>
  );
}

export const StatusVariants: StoryFn<QAContainerProps> = () => {
  const DensityValues = ["high", "medium", "low", "touch"] as const;
  return (
    <FlowLayout gap={0}>
      {DensityValues.map((density) => {
        return (
          <Fragment key={density}>
            <FakeWindow title={`dialog ${density} example`}>
              <Button>Test button</Button>
              <DialogTemplate header={"hello"} />
            </FakeWindow>
          </Fragment>
        );
      })}
    </FlowLayout>
  );
};

StatusVariants.parameters = {
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

export const DialogHeaders: StoryFn<QAContainerProps> = () => (
  <QAContainer height={600} cols={1} itemPadding={5} width={1200}>
    <DialogHeader
      header="Terms and conditions"
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      style={{
        width: 600,
      }}
      header="Terms and conditions"
      preheader="Ensure you read and agree to these Terms"
    />
    <DialogHeader
      status="info"
      header="Terms and conditions"
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      status="info"
      style={{
        width: 600,
      }}
      header="Terms and conditions"
      preheader="Ensure you read and agree to these Terms"
    />
  </QAContainer>
);
DialogHeaders.parameters = {
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
