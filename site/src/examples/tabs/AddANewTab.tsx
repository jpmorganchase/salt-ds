import { Button, useAriaAnnouncer } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import { type ReactElement, useRef, useState } from "react";

export const AddANewTab = (): ReactElement => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState(tabs[0]);
  const newCount = useRef(0);
  const { announce } = useAriaAnnouncer();

  return (
    <TabsNext value={value} onChange={(_event, newValue) => setValue(newValue)}>
      <TabBar inset divider style={{ width: 500 }}>
        <TabListNext>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              <TabNextTrigger>{label}</TabNextTrigger>
            </TabNext>
          ))}
        </TabListNext>
        <Button
          aria-label="Add tab"
          appearance="transparent"
          onClick={() => {
            const newTab = `New tab${newCount.current > 0 ? ` ${newCount.current}` : ""}`;
            newCount.current += 1;

            setTabs((old) => old.concat(newTab));
            announce(`${newTab} tab added`);
          }}
        >
          <AddIcon aria-hidden />
        </Button>
      </TabBar>
    </TabsNext>
  );
};
