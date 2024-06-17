import { ReactElement, useState } from "react";
import { SendIcon, SyncIcon, RefreshIcon } from "@salt-ds/icons";
import { Button } from "@salt-ds/core";

export const LoadingButtons = (): ReactElement => {
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
        loadingText="Loading"
        isLoading={ctaLoadingState}
        onClick={handleCtaClick}
      >
        <SendIcon aria-hidden />
        Send
      </Button>
      <Button
        variant="secondary"
        loadingText="Loading"
        isLoading={secondaryLoadingState}
        onClick={handleSecondaryClick}
      >
        <SyncIcon aria-hidden />
        Sync
      </Button>
      <Button
        variant="primary"
        loadingText="Loading"
        isLoading={primaryLoadingState}
        onClick={handlePrimaryClick}
      >
        <RefreshIcon aria-hidden />
        Refresh
      </Button>
    </div>
  );
};
