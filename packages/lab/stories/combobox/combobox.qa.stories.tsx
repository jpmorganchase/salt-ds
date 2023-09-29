import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { ComboBox, FormField } from "@salt-ds/lab";

import { usa_states } from "../list/list.data";

export default {
  title: "Lab/Combo Box/QA",
  component: ComboBox,
} as Meta<typeof ComboBox>;

export const AllExamples: StoryFn<QAContainerProps> = ({ imgSrc }) => (
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
