import { Logo } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";

export default {
  title: "Lab/Logo",
  component: Logo,
} as Meta<typeof Logo>;

const Template: StoryFn<typeof Logo> = (args) => {
  return <Logo {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  src: PlaceholderLogo as string,
};

export const FeatureLogo = Template.bind({});

FeatureLogo.args = {
  appTitle: "Salt",
  src: PlaceholderLogo as string,
};

FeatureLogo.argTypes = {
  src: { control: { type: "text" } },
  appTitle: { control: { type: "text" } },
  ImageProps: { table: { disable: true } },
  TitleProps: { table: { disable: true } },
};
