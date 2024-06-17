import { ReactElement, useState } from "react";
import { ChevronRightIcon } from "@salt-ds/icons";
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
        Click to Continue
        <ChevronRightIcon aria-hidden />
      </Button>
      <Button
        variant="secondary"
        loadingText="Loading"
        isLoading={secondaryLoadingState}
        onClick={handleSecondaryClick}
      >
        Search
        <ChevronRightIcon aria-hidden />
      </Button>
      <Button
        variant="primary"
        loadingText="Loading"
        isLoading={primaryLoadingState}
        onClick={handlePrimaryClick}
      >
        Next Page
        <ChevronRightIcon aria-hidden />
      </Button>
    </div>
  );
};
