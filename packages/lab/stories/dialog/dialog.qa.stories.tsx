import { Button, StackLayout } from "@salt-ds/core";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogCloseButton,
  DialogProps,
  DialogContext,
} from "@salt-ds/lab";
import { ComponentStory, ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import "./dialog.stories.css";

function FakeDialog({ children, status }: DialogProps) {
  return (
    <DialogContext.Provider value={{ status, dialogId: "1" }}>
      <div className="saltDialog-overlay">
        <div className="saltDialog">{children}</div>
      </div>
    </DialogContext.Provider>
  );
}

export default {
  title: "Lab/Dialog/QA",
  component: Dialog,
  args: {
    title: "Congratulations! You have created a Dialog.",
    content: "This is the content of the dialog.",
  },
} as ComponentMeta<typeof Dialog>;

const DialogTemplate: ComponentStory<typeof Dialog> = ({
  open: openProp = true,
  ...args
}) => {
  return (
    <>
      {/* this is necessary to render the dialog styles, because we are using .saltDialog cn in FakeDialog */}
      <Dialog open={false} />
      <StackLayout>
        <FakeDialog>
          <DialogTitle accent>This is Dialog title</DialogTitle>
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
        <FakeDialog status="warning">
          <DialogTitle accent>This is Dialog title</DialogTitle>
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
    </>
  );
};

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <DialogTemplate />
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
