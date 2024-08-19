import {
  Dropdown,
  FlexLayout,
  Option,
  SemanticIconProvider,
} from "@salt-ds/core";
import { DoubleChevronDownIcon, DoubleChevronUpIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

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

export const WithIconMap = (): ReactElement => {
  return (
    <FlexLayout style={{ maxWidth: "400px" }}>
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
    </FlexLayout>
  );
};
