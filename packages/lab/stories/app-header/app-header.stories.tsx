import { Badge, Button, Text } from "@salt-ds/core";
import {
  FilterIcon,
  MessageIcon,
  SearchIcon,
  UserGroupIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  AppHeader,
  Logo,
  LogoImage,
  Tab,
  Tabstrip,
  type TabstripProps,
  Tooltray /*, Toolbar */,
} from "@salt-ds/lab";
import PlaceholderLogo from "docs/assets/placeholder.svg";
import { useState } from "react";
import { AdjustableFlexbox as Flexbox } from "../components";

import "docs/story.css";
import "./Flexbox.css";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/App Header",
  component: AppHeader,
} as Meta<typeof AppHeader>;

// const ToolbarButton = ({ iconName, ...props }) => (
//   <Button variant="secondary" tabIndex={0} {...props}>
//     <Icon name={iconName} />
//   </Button>
// );

const colours = [
  "yellow",
  "red",
  "cornflowerblue",
  "brown",
  "green",
  "purple",
  "orange",
  "lime",
  "silver",
  "maroon",
];

const useTabSelection = (): [number, TabstripProps["onActiveChange"]] => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};

export const Default: StoryFn<typeof AppHeader> = () => {
  const [selectedTab, handleTabSelection] = useTabSelection();

  const tabs = ["Home", "Transactions", "FX", "Checks", "Loans"];
  return (
    <Flexbox width={1000} height={400}>
      <AppHeader>
        <Logo data-align-start data-index={0} data-priority={1}>
          <LogoImage src={PlaceholderLogo as string} alt="Logo image" />
          <Text>Salt</Text>
        </Logo>
        <Tabstrip
          data-index={1}
          data-priority={2}
          onActiveChange={handleTabSelection}
        >
          {tabs.map((label) => (
            <Tab label={label} key={label} />
          ))}
        </Tabstrip>
        <Tooltray
          data-collapsible="dynamic"
          data-index={2}
          data-priority={1}
          data-align-end
          data-reclaim-space
        >
          <Button variant="secondary">
            <Badge value={50}>
              <MessageIcon />
            </Badge>
          </Button>
          <Button variant="secondary">
            <SearchIcon />
          </Button>
          <Button variant="secondary">
            <FilterIcon />
          </Button>
          <Button variant="secondary">
            <UserIcon />
          </Button>
          <Button variant="secondary">
            <UserGroupIcon />
          </Button>
        </Tooltray>
      </AppHeader>
      {tabs.map((label, idx) => (
        <div
          aria-hidden={selectedTab !== idx}
          key={label}
          style={{ borderBottom: `solid 10px ${colours[idx]}` }}
        />
      ))}
    </Flexbox>
  );
};
