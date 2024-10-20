import { Dropdown, Option, SemanticIconProvider } from "@salt-ds/core";
import { DoubleChevronDownIcon, DoubleChevronUpIcon } from "@salt-ds/icons";

import "docs/story.css";

export default {
  title: "Core/Semantic Icon Provider",
  component: SemanticIconProvider,
};

const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

export const Default = () => {
  return (
    <SemanticIconProvider>
      <Dropdown>
        {usStates.map((state) => (
          <Option value={state} key={state} />
        ))}
      </Dropdown>
    </SemanticIconProvider>
  );
};

export const WithIconMap = () => {
  return (
    <SemanticIconProvider
      iconMap={{
        CollapseIcon: DoubleChevronUpIcon,
        ExpandIcon: DoubleChevronDownIcon,
      }}
    >
      <Dropdown>
        {usStates.map((state) => (
          <Option value={state} key={state} />
        ))}
      </Dropdown>
    </SemanticIconProvider>
  );
};
