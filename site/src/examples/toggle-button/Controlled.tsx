import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon, VisibleIcon } from "@salt-ds/icons";
import { type ReactElement, type SyntheticEvent, useState } from "react";

export const Controlled = (): ReactElement => {
  const [value, setValue] = useState<string>("");

  const handleChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    const updatedValue = event.currentTarget.value;
    setValue(updatedValue);
  };

  return (
    <ToggleButtonGroup value={value} onChange={handleChange}>
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
