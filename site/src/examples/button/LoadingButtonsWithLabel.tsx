import { ReactElement, useState } from "react";
import { Button } from "@salt-ds/core";
import { SendIcon, SyncIcon, RefreshIcon } from "@salt-ds/icons";

export const LoadingButtonsWithLabel = (): ReactElement => {
  const [primaryLoadingState, setPrimaryLoadingState] = useState(false);
  const [secondaryLoadingState, setSecondaryLoadingState] = useState(false);
  const [ctaLoadingState, setCtaLoadingState] = useState(false);

  const handlePrimaryClick = () => {
    setPrimaryLoadingState(true);
    setTimeout(() => {
      setPrimaryLoadingState(false);
    }, 3000);
  };
  const handleSecondaryClick = () => {
    setSecondaryLoadingState(true);
    setTimeout(() => {
      setSecondaryLoadingState(false);
    }, 3000);
  };
  const handleCtaClick = () => {
    setCtaLoadingState(true);
    setTimeout(() => {
      setCtaLoadingState(false);
    }, 3000);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto",
        gridTemplateRows: "auto",
        gridGap: 10,
      }}
    >
      <Button
        variant="cta"
        showLoadingText
        loadingText="Loading"
        loading={ctaLoadingState}
        onClick={handleCtaClick}
      >
        <SendIcon aria-hidden />
        Send Email
      </Button>
      <Button
        variant="primary"
        showLoadingText
        loadingText="Loading"
        loading={primaryLoadingState}
        onClick={handlePrimaryClick}
      >
        <SyncIcon aria-hidden />
        Sync Files
      </Button>
      <Button
        variant="secondary"
        showLoadingText
        loadingText="Loading"
        loading={secondaryLoadingState}
        onClick={handleSecondaryClick}
      >
        <RefreshIcon aria-hidden />
        Refresh Page
      </Button>
    </div>
  );
};
