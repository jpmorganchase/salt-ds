import { Button } from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Button/QA",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Button>;

export const AllVariantsGrid: Story<QAContainerProps> = (props) => (
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
