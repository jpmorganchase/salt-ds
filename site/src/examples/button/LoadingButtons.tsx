import { Button } from "@salt-ds/core";
import { RefreshIcon, SendIcon, SyncIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

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
        loadingText="Sending"
        loading={ctaLoadingState}
        onClick={handleCtaClick}
      >
        <SendIcon aria-hidden />
        Send
      </Button>
      <Button
        variant="secondary"
        loadingText="Syncing"
        loading={secondaryLoadingState}
        onClick={handleSecondaryClick}
      >
        <SyncIcon aria-hidden />
        Sync
      </Button>
      <Button
        variant="primary"
        loadingText="Refreshing"
        loading={primaryLoadingState}
        onClick={handlePrimaryClick}
      >
        <RefreshIcon aria-hidden />
        Refresh
      </Button>
    </div>
  );
};
