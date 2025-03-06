import {
  Button,
  ComboBox,
  FlexItem,
  FlexLayout,
  Option,
  StackLayout,
} from "@salt-ds/core";
import {
  HelpIcon,
  MenuIcon,
  NotificationIcon,
  SearchIcon,
  SuccessCircleIcon,
} from "@salt-ds/icons";
import { Logo } from "../components/Logo";

import "../Dashboard.css";

export default function AppHeader() {
  return (
    <header>
      <FlexLayout className={"appHeader"} justify="space-between" gap={3}>
        <FlexItem align="center">
          <StackLayout direction="row" gap={1} align="center">
            <Button appearance="transparent">
              <MenuIcon />
            </Button>
            <Logo />
          </StackLayout>
        </FlexItem>

        <FlexItem
          className={"appHeaderSearchInputContainer"}
          align="center"
          grow={1}
        >
          <ComboBox placeholder="Search" bordered endAdornment={<SearchIcon />}>
            <Option value="item 1">Item 1</Option>
            <Option value="item 2">Item 2</Option>
          </ComboBox>
        </FlexItem>

        <FlexItem align="center">
          <StackLayout direction="row" gap={1}>
            <Button appearance="transparent" aria-label="Notification">
              <NotificationIcon aria-hidden />
            </Button>
            <Button appearance="transparent" aria-label="Tasks">
              <SuccessCircleIcon aria-hidden />
            </Button>
            <Button appearance="transparent" aria-label="Help">
              <HelpIcon aria-hidden />
            </Button>
          </StackLayout>
        </FlexItem>
      </FlexLayout>
    </header>
  );
}
