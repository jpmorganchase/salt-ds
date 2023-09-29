import { ReactElement, useEffect, useState } from "react";
import { Spinner, StackLayout, Text, Button } from "@salt-ds/core";

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
        variant="cta"
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
