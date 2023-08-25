import { Fragment, ReactNode, useState } from "react";
import { Button, StackLayout } from "@salt-ds/core";
import { ToastGroup } from "@salt-ds/lab";

import {
  ErrorToast,
  InfoToast,
  SuccessToast,
  WarningToast,
} from "./ToastsExamples";

type ToastEntryType = {
  timestamp: number;
  content: ReactNode;
};

export const ToastGroupTop = () => {
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
      <ToastGroup placement="top-right" style={{ marginTop: 50 }}>
        {toasts
          ?.sort((a, b) => b.timestamp - a.timestamp)
          .map(({ content, timestamp }) => (
            <Fragment key={timestamp}>{content}</Fragment>
          ))}
      </ToastGroup>
    </>
  );
};
