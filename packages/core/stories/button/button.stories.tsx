import {
  Button,
  ButtonAppearanceValues,
  type ButtonProps,
  FlexItem,
  StackLayout,
} from "@salt-ds/core";
import {
  DownloadIcon,
  SearchIcon,
  SendIcon,
  SettingsSolidIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";

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

export const Default = SingleButtonTemplate.bind({});
Default.args = {
  children: "Activate",
};

export const Disabled = SingleButtonTemplate.bind({});
Disabled.args = {
  disabled: true,
  children: "Submit",
};

const ButtonVariantGrid = ({
  className = "",
  label1,
  label2,
  label3,
  variant,
  onClick,
  ...restProps
}: {
  className?: string;
  label1: string;
  label2: string;
  label3: string;
  color?: ButtonProps["color"];
} & ButtonProps) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log("clicked");
    onClick?.(event);
  };

  return (
    <StackLayout>
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          gridTemplateRows: "auto",
          gridGap: 10,
        }}
      >
        <Button variant={variant} onClick={handleClick} {...restProps}>
          {label1}
        </Button>
        <Button
          variant={variant}
          onClick={handleClick}
          aria-label="search"
          {...restProps}
        >
          <SearchIcon aria-hidden />
        </Button>
        <Button variant={variant} onClick={handleClick} {...restProps}>
          <SearchIcon aria-hidden />
          {label2}
        </Button>
      </div>
      <div>
        <Button variant={variant} onClick={handleClick} disabled {...restProps}>
          {label3}
        </Button>
      </div>
    </StackLayout>
  );
};

const ButtonColorGrid = ({
  className = "",
  label1,
  label2,
  label3,
  color,
  onClick,
  ...restProps
}: {
  className?: string;
  label1: string;
  label2: string;
  label3: string;
  color?: ButtonProps["color"];
} & ButtonProps) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log("clicked");
    onClick?.(event);
  };

  return (
    <StackLayout>
      {ButtonAppearanceValues.map((appearance) => (
        <StackLayout key={appearance}>
          <StackLayout direction="row">
            <Button
              appearance={appearance}
              color={color}
              onClick={handleClick}
              {...restProps}
            >
              {label1}
            </Button>
            <Button
              appearance={appearance}
              color={color}
              onClick={handleClick}
              aria-label="search"
              {...restProps}
            >
              <SearchIcon aria-hidden />
            </Button>
            <Button
              appearance={appearance}
              color={color}
              onClick={handleClick}
              {...restProps}
            >
              <SearchIcon aria-hidden />
              {label2}
            </Button>
          </StackLayout>
          <FlexItem>
            <Button
              appearance={appearance}
              color={color}
              onClick={handleClick}
              disabled
              {...restProps}
            >
              {label3}
            </Button>
          </FlexItem>
        </StackLayout>
      ))}
    </StackLayout>
  );
};

export const Accent: StoryFn<typeof Button> = (props) => {
  return (
    <ButtonColorGrid
      color="accent"
      label1="Submit"
      label2="Search"
      label3="Continue"
      {...props}
    />
  );
};

export const Neutral: StoryFn<typeof Button> = (props) => {
  return (
    <ButtonColorGrid
      color="neutral"
      label1="Submit"
      label2="Search"
      label3="Continue"
      {...props}
    />
  );
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
      <Button color="neutral" appearance="solid">
        Neutral solid full width Button
      </Button>
      <Button color="neutral" appearance="transparent">
        Neutral transparent full width Button
      </Button>
      <Button color="accent" appearance="solid">
        Accent solid full width Button
      </Button>
    </StackLayout>
  );
};

export const Deprecated: StoryFn<typeof Button> = (props) => {
  return (
    <StackLayout>
      <ButtonVariantGrid
        variant="cta"
        label1="Submit"
        label2="Search"
        label3="Continue"
        {...props}
      />
      <ButtonVariantGrid
        variant="primary"
        label1="Submit"
        label2="Search"
        label3="Continue"
        {...props}
      />
      <ButtonVariantGrid
        variant="secondary"
        label1="Submit"
        label2="Search"
        label3="Continue"
        {...props}
      />
    </StackLayout>
  );
};
