import {
  Button,
  Tab,
  TabBar,
  TabList,
  Tabs,
  TabTrigger,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { type ReactElement, useRef, useState } from "react";

export const AddANewTab = (): ReactElement => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState(tabs[0]);
  const newCount = useRef(0);
  const { announce } = useAriaAnnouncer();

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Tabs value={value} onChange={(_event, newValue) => setValue(newValue)}>
        <TabBar inset divider>
          <TabList aria-label="Example tablist">
            {tabs.map((label) => (
              <Tab value={label} key={label}>
                <TabTrigger>{label}</TabTrigger>
              </Tab>
            ))}
          </TabList>
          <Button
            aria-label="Add tab"
            appearance="transparent"
            onClick={() => {
              const newTab = `New tab${newCount.current > 0 ? ` ${newCount.current}` : ""}`;
              newCount.current += 1;

              setTabs((old) => old.concat(newTab));
              setValue(newTab);
              announce(`${newTab} tab added`, 150);
            }}
          >
            <AddIcon aria-hidden />
          </Button>
        </TabBar>
      </Tabs>
    </div>
  );
};
