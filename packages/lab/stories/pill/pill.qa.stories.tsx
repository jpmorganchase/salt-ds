import { Pill } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { FavoriteIcon } from "packages/icons/src";

export default {
  title: "Lab/Pill/QA",
  component: Pill,
} as ComponentMeta<typeof Pill>;

const noop = () => undefined;

export const ExamplesGrid: Story<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer cols={3} height={300} itemPadding={3} width={1300} {...rest}>
      <Pill className={className}>Default Pill</Pill>
      <Pill className={className} onClick={noop}>
        Clickable Pill
      </Pill>
      <Pill className={className} onClose={noop}>
        Closable Pill
      </Pill>
      <Pill className={className} onClick={noop} disabled>
        Disabled Pill
      </Pill>
      <Pill className={className} onClose={noop} onClick={noop}>
        Interactive Pill
      </Pill>
      <Pill
        className={className}
        icon={<FavoriteIcon />}
        onClose={noop}
        onClick={noop}
      >
        With Icon Pill
      </Pill>
      <Pill className={className}>Extra extra long Pill label example.</Pill>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
