import {
  QueryInput,
  QueryInputCategory,
  QueryInputItem,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, Story } from "@storybook/react";
import {
  QueryResultRow,
  QueryResultTable,
} from "./query-input/QueryResultTable";
import { useMemo, useState } from "react";
import { BooleanOperator } from "@jpmorganchase/uitk-lab/src/query-input/internal";
import "./query-input.stories.css";

export default {
  title: "Lab/Query Input",
  component: QueryInput,
  argTypes: {},
} as ComponentMeta<typeof QueryInput>;

const categories: QueryInputCategory[] = [
  {
    name: "Project",
    values: ["Project A", "Project B"],
  },
  {
    name: "Location",
    values: ["London", "New York", "Chicago", "Tokyo", "Singapore"],
  },
  {
    name: "Role",
    values: ["Project Manager", "Developer", "QA", "Analyst"],
  },
];

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

const DevelopmentStory: Story<StoryProps> = (props) => {
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
