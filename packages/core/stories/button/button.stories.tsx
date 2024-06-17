import { useState } from "react";
import { Button, ButtonProps, StackLayout } from "@salt-ds/core";
import {
  DownloadIcon,
  SearchIcon,
  SendIcon,
  SettingsSolidIcon,
  ChevronRightIcon,
  SyncIcon,
  RefreshIcon,
} from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

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

export const LoadingButtons: StoryFn<typeof Button> = () => {
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
      <Button variant="cta" loading={ctaLoadingState} onClick={handleCtaClick}>
        <SendIcon aria-hidden />
        Send
      </Button>
      <Button
        variant="primary"
        loading={primaryLoadingState}
        onClick={handlePrimaryClick}
      >
        <SyncIcon aria-hidden />
        Sync
      </Button>
      <Button
        variant="secondary"
        loading={secondaryLoadingState}
        onClick={handleSecondaryClick}
      >
        <RefreshIcon aria-hidden />
        Refresh
      </Button>
    </div>
  );
};

export const LoadingButtonsWithLabel: StoryFn<typeof Button> = () => {
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
        showLoadingText
        loadingText="Loading"
        loading={ctaLoadingState}
        onClick={handleCtaClick}
      >
        <SendIcon aria-hidden />
        Send Email
      </Button>
      <Button
        variant="primary"
        showLoadingText
        loadingText="Loading"
        loading={primaryLoadingState}
        onClick={handlePrimaryClick}
      >
        <SyncIcon aria-hidden />
        Sync Files
      </Button>
      <Button
        variant="secondary"
        showLoadingText
        loadingText="Loading"
        loading={secondaryLoadingState}
        onClick={handleSecondaryClick}
      >
        <RefreshIcon aria-hidden />
        Refresh Page
      </Button>
    </div>
  );
};
