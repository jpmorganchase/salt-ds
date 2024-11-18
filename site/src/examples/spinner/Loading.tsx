import { Button, Spinner, StackLayout, Text } from "@salt-ds/core";
import { type ReactElement, useEffect, useState } from "react";

const LOADING_DELAY = 2000;

export const Loading = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DELAY);
  }, []);

  return isLoading ? (
    <StackLayout align="center">
      <Text>Please wait for the action to complete</Text>
      <Spinner size="large" aria-label="loading" role="status" />
    </StackLayout>
  ) : (
    <StackLayout align="center">
      <Text>Action Complete</Text>
      <Button
        sentiment="accented"
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
          }, LOADING_DELAY);
        }}
      >
        Reload
      </Button>
    </StackLayout>
  );
};
