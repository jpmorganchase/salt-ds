import { Button, FlowLayout, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useState } from "react";

export const InfoToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast status="info">
      <ToastContent>
        <Text>
          <strong>File update</strong>
        </Text>
        <div>A new version of this file is available with 37 updates.</div>
      </ToastContent>
      <Button
        aria-label="Dismiss"
        appearance="transparent"
        onClick={closeToast}
      >
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
  ) : null;
};

export const ErrorToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast status="error">
      <ToastContent>
        <div>
          <Text>
            <strong>A system error occurred</strong>
          </Text>
          <div>The connection timed out and failed to retrieve data.</div>
        </div>
        <FlowLayout
          gap={1}
          justify="end"
          style={{ marginTop: "var(--salt-spacing-100)" }}
        >
          <Button onClick={closeToast}>Dismiss</Button>
          <Button sentiment="accented">Try again</Button>
        </FlowLayout>
      </ToastContent>
    </Toast>
  ) : null;
};

export const WarningToast = () => {
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
          <div>Viewers of this file can see comments and suggestions.</div>
        </div>
        <FlowLayout gap={1} style={{ marginTop: "var(--salt-spacing-100)" }}>
          <Button sentiment="accented" style={{ width: "100%" }}>
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

export const SuccessToast = () => {
  const [open, setOpen] = useState<boolean>(true);
  const closeToast = () => {
    setOpen(false);
  };
  return open ? (
    <Toast status="success">
      <ToastContent>
        <Text>
          <strong>File uploaded</strong>
        </Text>
        <div>
          The project file has been successfully uploaded to the shared drive.
        </div>
      </ToastContent>
      <Button
        aria-label="Dismiss"
        appearance="transparent"
        onClick={closeToast}
      >
        <CloseIcon aria-hidden />
      </Button>
    </Toast>
  ) : null;
};
