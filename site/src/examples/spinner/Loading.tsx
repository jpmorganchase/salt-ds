import { Button, Spinner, StackLayout, Text } from "@salt-ds/core";
import { type ReactElement, useEffect, useState } from "react";

const LOADING_DELAY = 2000;
const LOADING_MESSAGE = "Please wait for the action to complete";
const COMPLETION_MESSAGE = "Action complete";

export const Loading = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) return;

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DELAY);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [isLoading]);

  return (
    <StackLayout align="center">
      <Text>{isLoading ? LOADING_MESSAGE : COMPLETION_MESSAGE}</Text>
      {isLoading && (
        <Spinner
          size="large"
          aria-label={`Loading, ${LOADING_MESSAGE.toLowerCase()}`}
          completionAnnouncement={COMPLETION_MESSAGE}
          role="status"
        />
      )}
      <Button
        disabled={isLoading}
        focusableWhenDisabled
        sentiment="accented"
        onClick={() => {
          setIsLoading(true);
        }}
      >
        Reload
      </Button>
    </StackLayout>
  );
};
