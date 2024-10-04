import {
  Button,
  Dialog,
  DialogActions,
  DialogCloseButton,
  DialogContent,
  DialogContext,
  DialogHeader,
  type DialogProps,
  FormField,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import "./dialog.stories.css";

function FakeDialog({ children, status, id }: DialogProps) {
  return (
    <DialogContext.Provider value={{ status, id }}>
      <div className="fakeDialogWindow">{children}</div>
    </DialogContext.Provider>
  );
}

function FakeLongDialog({ children, status, id }: DialogProps) {
  return (
    <DialogContext.Provider value={{ status, id }}>
      <div
        className="fakeDialogWindow longDialog"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>
    </DialogContext.Provider>
  );
}

export default {
  title: "Core/Dialog/QA",
  component: Dialog,
} as Meta<typeof Dialog>;

const DialogTemplate: StoryFn<DialogProps & { header: string }> = ({
  open: openProp = true,
  status,
  header,
}) => {
  return (
    <StackLayout>
      <FakeDialog status={status}>
        <DialogHeader header={header} />
        <DialogContent>This is dialog content...</DialogContent>
        <DialogActions>
          <Button style={{ marginRight: "auto" }} variant="secondary">
            Cancel
          </Button>
          <Button>Previous</Button>
          <Button variant="cta">Next</Button>
        </DialogActions>
        <DialogCloseButton />
      </FakeDialog>
    </StackLayout>
  );
};

export const Default: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} {...rest}>
      <DialogTemplate header={"Dialog Title"} />
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false },
};

export const LongContent: StoryFn<QAContainerProps> = () => {
  return (
    <QAContainer width={1300} itemPadding={3}>
      <FakeDialog>
        <DialogHeader
          header="Congratulations! You have created a Dialog."
          style={{ width: "500px" }}
        />

        <DialogContent style={{ height: "500px" }}>
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
            <div>
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The
              point of using Lorem Ipsum is that it has a more-or-less normal
              distribution of letters, as opposed to using 'Content here,
              content here', making it look like readable English.
            </div>
            <div>
              Many desktop publishing packages and web page editors now use
              Lorem Ipsum as their default model text, and a search for 'lorem
              ipsum' will uncover many web sites still in their infancy. Various
              versions have evolved over the years, sometimes by accident,
              sometimes on purpose (injected humour and the like).
            </div>
            <div>
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots in a piece of classical Latin literature from 45 BC,
              making it over 2000 years old. Richard McClintock, a Latin
              professor at Hampden-Sydney College in Virginia, looked up one of
              the more obscure Latin words, consectetur, from a Lorem Ipsum
              passage, and going through the cites of the word in classical
              literature, discovered the undoubtable source.
            </div>
            <div>
              Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
              Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
              written in 45 BC. This book is a treatise on the theory of ethics,
              very popular during the Renaissance. The first line of Lorem
              Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in
              section 1.10.32.
            </div>
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button>Cancel</Button>
          <Button variant="cta">Subscribe</Button>
        </DialogActions>
      </FakeDialog>
    </QAContainer>
  );
};

LongContent.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Preheader: StoryFn<QAContainerProps> = () => {
  return (
    <QAContainer width={1300} itemPadding={3}>
      <FakeDialog>
        <DialogHeader
          header="Subscribe"
          preheader="Recieve emails about the latest updates"
          style={{ width: "500px" }}
        />
        <DialogCloseButton />

        <DialogContent>
          <FormField necessity="asterisk">
            <FormFieldLabel> Email </FormFieldLabel>
            <Input defaultValue="Email Address" />
          </FormField>
        </DialogContent>
        <DialogActions>
          <Button>Cancel</Button>
          <Button variant="cta">Subscribe</Button>
        </DialogActions>
      </FakeDialog>
    </QAContainer>
  );
};

Preheader.parameters = {
  chromatic: { disableSnapshot: false },
};

type sizes = "small" | "medium" | "large";

const sizes: sizes[] = ["small", "medium", "large"];

export const SizeDialog: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={3000} {...rest}>
      {sizes.map((size) => {
        return <DialogTemplate key={size} header={"Info Dialog"} size={size} />;
      })}
    </QAContainer>
  );
};

SizeDialog.parameters = {
  chromatic: { disableSnapshot: false },
};

export const InfoDialog: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <DialogTemplate status={"info"} header={"Info Dialog"} />
    </QAContainer>
  );
};

InfoDialog.parameters = {
  chromatic: { disableSnapshot: false },
};

export const SuccessDialog: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <DialogTemplate status={"success"} header={"Success Dialog"} />
    </QAContainer>
  );
};

SuccessDialog.parameters = {
  chromatic: { disableSnapshot: false },
};

export const WarningDialog: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <DialogTemplate status={"warning"} header={"Warning Dialog"} />
    </QAContainer>
  );
};

WarningDialog.parameters = {
  chromatic: { disableSnapshot: false },
};

export const ErrorDialog: StoryFn<QAContainerProps> = (props) => {
  const { ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <DialogTemplate status={"error"} header={"Error Dialog"} />
    </QAContainer>
  );
};

ErrorDialog.parameters = {
  chromatic: { disableSnapshot: false },
};

export const StickyFooter: StoryFn<QAContainerProps> = () => {
  return (
    <QAContainer width={1300} itemPadding={3}>
      <FakeLongDialog>
        <DialogHeader
          header="Congratulations! You have created a Dialog."
          style={{ width: "500px" }}
        />
        <DialogCloseButton />
        <DialogContent>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </DialogContent>
        <DialogActions>
          <Button>Cancel</Button>
          <Button variant="cta">Subscribe</Button>
        </DialogActions>
      </FakeLongDialog>
    </QAContainer>
  );
};

StickyFooter.parameters = {
  chromatic: { disableSnapshot: false },
};
