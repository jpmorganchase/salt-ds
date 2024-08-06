import { Button, FlowLayout, Spinner, StackLayout } from "@salt-ds/core";
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
    <StackLayout gap={3}>
      <FlowLayout>
        <Button
          color="accent"
          appearance="solid"
          loading={accentSolidLoading}
          onClick={setAccentSolidLoading}
          style={{ width: 109 }}
        >
          {accentSolidLoading ? (
            <Spinner size="small" aria-label="Sending" />
          ) : (
            <>
              <SendIcon aria-hidden />
              Send Email
            </>
          )}
        </Button>
        <Button
          color="accent"
          appearance="outline"
          loading={accentOutlineLoading}
          onClick={setAccentOutlineLoading}
          style={{ width: 102 }}
        >
          {accentOutlineLoading ? (
            <Spinner size="small" aria-label="Syncing" />
          ) : (
            <>
              <SyncIcon aria-hidden />
              Sync Files
            </>
          )}
        </Button>
        <Button
          color="accent"
          appearance="transparent"
          loading={accentTransparentLoading}
          onClick={setAccentTransparentLoading}
          style={{ width: 124 }}
        >
          {accentTransparentLoading ? (
            <Spinner size="small" aria-label="Refreshing" />
          ) : (
            <>
              <RefreshIcon aria-hidden />
              Refresh Page
            </>
          )}
        </Button>
      </FlowLayout>
      <FlowLayout>
        <Button
          color="neutral"
          appearance="solid"
          loading={neutralSolidLoading}
          onClick={setNeutralSolidLoading}
          style={{ width: 109 }}
        >
          {neutralSolidLoading ? (
            <Spinner size="small" aria-label="Sending" />
          ) : (
            <>
              <SendIcon aria-hidden />
              Send Email
            </>
          )}
        </Button>
        <Button
          color="neutral"
          appearance="outline"
          loading={neutralOutlineLoading}
          onClick={setNeutralOutlineLoading}
          style={{ width: 102 }}
        >
          {neutralOutlineLoading ? (
            <Spinner size="small" aria-label="Syncing" />
          ) : (
            <>
              <SyncIcon aria-hidden />
              Sync Files
            </>
          )}
        </Button>
        <Button
          color="neutral"
          appearance="transparent"
          loading={neutralTransparentLoading}
          onClick={setNeutralTransparentLoading}
          style={{ width: 124 }}
        >
          {neutralTransparentLoading ? (
            <Spinner size="small" aria-label="Refreshing" />
          ) : (
            <>
              <RefreshIcon aria-hidden />
              Refresh Page
            </>
          )}
        </Button>
      </FlowLayout>
    </StackLayout>
  );
};
