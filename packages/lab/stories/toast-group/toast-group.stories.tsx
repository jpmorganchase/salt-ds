import { withDateMock } from ".storybook/decorators/withDateMock";
import {
  Button,
  FlowLayout,
  StackLayout,
  Text,
  Toast,
  ToastContent,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { ToastGroup } from "@salt-ds/lab";
import type { Meta } from "@storybook/react-vite";
import { Fragment, type ReactNode, useState } from "react";

export default {
  title: "Lab/Toast Group",
  component: ToastGroup,
  decorators: [withDateMock],
} as Meta<typeof ToastGroup>;

const InfoToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast>
      <ToastContent>
        <Text>
          <strong>File update</strong>
        </Text>
        <div>A new version of this file is available with 37 updates. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
  ) : null;
};

const ErrorToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast status="error">
      <ToastContent>
        <div>
          <Text>
            <strong>System error</strong>
          </Text>
          <div>Connection timed out. Failed to retrieve data. </div>
        </div>
        <FlowLayout
          gap={1}
          justify="end"
          style={{ marginTop: "var(--salt-spacing-100)" }}
        >
          <Button onClick={closeToast}>Dismiss</Button>
          <Button variant="cta">Try again</Button>
        </FlowLayout>
      </ToastContent>
    </Toast>
  ) : null;
};

const WarningToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast status="warning">
      <ToastContent>
        <div>
          <Text>
            <strong>File access</strong>
          </Text>
          <div>Viewers of this file can see comments and suggestions. </div>
        </div>
        <FlowLayout gap={1} style={{ marginTop: "var(--salt-spacing-100)" }}>
          <Button variant="cta" style={{ width: "100%" }}>
            Edit permissions
          </Button>
          <Button onClick={closeToast} style={{ width: "100%" }}>
            Dismiss
          </Button>
        </FlowLayout>
      </ToastContent>
    </Toast>
  ) : null;
};

const SuccessToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast status="success">
      <ToastContent>
        <Text>
          <strong>Project file upload</strong>
        </Text>
        <div>Project file has successfully uploaded to the shared drive. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
  ) : null;
};

type ToastEntryType = {
  timestamp: number;
  content: ReactNode;
};

export const BottomRight = () => {
  const [toasts, setToasts] = useState<ToastEntryType[]>([]);

  const addInfoToast = () => {
    setToasts([{ timestamp: Date.now(), content: <InfoToast /> }, ...toasts]);
  };

  const addErrorToast = () => {
    setToasts([{ timestamp: Date.now(), content: <ErrorToast /> }, ...toasts]);
  };
  const addWarningToast = () => {
    setToasts([
      { timestamp: Date.now(), content: <WarningToast /> },
      ...toasts,
    ]);
  };
  const addSuccessToast = () => {
    setToasts([
      { timestamp: Date.now(), content: <SuccessToast /> },
      ...toasts,
    ]);
  };

  return (
    <>
      <StackLayout style={{ maxWidth: 250 }}>
        <Button onClick={addInfoToast}>Add info toast</Button>
        <Button onClick={addErrorToast}>Add error toast</Button>
        <Button onClick={addWarningToast}>Add warning toast</Button>
        <Button onClick={addSuccessToast}>Add success toast</Button>
      </StackLayout>
      <ToastGroup>
        {toasts
          ?.sort((a, b) => a.timestamp - b.timestamp)
          .map(({ content, timestamp }) => (
            <Fragment key={timestamp}>{content}</Fragment>
          ))}
      </ToastGroup>
    </>
  );
};

export const TopRight = () => {
  const [toasts, setToasts] = useState<ToastEntryType[]>([]);

  const addInfoToast = () => {
    setToasts([{ timestamp: Date.now(), content: <InfoToast /> }, ...toasts]);
  };

  const addErrorToast = () => {
    setToasts([{ timestamp: Date.now(), content: <ErrorToast /> }, ...toasts]);
  };
  const addWarningToast = () => {
    setToasts([
      { timestamp: Date.now(), content: <WarningToast /> },
      ...toasts,
    ]);
  };
  const addSuccessToast = () => {
    setToasts([
      { timestamp: Date.now(), content: <SuccessToast /> },
      ...toasts,
    ]);
  };

  return (
    <>
      <StackLayout style={{ maxWidth: 250 }}>
        <Button onClick={addInfoToast}>Add info toast</Button>
        <Button onClick={addErrorToast}>Add error toast</Button>
        <Button onClick={addWarningToast}>Add warning toast</Button>
        <Button onClick={addSuccessToast}>Add success toast</Button>
      </StackLayout>
      <ToastGroup placement="top-right">
        {toasts
          ?.sort((a, b) => b.timestamp - a.timestamp)
          .map(({ content, timestamp }) => (
            <Fragment key={timestamp}>{content}</Fragment>
          ))}
      </ToastGroup>
    </>
  );
};
