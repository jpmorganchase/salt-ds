import {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  Spinner,
  Button,
  StackLayout,
  FlexLayout,
  GridLayout,
  GridItem,
} from "@salt-ds/core";
import cx from "classnames";

import styles from "./LoadingPartial.module.css";

const LOADING_DELAY = 2000;

type LoadingItemProps = ComponentPropsWithoutRef<typeof GridItem> & {
  isLoading: boolean;
};

const LoadingItem = ({
  children,
  className,
  isLoading,
  ...rest
}: LoadingItemProps) => {
  return (
    <GridItem
      {...rest}
      className={cx(className, styles.loadingItem, {
        [styles.loading]: isLoading,
        [styles.loaded]: !isLoading,
      })}
    >
      <FlexLayout align="center" justify="center">
        {children}
      </FlexLayout>
    </GridItem>
  );
};

export const LoadingPartial = (): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DELAY);
  }, []);

  return (
    <StackLayout align="stretch">
      <GridLayout columns={4} rows={3} gap={1} className={styles.loadingGrid}>
        <LoadingItem isLoading={isLoading} colSpan={2} rowSpan={2}>
          {isLoading ? <Spinner aria-label="loading" role="status" /> : 1}
        </LoadingItem>
        <LoadingItem isLoading={false} colSpan={1} rowSpan={1}>
          2
        </LoadingItem>
        <LoadingItem isLoading={false} colSpan={1} rowSpan={1}>
          3
        </LoadingItem>
        <LoadingItem isLoading={false} colSpan={2} rowSpan={1}>
          4
        </LoadingItem>
        <LoadingItem isLoading={false} colSpan={1} rowSpan={1}>
          5
        </LoadingItem>
        <LoadingItem isLoading={false} colSpan={1} rowSpan={1}>
          6
        </LoadingItem>
        <LoadingItem isLoading={false} colSpan={2} rowSpan={1}>
          7
        </LoadingItem>
      </GridLayout>
      <Button
        variant="cta"
        onClick={() => {
          if (!isLoading) {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
            }, LOADING_DELAY);
          }
        }}
        disabled={isLoading}
      >
        Reload Panel
      </Button>
    </StackLayout>
  );
};
