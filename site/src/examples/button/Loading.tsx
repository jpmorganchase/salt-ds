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

export const Loading = (): ReactElement => {
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
        style={{ width: 66 }}
      >
        {accentSolidLoading ? (
          <Spinner size="small" aria-label="Sending" />
        ) : (
          <>
            <SendIcon aria-hidden />
            Send
          </>
        )}
      </Button>
      <Button
        color="accent"
        appearance="outline"
        loading={accentOutlineLoading}
        onClick={setAccentOutlineLoading}
        style={{ width: 66 }}
      >
        {accentOutlineLoading ? (
          <Spinner size="small" aria-label="Syncing" />
        ) : (
          <>
            <SyncIcon aria-hidden />
            Sync
          </>
        )}
      </Button>
      <Button
        color="accent"
        appearance="transparent"
        loading={accentTransparentLoading}
        onClick={setAccentTransparentLoading}
        style={{ width: 87 }}
      >
        {accentTransparentLoading ? (
          <Spinner size="small" aria-label="Refreshing" />
        ) : (
          <>
            <RefreshIcon aria-hidden />
            Refresh
          </>
        )}
      </Button>
      <Button
        color="neutral"
        appearance="solid"
        loading={neutralSolidLoading}
        onClick={setNeutralSolidLoading}
        style={{ width: 66 }}
      >
        {neutralSolidLoading ? (
          <Spinner size="small" aria-label="Sending" />
        ) : (
          <>
            <SendIcon aria-hidden />
            Send
          </>
        )}
      </Button>
      <Button
        color="neutral"
        appearance="outline"
        loading={neutralOutlineLoading}
        onClick={setNeutralOutlineLoading}
        style={{ width: 66 }}
      >
        {neutralOutlineLoading ? (
          <Spinner size="small" aria-label="Syncing" />
        ) : (
          <>
            <SyncIcon aria-hidden />
            Sync
          </>
        )}
      </Button>
      <Button
        color="neutral"
        appearance="transparent"
        loading={neutralTransparentLoading}
        onClick={setNeutralTransparentLoading}
        style={{ width: 87 }}
      >
        {neutralTransparentLoading ? (
          <Spinner size="small" aria-label="Refreshing" />
        ) : (
          <>
            <RefreshIcon aria-hidden />
            Refresh
          </>
        )}
      </Button>
    </GridLayout>
  );
};
