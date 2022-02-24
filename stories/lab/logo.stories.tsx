import { Logo } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "../assets/placeholder.svg";

export default {
  title: "Lab/Logo",
  component: Logo,
} as ComponentMeta<typeof Logo>;

const Template: ComponentStory<typeof Logo> = (args) => {
  return <Logo {...args} />;
};

export const FeatureLogo = Template.bind({});

FeatureLogo.args = {
  appTitle: "Toolkit",
  src: PlaceholderLogo as string,
};

FeatureLogo.argTypes = {
  src: { control: { type: "text" } },
  appTitle: { control: { type: "text" } },
  ImageProps: { table: { disable: true } },
  TitleProps: { table: { disable: true } },
};

export const DefaultLogo = Template.bind({});
DefaultLogo.args = {
  src: PlaceholderLogo as string,
};
