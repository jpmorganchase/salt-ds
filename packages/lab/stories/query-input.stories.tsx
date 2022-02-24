import { QueryInput, QueryInputCategory, QueryInputItem } from "@brandname/lab";
import { ComponentMeta, Story } from "@storybook/react";
import {
  QueryResultRow,
  QueryResultTable,
} from "./query-input/QueryResultTable";
import { useMemo, useState } from "react";
import { BooleanOperator } from "@brandname/lab/src/query-input/internal";
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

const randomChar = () => {
  const abc = "abcdefghijklmnopqrstuvwxyz";
  return abc[Math.floor(Math.random() * abc.length)];
};

const randomName = () => {
  const name: string[] = [];
  const length = Math.floor(3 + 10 * Math.random());
  name.push(randomChar().toUpperCase());
  while (name.length < length) {
    name.push(randomChar());
  }
  return name.join("");
};

const dataSet: QueryResultRow[] = [];
for (let project of ["Project A", "Project B"]) {
  for (let location of [
    "London",
    "New York",
    "Chicago",
    "Tokyo",
    "Singapore",
  ]) {
    for (let role of ["Project Manager", "Developer", "QA", "Analyst"]) {
      dataSet.push({
        project,
        role,
        location,
        name: randomName(),
      });
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
        categories={categories}
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
