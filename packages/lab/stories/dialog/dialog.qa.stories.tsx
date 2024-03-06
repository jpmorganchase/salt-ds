import {
  Button,
  StackLayout,
  FormField,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import {
  Dialog,
  DialogHeader,
  DialogActions,
  DialogContent,
  DialogCloseButton,
  DialogProps,
  DialogContext,
} from "@salt-ds/lab";
import { StoryFn, Meta } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import "./dialog.stories.css";

function FakeDialog({ children, status, id }: DialogProps) {
  return (
    <DialogContext.Provider value={{ status, id }}>
      <div className="fakeDialogWindow">{children}</div>
    </DialogContext.Provider>
  );
}

export default {
  title: "Lab/Dialog/QA",
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
