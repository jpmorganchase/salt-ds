import {
  Button,
  type ButtonProps,
  FlowLayout,
  Spinner,
  StackLayout,
} from "@salt-ds/core";
import {
  DownloadIcon,
  RefreshIcon,
  SearchIcon,
  SendIcon,
  SettingsSolidIcon,
  SyncIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Core/Button",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Button>;

const SingleButtonTemplate: StoryFn<typeof Button> = (props) => {
  return <Button {...props} />;
};

const ButtonGrid = ({
  className = "",
  label1,
  label2,
  label3,
  variant,
}: {
  className?: string;
  label1: string;
  label2: string;
  label3: string;
  variant: ButtonProps["variant"];
}) => {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <>
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          gridTemplateRows: "auto",
          gridGap: 10,
        }}
      >
        <Button variant={variant} onClick={handleClick}>
          {label1}
        </Button>
        <Button variant={variant} onClick={handleClick} aria-label="search">
          <SearchIcon aria-hidden />
        </Button>
        <Button variant={variant} onClick={handleClick}>
          <SearchIcon aria-hidden />
          {label2}
        </Button>
      </div>
      <br />
      <div>
        <Button variant={variant} onClick={handleClick} disabled>
          {label3}
        </Button>
      </div>
    </>
  );
};

export const All: StoryFn<typeof Button> = () => {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Button variant={"cta"} onClick={handleClick}>
        Submit
      </Button>
      <Button variant={"primary"} onClick={handleClick}>
        Search
      </Button>
      <Button variant={"secondary"} onClick={handleClick}>
        Cancel
      </Button>
    </div>
  );
};

export const CTA: StoryFn<typeof Button> = () => {
  return (
    <ButtonGrid
      variant="cta"
      label1="Submit"
      label2="Search"
      label3="Continue"
    />
  );
};

export const Primary: StoryFn<typeof Button> = () => {
  return (
    <ButtonGrid
      variant="primary"
      label1="Submit"
      label2="Search"
      label3="Continue"
    />
  );
};

export const Secondary: StoryFn<typeof Button> = () => {
  return (
    <ButtonGrid
      variant="secondary"
      label1="Cancel"
      label2="Find address"
      label3="Save as draft"
    />
  );
};

export const AccentSolid: StoryFn<typeof Button> = () => {
  return (
    <Button color="accent" appearance="solid">
      Send <SendIcon aria-hidden />
    </Button>
  );
};

export const AccentOutline: StoryFn<typeof Button> = () => {
  return (
    <Button color="accent" appearance="outline">
      Send <SendIcon aria-hidden />
    </Button>
  );
};

export const AccentTransparent: StoryFn<typeof Button> = () => {
  return (
    <Button color="accent" appearance="transparent">
      Send <SendIcon aria-hidden />
    </Button>
  );
};

export const NeutralSolid: StoryFn<typeof Button> = () => {
  return (
    <Button color="neutral" appearance="solid">
      Send <SendIcon aria-hidden />
    </Button>
  );
};

export const NeutralOutline: StoryFn<typeof Button> = () => {
  return (
    <Button color="neutral" appearance="outline">
      Send <SendIcon aria-hidden />
    </Button>
  );
};

export const NeutralTransparent: StoryFn<typeof Button> = () => {
  return (
    <Button color="neutral" appearance="transparent">
      Send <SendIcon aria-hidden />
    </Button>
  );
};

export const FeatureButton = SingleButtonTemplate.bind({});
FeatureButton.args = {
  children: "Activate",
};

export const Disabled = SingleButtonTemplate.bind({});
Disabled.args = {
  disabled: true,
  children: "Submit",
};

export const FocusableWhenDisabled = SingleButtonTemplate.bind({});
FocusableWhenDisabled.args = {
  focusableWhenDisabled: true,
  disabled: true,
  children: "Save as draft",
};

export const WithIcon: StoryFn<typeof Button> = () => {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Button variant="cta">
        Send <SendIcon aria-hidden />
      </Button>
      <Button variant="primary">
        <SearchIcon aria-hidden /> Search
      </Button>
      <Button variant="secondary">
        Setting <SettingsSolidIcon aria-hidden />
      </Button>
      <Button aria-label="download">
        <DownloadIcon aria-hidden />
      </Button>
    </div>
  );
};

export const FullWidth: StoryFn<typeof Button> = () => {
  return (
    <StackLayout style={{ width: "98vw" }}>
      <Button variant="primary">Primary full width Button</Button>
      <Button variant="secondary">Secondary full width Button</Button>
      <Button variant="cta">Cta full width Button</Button>
    </StackLayout>
  );
};

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

export const LoadingReplaceIcon: StoryFn = () => {
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
      </FlowLayout>
      <FlowLayout>
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
      </FlowLayout>
    </StackLayout>
  );
};

export const Loading: StoryFn = () => {
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

export const LoadingWithLabel: StoryFn = () => {
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
            <>
              <Spinner size="small" aria-label="Sending" />
              Sending
            </>
          ) : (
            <>
              <SendIcon aria-hidden />
              Send email
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
            <>
              <Spinner size="small" aria-label="Syncing" />
              Syncing
            </>
          ) : (
            <>
              <SyncIcon aria-hidden />
              Sync files
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
            <>
              <Spinner size="small" aria-label="Refreshing" />
              Refreshing
            </>
          ) : (
            <>
              <RefreshIcon aria-hidden />
              Refresh page
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
            <>
              <Spinner size="small" aria-label="Sending" />
              Sending
            </>
          ) : (
            <>
              <SendIcon aria-hidden />
              Send email
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
            <>
              <Spinner size="small" aria-label="Syncing" />
              Syncing
            </>
          ) : (
            <>
              <SyncIcon aria-hidden />
              Sync files
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
            <>
              <Spinner size="small" aria-label="Refreshing" />
              Refreshing
            </>
          ) : (
            <>
              <RefreshIcon aria-hidden />
              Refresh page
            </>
          )}
        </Button>
      </FlowLayout>
    </StackLayout>
  );
};
