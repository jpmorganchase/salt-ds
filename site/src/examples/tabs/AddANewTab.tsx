import { TabNext, TabstripNext } from "@salt-ds/lab";
import { type ReactElement, useRef, useState } from "react";

export const AddANewTab = (): ReactElement => {
  const [tabs, setTabs] = useState(["Home", "Transactions", "Loans"]);
  const [value, setValue] = useState(tabs[0]);
  const newCount = useRef(0);

  return (
    <TabstripNext
      style={{ width: 500 }}
      value={value}
      onChange={(_event, newValue) => setValue(newValue)}
      onAdd={() => {
        const newTab = `New Tab${newCount.current > 0 ? ` ${newCount.current}` : ""}`;
        newCount.current += 1;

        setTabs((old) => old.concat(newTab));
        setValue(newTab);
      }}
    >
      {tabs.map((label) => (
        <TabNext value={label} key={label}>
          {label}
        </TabNext>
      ))}
    </TabstripNext>
  );
};
