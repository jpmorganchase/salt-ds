import {
  Dropdown,
  FlexLayout,
  Option,
  SemanticIconProvider,
} from "@salt-ds/core";
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

export const Default = (): ReactElement => {
  return (
    <FlexLayout style={{ maxWidth: "400px" }}>
      <SemanticIconProvider>
        <Dropdown>
          {usStates.map((state) => (
            <Option value={state} key={state} />
          ))}
        </Dropdown>
      </SemanticIconProvider>
    </FlexLayout>
  );
};
