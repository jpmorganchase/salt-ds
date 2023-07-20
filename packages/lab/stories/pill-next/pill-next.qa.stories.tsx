import { PillNext } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { FavoriteIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Pill Next/QA",
  component: PillNext,
} as ComponentMeta<typeof PillNext>;

const noop = () => undefined;

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <PillNext className={className}>Default Pill</PillNext>
      <PillNext className={className} onClick={noop}>
        Clickable Pill
      </PillNext>
      <PillNext className={className} onClick={noop} disabled>
        Disabled Pill
      </PillNext>
      <PillNext className={className} onClick={noop}>
        Interactive Pill
      </PillNext>
      <PillNext className={className} icon={<FavoriteIcon />} onClick={noop}>
        With Icon Pill
      </PillNext>
      <PillNext className={className}>
        Extra extra long Pill label example.
      </PillNext>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
