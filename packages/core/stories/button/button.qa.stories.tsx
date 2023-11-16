import { Button } from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerProps,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
} from "docs/components";

export default {
  title: "Core/Button/Button QA",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Button>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <Button variant="primary">Button</Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon /> Button
    </Button>
    <Button variant="secondary">Button</Button>
    <Button variant="secondary">
      <SearchIcon />
    </Button>
    <Button variant="secondary">
      <SearchIcon /> Button
    </Button>
    <Button variant="cta">Button</Button>
    <Button variant="cta">
      <SearchIcon />
    </Button>
    <Button variant="cta">
      <SearchIcon /> Button
    </Button>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection height={500} width={1000} {...props}>
    <Button variant="primary">Button</Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon /> Button
    </Button>
    <Button variant="secondary">Button</Button>
    <Button variant="secondary">
      <SearchIcon />
    </Button>
    <Button variant="secondary">
      <SearchIcon /> Button
    </Button>
    <Button variant="cta">Button</Button>
    <Button variant="cta">
      <SearchIcon />
    </Button>
    <Button variant="cta">
      <SearchIcon /> Button
    </Button>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
