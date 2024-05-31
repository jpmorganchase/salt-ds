import {
  Button,
  type ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlowLayout,
  FormField,
  FormFieldLabel,
  Input,
  Spinner,
  StackLayout,
  useId,
} from "@salt-ds/core";
import {
  DoubleChevronRightIcon,
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

export const LoadingButtonsReplaceIcon: StoryFn<typeof Button> = () => {
  const [primaryLoading, setPrimaryLoading] = useLoadOnClick();
  const [secondaryLoading, setSecondaryLoading] = useLoadOnClick();
  const [ctaLoading, setCtaLoading] = useLoadOnClick();

  return (
    <FlowLayout>
      <Button variant="cta" loading={ctaLoading} onClick={setCtaLoading}>
        {ctaLoading ? (
          <Spinner size="small" aria-label="Sending" />
        ) : (
          <SendIcon aria-hidden />
        )}
        Send Email
      </Button>
      <Button
        variant="primary"
        loading={primaryLoading}
        onClick={setPrimaryLoading}
      >
        {primaryLoading ? (
          <Spinner aria-label="Syncing" size="small" />
        ) : (
          <SyncIcon aria-hidden />
        )}
        Sync Files
      </Button>
      <Button
        variant="secondary"
        loading={secondaryLoading}
        onClick={setSecondaryLoading}
      >
        {secondaryLoading ? (
          <Spinner size="small" aria-label="Refreshing" />
        ) : (
          <RefreshIcon aria-hidden />
        )}
        Refresh Page
      </Button>
    </FlowLayout>
  );
};

export const LoadingButtons: StoryFn<typeof Button> = () => {
  const [primaryLoading, setPrimaryLoading] = useLoadOnClick();
  const [secondaryLoading, setSecondaryLoading] = useLoadOnClick();
  const [ctaLoading, setCtaLoading] = useLoadOnClick();

  return (
    <FlowLayout>
      <Button
        variant="cta"
        loading={ctaLoading}
        onClick={setCtaLoading}
        style={{ width: 66 }}
      >
        {ctaLoading ? (
          <Spinner size="small" aria-label="Sending" />
        ) : (
          <>
            <SendIcon aria-hidden />
            Send
          </>
        )}
      </Button>
      <Button
        variant="primary"
        loading={primaryLoading}
        onClick={setPrimaryLoading}
        style={{ width: 66 }}
      >
        {primaryLoading ? (
          <Spinner size="small" aria-label="Syncing" />
        ) : (
          <>
            <SyncIcon aria-hidden />
            Sync
          </>
        )}
      </Button>
      <Button
        variant="secondary"
        loading={secondaryLoading}
        onClick={setSecondaryLoading}
        style={{ width: 87 }}
      >
        {secondaryLoading ? (
          <Spinner size="small" aria-label="Refreshing" />
        ) : (
          <>
            <RefreshIcon aria-hidden />
            Refresh
          </>
        )}
      </Button>
    </FlowLayout>
  );
};

export const LoadingButtonsWithLabel: StoryFn<typeof Button> = () => {
  const [primaryLoading, setPrimaryLoading] = useLoadOnClick();
  const [secondaryLoading, setSecondaryLoading] = useLoadOnClick();
  const [ctaLoading, setCtaLoading] = useLoadOnClick();

  return (
    <FlowLayout>
      <Button variant="cta" loading={ctaLoading} onClick={setCtaLoading}>
        {ctaLoading ? (
          <>
            <Spinner size="small" aria-label="Sending" />
            Sending
          </>
        ) : (
          <>
            <SendIcon aria-hidden />
            Send
          </>
        )}
      </Button>
      <Button
        variant="primary"
        loading={primaryLoading}
        onClick={setPrimaryLoading}
      >
        {primaryLoading ? (
          <>
            <Spinner size="small" aria-label="Syncing" />
            Syncing
          </>
        ) : (
          <>
            <SyncIcon aria-hidden />
            Sync
          </>
        )}
      </Button>
      <Button
        variant="secondary"
        loading={secondaryLoading}
        onClick={setSecondaryLoading}
      >
        {secondaryLoading ? (
          <>
            <Spinner size="small" aria-label="Refreshing" />
            Refreshing
          </>
        ) : (
          <>
            <RefreshIcon aria-hidden />
            Refresh
          </>
        )}
      </Button>
    </FlowLayout>
  );
};

export const LoadingButtonRenameExample = () => {
  const [loading, setLoading] = useState(false);

  const handlePrimaryClick = () => {
    if (!loading) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        handleClose();
      }, 3000);
    }
  };
  const [open, setOpen] = useState(false);
  const id = useId();

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open dialog</Button>
      <Dialog open={open} onOpenChange={onOpenChange} id={id}>
        <DialogHeader header="Find and rename layers" />
        <DialogContent>
          <StackLayout>
            <FormField>
              <FormFieldLabel>Find</FormFieldLabel>
              <Input defaultValue="UITK" />
            </FormField>
            <FormField>
              <FormFieldLabel>Rename</FormFieldLabel>
              <Input defaultValue="Salt" />
            </FormField>
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="cta"
            loading={loading}
            onClick={handlePrimaryClick}
            style={{ width: 135 }}
          >
            {loading ? (
              <>
                <Spinner size="small" aria-label="Renaming" />
                Renaming
              </>
            ) : (
              <>
                Rename Layers
                <DoubleChevronRightIcon />
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
