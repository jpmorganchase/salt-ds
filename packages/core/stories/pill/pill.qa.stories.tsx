import { Pill } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { FavoriteIcon } from "@salt-ds/icons";

export default {
  title: "Core/Pill/QA",
  component: Pill,
} as Meta<typeof Pill>;

const noop = () => undefined;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <Pill className={className} onClick={noop}>
        Default Pill
      </Pill>
      <Pill className={className} onClick={noop} disabled>
        Disabled Pill
      </Pill>
      <Pill className={className} onClick={noop}>
        <FavoriteIcon /> With Icon Pill
      </Pill>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
