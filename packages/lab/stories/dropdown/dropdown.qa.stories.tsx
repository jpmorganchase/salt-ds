import { Dropdown, FormField } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import { usa_states } from "../list/list.data";

export default {
  title: "Lab/Dropdown/QA",
  component: Dropdown,
};

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer
    cols={4}
    height={1200}
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
        <Dropdown
          ListProps={{
            displayedItemCount: 4,
          }}
          aria-label="Listbox example"
          isOpen={true}
          defaultSelected={usa_states[1]}
          source={usa_states.slice(0, 4)}
        />
      </FormField>
    </div>

    <Dropdown
      ListProps={{
        displayedItemCount: 4,
      }}
      aria-label="Listbox example"
      defaultSelected={usa_states[2]}
      source={usa_states}
    />
    <FormField helperText="This is some help text" label="ADA compliant label">
      <Dropdown
        ListProps={{
          displayedItemCount: 4,
        }}
        aria-label="Listbox example"
        source={usa_states.slice(0, 4)}
      />
    </FormField>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
