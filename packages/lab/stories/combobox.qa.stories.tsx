import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import { FormField } from "@jpmorganchase/uitk-core";
import { ComboBox as ComboBox } from "@jpmorganchase/uitk-lab";

import { usa_states } from "./list.data";

export default {
  title: "Lab/Combobox/QA",
  component: ComboBox,
} as ComponentMeta<typeof ComboBox>;

export const AllExamples: Story<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer
    cols={4}
    imgSrc={imgSrc}
    itemPadding={12}
    transposeDensity
    vertical
    width={1200}
  >
    <div style={{ height: 300 }}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
      >
        <ComboBox
          ListProps={{
            defaultSelected: usa_states[1],
            displayedItemCount: 4,
          }}
          aria-label="Listbox example"
          isOpen={true}
          defaultValue="al"
          source={usa_states}
        />
      </FormField>
    </div>
    <ComboBox
      ListProps={{
        defaultSelected: usa_states[2],
        displayedItemCount: 4,
      }}
      aria-label="Listbox example"
      source={usa_states}
    />
    <FormField helperText="This is some help text" label="ADA compliant label">
      <ComboBox
        ListProps={{
          displayedItemCount: 4,
        }}
        aria-label="Listbox example"
        source={usa_states}
      />
    </FormField>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithBaseline: Story = () => {
  return (
    <AllExamples imgSrc="/visual-regression-screenshots/Combobox-vr-snapshot.png" />
  );
};
