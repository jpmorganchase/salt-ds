import { BooleanOperator, QueryInput, QueryInputItem } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { useMemo, useState } from "react";
import { QueryResultRow, QueryResultTable } from "../components";

import "./query-input.stories.css";

export default {
  title: "Lab/Query Input",
  component: QueryInput,
  argTypes: {},
} as Meta<typeof QueryInput>;

const selectedItems: QueryInputItem[] = [
  {
    category: "Location",
    value: "London",
  },
  {
    category: "Role",
    value: "Analyst",
  },
];

const dataSet: QueryResultRow[] = [];
for (const project of ["Project A", "Project B"]) {
  for (const location of [
    "London",
    "New York",
    "Chicago",
    "Tokyo",
    "Singapore",
  ]) {
    for (const role of ["Project Manager", "Developer", "QA", "Analyst"]) {
      for (const name of ["Person A", "Person B", "Person C"]) {
        dataSet.push({
          project,
          role,
          location,
          name,
        });
      }
    }
  }
}

interface StoryProps {
  showCategory: boolean;
  autoClose: boolean;
}

const propByCategory = new Map<string, keyof QueryResultRow>([
  ["Location", "location"],
  ["Role", "role"],
  ["Project", "project"],
]);

const matchQueryItem = (row: QueryResultRow, item: QueryInputItem) => {
  const { category, value } = item;
  if (category) {
    const propName = propByCategory.get(category);
    if (propName) {
      if (row[propName] === value) {
        console.log(`row[${category}] === ${value}.`);
        return true;
      }
    }
  }
  return false;
};

const makeFilterFunction = (
  items: QueryInputItem[],
  booleanOperator: BooleanOperator
) => {
  if (items.length === 0) {
    return () => true;
  }
  if (booleanOperator === "or") {
    return (row: QueryResultRow) =>
      items.some((item) => matchQueryItem(row, item));
  } else {
    return (row: QueryResultRow) =>
      items.every((item) => matchQueryItem(row, item));
  }
};

const DevelopmentStory: StoryFn<StoryProps> = (props) => {
  const [items, setItems] = useState<QueryInputItem[]>([]);
  const [booleanOperator, setBooleanOperator] = useState<BooleanOperator>("or");

  const onChange = (newItems: QueryInputItem[]) => {
    setItems(newItems);
  };

  const onBooleanOperatorChange = (operator: BooleanOperator) => {
    setBooleanOperator(operator);
  };

  const rows = useMemo(() => {
    const filterFunction = makeFilterFunction(items, booleanOperator);
    return dataSet.filter(filterFunction);
  }, [items, booleanOperator]);

  return (
    <div className={"root"}>
      <QueryInput
        categories={[
          { name: "A", values: ["A1", "A2", "A3"] },
          { name: "B", values: ["B1", "B2", "B3", "B4"] },
          { name: "C", values: ["C1", "C2", "C3", "C4", "C5"] },
        ]}
        defaultSelectedItems={selectedItems}
        showCategory={props.showCategory}
        autoClose={props.autoClose}
        selectedItems={items}
        onChange={onChange}
        onBooleanOperatorChange={onBooleanOperatorChange}
        className={"query-input"}
      />
      <QueryResultTable rows={rows} className={"query-result"} />
    </div>
  );
};

export const Development = DevelopmentStory.bind({});

Development.argTypes = {
  autoClose: {
    type: "boolean",
  },
  showCategory: {
    type: "boolean",
  },
};

Development.args = {
  showCategory: true,
  autoClose: false,
};
