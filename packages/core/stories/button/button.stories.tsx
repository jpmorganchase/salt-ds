import {
  Button,
  type ButtonProps,
  FlowLayout,
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

const ButtonGridTemplate: StoryFn<typeof Button> = (props) => {
  return (
    <FlowLayout>
      <Button {...props}>Submit</Button>
      <Button aria-label="Search" {...props}>
        <SearchIcon aria-hidden />
      </Button>
      <Button {...props}>
        <SearchIcon aria-hidden />
        Search
      </Button>
    </FlowLayout>
  );
};

const AppearanceGridTemplate: StoryFn<typeof Button> = (props) => {
  return (
    <StackLayout>
      <FlowLayout>
        <Button appearance="solid" {...props}>
          Solid
        </Button>
        <Button appearance="outline" {...props}>
          Outline
        </Button>
        <Button appearance="transparent" {...props}>
          Transparent
        </Button>
      </FlowLayout>
    </StackLayout>
  );
};

export const Accent = AppearanceGridTemplate.bind({});
Accent.args = {
  color: "accent",
};

export const Neutral = AppearanceGridTemplate.bind({});
Neutral.args = {
  color: "neutral",
};

export const Positive = AppearanceGridTemplate.bind({});
Positive.args = {
  color: "positive",
};

export const Negative = AppearanceGridTemplate.bind({});
Negative.args = {
  color: "negative",
};

export const Warning = AppearanceGridTemplate.bind({});
Warning.args = {
  color: "warning",
};

export const FeatureButton = SingleButtonTemplate.bind({});
FeatureButton.args = {
  children: "Activate",
};

export const Disabled: StoryFn = () => {
  return (
    <StackLayout gap={3}>
      <FlowLayout>
        <Button appearance="solid" color="accent" disabled>
          Solid
        </Button>
        <Button appearance="outline" color="accent" disabled>
          Outline
        </Button>
        <Button appearance="transparent" color="accent" disabled>
          Transparent
        </Button>
      </FlowLayout>
      <FlowLayout>
        <Button appearance="solid" color="neutral" disabled>
          Solid
        </Button>
        <Button appearance="outline" color="neutral" disabled>
          Outline
        </Button>
        <Button appearance="transparent" color="neutral" disabled>
          Transparent
        </Button>
      </FlowLayout>
      <FlowLayout>
        <Button appearance="solid" color="positive" disabled>
          Solid
        </Button>
        <Button appearance="outline" color="positive" disabled>
          Outline
        </Button>
        <Button appearance="transparent" color="positive" disabled>
          Transparent
        </Button>
      </FlowLayout>
      <FlowLayout>
        <Button appearance="solid" color="negative" disabled>
          Solid
        </Button>
        <Button appearance="outline" color="negative" disabled>
          Outline
        </Button>
        <Button appearance="transparent" color="negative" disabled>
          Transparent
        </Button>
      </FlowLayout>
      <FlowLayout>
        <Button appearance="solid" color="warning" disabled>
          Solid
        </Button>
        <Button appearance="outline" color="warning" disabled>
          Outline
        </Button>
        <Button appearance="transparent" color="warning" disabled>
          Transparent
        </Button>
      </FlowLayout>
    </StackLayout>
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
      <Button variant="primary">Primary full width Button</Button>
      <Button variant="secondary">Secondary full width Button</Button>
      <Button variant="cta">Cta full width Button</Button>
    </StackLayout>
  );
};

export const CTA = ButtonGridTemplate.bind({});
CTA.args = {
  variant: "cta",
};

export const Primary = ButtonGridTemplate.bind({});
Primary.args = {
  variant: "primary",
};

export const Secondary = ButtonGridTemplate.bind({});
Secondary.args = {
  variant: "secondary",
};
