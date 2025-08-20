import {
  Button,
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  type DialogContentProps,
  DialogContext,
  DialogHeader,
  type DialogProps,
  SaltProvider,
  SaltProviderNext,
  StackLayout,
  useTheme,
  VALIDATION_NAMED_STATUS,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import "./dialog.stories.css";
import { CloseIcon } from "@salt-ds/icons";
import { Fragment } from "react";

export default {
  title: "Core/Dialog/Dialog QA",
  component: Dialog,
} as Meta<typeof Dialog>;

function FakeDialog({ children, status, id }: DialogProps) {
  return (
    <DialogContext.Provider value={{ status, id }}>
      <div className="fakeDialogWindow">{children}</div>
    </DialogContext.Provider>
  );
}

const DialogTemplate: StoryFn<
  Omit<DialogProps, "content"> & {
    header?: string;
    preheader?: string;
    content?: DialogContentProps["children"];
    longDialog?: boolean;
    maxHeight?: number;
  }
> = ({ status, header, content, longDialog, maxHeight = 420 }) => {
  const defaultHeader = "Congratulations! You have created a Dialog.";
  const defaultContent =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";
  return (
    <div style={{ width: 1000, maxHeight: maxHeight, padding: "0 200px" }}>
      <FakeDialog status={status} open>
        <DialogHeader header={header ?? defaultHeader} />
        <DialogContent className={longDialog ? "longDialog" : ""}>
          {content ?? defaultContent}
        </DialogContent>
        <DialogActions>
          <Button style={{ marginRight: "auto" }} appearance="transparent">
            Cancel
          </Button>
          <Button>Previous</Button>
          <Button sentiment="accented" appearance="solid">
            Next
          </Button>
        </DialogActions>
      </FakeDialog>
    </div>
  );
};

export const DeprecatedClosedButton: StoryFn = () => {
  return (
    <StackLayout gap={1}>
      <Dialog open={true}>
        <DialogHeader header="Header" />
        <DialogContent>Dialog content</DialogContent>
        <DialogActions>
          <Button appearance="transparent">Cancel</Button>
          <Button>Previous</Button>
          <Button sentiment="accented">Next</Button>
        </DialogActions>
        <DialogCloseButton />
      </Dialog>
    </StackLayout>
  );
};

DeprecatedClosedButton.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

export const StatusVariants: StoryFn = () => {
  const DensityValues = ["high", "medium", "low", "touch"] as const;
  const { themeNext } = useTheme();
  const ChosenProvider = themeNext ? SaltProviderNext : SaltProvider;
  return (
    <StackLayout gap={1}>
      {DensityValues.map((density) => {
        return (
          <Fragment key={density}>
            <ChosenProvider density={density}>
              <DialogTemplate />
            </ChosenProvider>
            <ChosenProvider density={density} mode="dark">
              <DialogTemplate />
            </ChosenProvider>
            {VALIDATION_NAMED_STATUS.map((status) => (
              <Fragment key={status}>
                <ChosenProvider density={density}>
                  <DialogTemplate status={status} />
                </ChosenProvider>
                <ChosenProvider density={density} mode="dark">
                  <DialogTemplate status={status} />
                </ChosenProvider>
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </StackLayout>
  );
};

StatusVariants.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

export const ContentVariants: StoryFn = () => {
  const { themeNext } = useTheme();
  const ChosenProvider = themeNext ? SaltProviderNext : SaltProvider;

  const DensityValues = ["high", "medium", "low", "touch"] as const;
  const longContent = (
    <StackLayout style={{ maxHeight: 180 }}>
      <div>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </div>
      <div>
        It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularised in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software
        like Aldus PageMaker including versions of Lorem Ipsum.
      </div>
      <div>
        It is a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of
        letters, as opposed to using 'Content here, content here', making it
        look like readable English.
      </div>
      <div>
        Many desktop publishing packages and web page editors now use Lorem
        Ipsum as their default model text, and a search for 'lorem ipsum' will
        uncover many web sites still in their infancy. Various versions have
        evolved over the years, sometimes by accident, sometimes on purpose
        (injected humour and the like).
      </div>
      <div>
        Contrary to popular belief, Lorem Ipsum is not simply random text. It
        has roots in a piece of classical Latin literature from 45 BC, making it
        over 2000 years old. Richard McClintock, a Latin professor at
        Hampden-Sydney College in Virginia, looked up one of the more obscure
        Latin words, consectetur, from a Lorem Ipsum passage, and going through
        the cites of the word in classical literature, discovered the
        undoubtable source.
      </div>
      <div>
        Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
        Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written
        in 45 BC. This book is a treatise on the theory of ethics, very popular
        during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum
        dolor sit amet..", comes from a line in section 1.10.32.
      </div>
    </StackLayout>
  );
  return (
    <StackLayout style={{ width: 1200, height: 380 }} gap={1}>
      {DensityValues.map((density) => (
        <Fragment key={density}>
          <ChosenProvider density={density}>
            <DialogTemplate content={longContent} maxHeight={500} />
          </ChosenProvider>
          <ChosenProvider density={density} mode="dark">
            <DialogTemplate content={longContent} maxHeight={500} />
          </ChosenProvider>
          <ChosenProvider density={density}>
            <DialogTemplate longDialog maxHeight={500} />
          </ChosenProvider>
          <ChosenProvider density={density} mode="dark">
            <DialogTemplate longDialog maxHeight={500} />
          </ChosenProvider>
        </Fragment>
      ))}
    </StackLayout>
  );
};

ContentVariants.parameters = {
  chromatic: {
    disableSnapshot: false,
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
      style={{
        width: 600,
      }}
      header="Terms and conditions"
      preheader="Ensure you read and agree to these Terms"
      description="Effective date: August 29, 2024"
    />
    <DialogHeader
      status="info"
      header="Terms and conditions"
      style={{
        width: 600,
      }}
    />
    <DialogHeader
      actions={
        <Button aria-label="Close dialog" appearance="transparent">
          <CloseIcon aria-hidden />
        </Button>
      }
      status="info"
      style={{
        width: 600,
      }}
      header="Terms and conditions"
    />
    <DialogHeader
      actions={
        <Button aria-label="Close dialog" appearance="transparent">
          <CloseIcon aria-hidden />
        </Button>
      }
      status="info"
      style={{
        width: 600,
      }}
      header="Complete terms and conditions for using the services provided by our company"
    />
  </QAContainer>
);
DialogHeaders.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
