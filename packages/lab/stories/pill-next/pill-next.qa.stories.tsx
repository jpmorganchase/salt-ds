import { PillNext } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { FavoriteIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Pill Next/QA",
  component: PillNext,
} as Meta<typeof PillNext>;

const noop = () => undefined;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
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
        <FavoriteIcon /> With Icon Pill
      </PillNext>
      <PillNext onClick={noop} className={className}>
        <span>Extra extra long Pill label example.</span>
      </PillNext>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
