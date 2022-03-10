import { ComponentMeta, Story } from "@storybook/react";
import { FC } from "react";
import { ListNew } from "@brandname/lab";

export default {
  title: "Lab/ListNew",
  component: ListNew,
} as ComponentMeta<typeof ListNew>;

interface ListNewStoryProps {}

interface ValueExample {
  title: string;
}

interface GroupExample {
  name: string;
  values: ValueExample[];
}

const source: GroupExample[] = [
  {
    name: "Dogs",
    values: [
      { title: "Bulldog" },
      { title: "Poodle" },
      { title: "Great Dane" },
      { title: "Golden Retriever" },
    ],
  },
  {
    name: "Cats",
    values: [
      { title: "Persian" },
      { title: "Maine Coon" },
      { title: "Bengal" },
    ],
  },
  {
    name: "Rats",
    values: [
      { title: "Standard Rat" },
      { title: "Rex Rat" },
      { title: "Manx Rat" },
      { title: "Sphynx Rat" },
      { title: "Satin Rat" },
      { title: "Dumbo Rat" },
      { title: "Bristle Coat Rat" },
      { title: "Topaz" },
    ],
  },
];

// const getItemId = (item: ValueExample) => item.title;
const getGroupItems = (groupItem: GroupExample) => groupItem.values;

const ItemExample: FC<{ sourceItem: ValueExample }> = (props) => {
  const { sourceItem } = props;
  return <span>{sourceItem.title}</span>;
};

const GroupExample: FC<{ groupItem: GroupExample }> = (props) => {
  const { groupItem } = props;
  return <span>{groupItem.name}</span>;
};

const Template: Story<ListNewStoryProps> = () => {
  return (
    <ListNew
      source={source}
      // getItemId={getItemId}
      itemComponent={ItemExample}
      groupComponent={GroupExample}
      getGroupItems={getGroupItems}
      selectionMode={"multi"}
    />
  );
};

export const Development = Template.bind({});

Development.args = {};
