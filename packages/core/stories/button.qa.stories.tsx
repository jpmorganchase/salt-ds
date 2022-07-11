import { Button } from "@jpmorganchase/uitk-core";
import { SearchIcon } from "@jpmorganchase/uitk-icons";
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
      <SearchIcon size={12} />
    </Button>
    <Button variant="primary">
      <SearchIcon size={12} /> Button
    </Button>
    <Button variant="secondary">Button</Button>
    <Button variant="secondary">
      <SearchIcon size={12} />
    </Button>
    <Button variant="secondary">
      <SearchIcon size={12} /> Button
    </Button>
    <Button variant="cta">Button</Button>
    <Button variant="cta">
      <SearchIcon size={12} />
    </Button>
    <Button variant="cta">
      <SearchIcon size={12} /> Button
    </Button>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllVariantsGrid imgSrc="/visual-regression-screenshots/Button-vr-snapshot.png" />
  );
};
