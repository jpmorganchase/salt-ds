import { useState } from "react";
import { StoryFn } from "@storybook/react";
import { Tabstrip, TabstripProps } from "@salt-ds/lab";
import { AdjustableFlexbox, AdjustableFlexboxProps } from "../components";

export default {
  title: "Lab/Tabs/Cypress Test Fixtures",
  component: Tabstrip,
};

type TabstripStory = StoryFn<AdjustableFlexboxProps & TabstripProps>;

export const SimpleTabstrip: TabstripStory = ({
  width = 600,
  source: sourceProp,
  ...tabstripProps
}: AdjustableFlexboxProps & TabstripProps) => {
  const [tabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);

  const source = sourceProp ?? tabs;

  return (
    <AdjustableFlexbox height={200} width={width}>
      <button data-testid="tabstop-1" />
      <Tabstrip {...tabstripProps} source={source} />
      <button data-testid="tabstop-2" />
    </AdjustableFlexbox>
  );
};

export const SimpleTabstripAddRemoveTab: TabstripStory = ({
  width = 600,
  source: sourceProp,
  promptForNewTabName = true,
  ...tabstripProps
}: AdjustableFlexboxProps & TabstripProps) => {
  const [tabs, setTabs] = useState([
    "Home",
    "Transactions",
    "Loans",
    "Checks",
    "Liquidity",
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [editing, setEditing] = useState(false);

  const handleAddTab = () => {
    console.log(`handleAddTab`);
    const count = tabs.length;
    setTabs((state) => state.concat([`Tab ${state.length + 1}`]));
    setActiveTabIndex(count);
    if (promptForNewTabName) {
      setEditing(true);
    }
  };

  const handleCloseTab = (tabIndex: number) => {
    const newTabs = tabs.slice();
    newTabs.splice(tabIndex, 1);
    setTabs(newTabs);
  };

  const handleEnterEditMode = () => {
    setEditing(true);
  };

  const handleExitEditMode = () => {
    setEditing(false);
  };

  const source = sourceProp ?? tabs;

  return (
    <AdjustableFlexbox height={200} width={width}>
      <button data-testid="tabstop-1" />
      <Tabstrip
        {...tabstripProps}
        activeTabIndex={activeTabIndex}
        editing={editing}
        source={source}
        onActiveChange={setActiveTabIndex}
        onAddTab={handleAddTab}
        onCloseTab={handleCloseTab}
        onEnterEditMode={handleEnterEditMode}
        onExitEditMode={handleExitEditMode}
      />
      <button data-testid="tabstop-2" />
    </AdjustableFlexbox>
  );
};
