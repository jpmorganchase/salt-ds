import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogContentProps,
  type DialogProps,
  H2,
  SplitLayout,
  StackLayout,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { DialogHeader } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";

export default {
  title: "Lab /Dialog Header",
  component: Dialog,
  args: {
    preheader: "Settlements",
    header: <H2>Terms and conditions</H2>,
    description: "Effective date: August 29, 2024",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
} as Meta<typeof Dialog>;

const UnmountLogger = () => {
  useEffect(() => {
    return () => {
      console.log(new Date().getTime(), "Dummy unmount");
    };
  }, []);
  return null;
};

const DialogTemplate: StoryFn<
  Omit<DialogProps, "content"> &
    Pick<
      ComponentProps<typeof DialogHeader>,
      "header" | "preheader" | "description"
    > & {
      content: DialogContentProps["children"];
    }
> = ({
  header,
  preheader,
  description,
  content,
  id,
  size,
  open: openProp = false,
  ...args
}) => {
  const [open, setOpen] = useState(openProp);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const CloseButton = () => (
    <Button
      aria-label="Close dialog"
      appearance="transparent"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Open dialog
      </Button>
      <Dialog
        {...args}
        open={open}
        onOpenChange={onOpenChange}
        id={id}
        size={size}
      >
        <DialogHeader
          header={header}
          preheader={preheader}
          description={description}
          actions={<CloseButton />}
        />
        <DialogContent>
          {content}
          <UnmountLogger />
        </DialogContent>
        <DialogActions>
          <SplitLayout
            gap={1}
            startItem={
              <Button
                sentiment="accented"
                appearance="transparent"
                onClick={handleClose}
              >
                My privacy settings
              </Button>
            }
            endItem={
              <StackLayout direction="row" gap={1}>
                <Button
                  sentiment="accented"
                  appearance="bordered"
                  onClick={handleClose}
                >
                  More info
                </Button>
                <Button
                  sentiment="accented"
                  appearance="solid"
                  onClick={handleClose}
                >
                  Save updates
                </Button>
              </StackLayout>
            }
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export const Default = DialogTemplate.bind({});
Default.args = {
  id: "Default",
};
export const LongTitle = DialogTemplate.bind({});
Default.args = {
  id: "LongTitle",
  header:
    "Complete terms and conditions for using the services provided by our company",
};

const AlertDialogTemplate: StoryFn<
  DialogProps & { header: ReactNode; content: ReactNode }
> = ({
  open: openProp = false,
  status,
  header,
  size = "small",
  content,
  ...args
}) => {
  const [open, setOpen] = useState(openProp);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <Dialog
        size={size}
        {...args}
        role="alertdialog"
        status={status}
        open={open}
        onOpenChange={onOpenChange}
        // focus the ok instead of the cancel button
        initialFocus={1}
      >
        <DialogHeader header={header} />
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button sentiment="accented" onClick={handleClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const InfoStatus = AlertDialogTemplate.bind({});
InfoStatus.args = {
  status: "info",
  header: <H2>Info</H2>,
};

export const SuccessStatus = AlertDialogTemplate.bind({});
SuccessStatus.args = {
  status: "success",
  header: <H2>Success</H2>,
};

export const WarningStatus = AlertDialogTemplate.bind({});
WarningStatus.args = {
  status: "warning",
  header: <H2>Warning</H2>,
};

export const ErrorStatus = AlertDialogTemplate.bind({});
ErrorStatus.args = {
  status: "error",
  header: <H2>Error</H2>,
};
