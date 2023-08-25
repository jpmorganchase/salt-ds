import { useState } from "react";
import { Button, FlowLayout, Text, Toast, ToastContent } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

export const InfoToast = () => {
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
  ) : (
    <></>
  );
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
  ) : (
    <></>
  );
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
  ) : (
    <></>
  );
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
          <strong>Project file upload</strong>
        </Text>
        <div>Project file has successfully uploaded to the shared drive. </div>
      </ToastContent>
      <Button variant="secondary" onClick={closeToast}>
        <CloseIcon />
      </Button>
    </Toast>
  ) : (
    <></>
  );
};
