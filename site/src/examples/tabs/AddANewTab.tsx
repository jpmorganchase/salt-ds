import { Button } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { TabBar, TabListNext, TabNext, TabsNext } from "@salt-ds/lab";
import React, { type ReactElement, useRef, useState } from "react";

export const AddANewTab = (): ReactElement => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState(tabs[0]);
  const newCount = useRef(0);

  return (
    <TabsNext value={value} onChange={(_event, newValue) => setValue(newValue)}>
      <TabBar padding separator style={{ width: 500 }}>
        <TabListNext>
          {tabs.map((label) => (
            <TabNext value={label} key={label}>
              {label}
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
          }}
        >
          <AddIcon aria-hidden />
        </Button>
      </TabBar>
    </TabsNext>
  );
};
