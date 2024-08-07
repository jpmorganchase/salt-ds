import { Button, GridLayout, Spinner } from "@salt-ds/core";
import { RefreshIcon, SendIcon, SyncIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

function useLoadOnClick() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!loading) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  };

  return [loading, handleClick] as const;
}

export const LoadingReplaceIcon = (): ReactElement => {
  const [accentSolidLoading, setAccentSolidLoading] = useLoadOnClick();
  const [accentOutlineLoading, setAccentOutlineLoading] = useLoadOnClick();
  const [accentTransparentLoading, setAccentTransparentLoading] =
    useLoadOnClick();
  const [neutralSolidLoading, setNeutralSolidLoading] = useLoadOnClick();
  const [neutralOutlineLoading, setNeutralOutlineLoading] = useLoadOnClick();
  const [neutralTransparentLoading, setNeutralTransparentLoading] =
    useLoadOnClick();

  return (
    <GridLayout columns={3}>
      <Button
        color="accent"
        appearance="solid"
        loading={accentSolidLoading}
        onClick={setAccentSolidLoading}
      >
        {accentSolidLoading ? (
          <Spinner size="small" aria-label="Sending" />
        ) : (
          <SendIcon aria-hidden />
        )}
        Send Email
      </Button>
      <Button
        color="accent"
        appearance="outline"
        loading={accentOutlineLoading}
        onClick={setAccentOutlineLoading}
      >
        {accentOutlineLoading ? (
          <Spinner aria-label="Syncing" size="small" />
        ) : (
          <SyncIcon aria-hidden />
        )}
        Sync Files
      </Button>
      <Button
        color="accent"
        appearance="transparent"
        loading={accentTransparentLoading}
        onClick={setAccentTransparentLoading}
      >
        {accentTransparentLoading ? (
          <Spinner size="small" aria-label="Refreshing" />
        ) : (
          <RefreshIcon aria-hidden />
        )}
        Refresh Page
      </Button>
      <Button
        color="neutral"
        appearance="solid"
        loading={neutralSolidLoading}
        onClick={setNeutralSolidLoading}
      >
        {neutralSolidLoading ? (
          <Spinner size="small" aria-label="Sending" />
        ) : (
          <SendIcon aria-hidden />
        )}
        Send Email
      </Button>
      <Button
        color="neutral"
        appearance="outline"
        loading={neutralOutlineLoading}
        onClick={setNeutralOutlineLoading}
      >
        {neutralOutlineLoading ? (
          <Spinner aria-label="Syncing" size="small" />
        ) : (
          <SyncIcon aria-hidden />
        )}
        Sync Files
      </Button>
      <Button
        color="neutral"
        appearance="transparent"
        loading={neutralTransparentLoading}
        onClick={setNeutralTransparentLoading}
      >
        {neutralTransparentLoading ? (
          <Spinner size="small" aria-label="Refreshing" />
        ) : (
          <RefreshIcon aria-hidden />
        )}
        Refresh Page
      </Button>
    </GridLayout>
  );
};
