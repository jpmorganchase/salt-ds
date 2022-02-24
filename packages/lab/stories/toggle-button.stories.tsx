import { useState } from "react";

import {
  ToggleButtonGroupChangeEventHandler,
  ToggleButtonToggleEventHandler,
  ToggleButtonGroup,
  ToggleButton,
} from "@brandname/lab";
import {
  NotificationIcon,
  HomeIcon,
  SearchIcon,
  PrintIcon,
} from "@brandname/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/ToggleButton",
  component: ToggleButton,
  argTypes: {
    onChange: { action: "changed" },
    onToggle: { action: "toggled" },
  },
} as ComponentMeta<typeof ToggleButton>;

const ToggleButtonTemplate: ComponentStory<typeof ToggleButton> = ({
  onToggle,
  ...args
}) => {
  const [toggled, setToggled] = useState(false);

  const handleToggle: ToggleButtonToggleEventHandler = (event, newValue) => {
    onToggle?.(event, newValue);
    setToggled(newValue);
  };

  return (
    <ToggleButton
      ariaLabel="toggle button"
      onToggle={handleToggle}
      toggled={toggled}
      {...args}
    >
      Toggle Button
    </ToggleButton>
  );
};

export const DefaultButton = ToggleButtonTemplate.bind({});

export const DisabledButton = ToggleButtonTemplate.bind({});
DefaultButton.args = {
  disabled: true,
};

export const ButtonGroupWithIconAndText: ComponentStory<
  typeof ToggleButtonGroup
> = ({ onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndex(index);
  };

  return (
    <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
      <ToggleButton ariaLabel="alert" tooltipText="Alert">
        <NotificationIcon size={12} /> Alert
      </ToggleButton>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        <HomeIcon size={12} /> Home
      </ToggleButton>
      <ToggleButton ariaLabel="search" tooltipText="Search">
        <SearchIcon size={12} /> Search
      </ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        <PrintIcon size={12} /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const ButtonGroupWithIconOnly: ComponentStory<
  typeof ToggleButtonGroup
> = ({ onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [selectedIndexCta, setSelectedIndexCta] = useState<number>(1);
  const [selectedIndexSecondary, setSelectedIndexSecondary] =
    useState<number>(1);

  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndex(index);
  };

  const handleChangeCta: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndexCta(index);
  };

  const handleChangeSecondary: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndexSecondary(index);
  };

  return (
    <div
      style={{
        display: "flex",
        height: 150,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <ToggleButtonGroup
        onChange={handleChangeSecondary}
        selectedIndex={selectedIndexSecondary}
        variant="secondary"
      >
        <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
          <NotificationIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="home" tooltipText="Home">
          <HomeIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="search" tooltipText="Search">
          <SearchIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="print" tooltipText="Print">
          <PrintIcon size={12} />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
        <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
          <NotificationIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="home" tooltipText="Home">
          <HomeIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="search" tooltipText="Search">
          <SearchIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="print" tooltipText="Print">
          <PrintIcon size={12} />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        onChange={handleChangeCta}
        selectedIndex={selectedIndexCta}
        variant="cta"
      >
        <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
          <NotificationIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="home" tooltipText="Home">
          <HomeIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="search" tooltipText="Search">
          <SearchIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="print" tooltipText="Print">
          <PrintIcon size={12} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export const ButtonGroupWithTextOnly: ComponentStory<
  typeof ToggleButtonGroup
> = ({ onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndex(index);
  };

  return (
    <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
      <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
        Alert
      </ToggleButton>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        Home
      </ToggleButton>
      <ToggleButton tooltipText="Search">Search</ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const ButtonGroupDisabledWithFocus: ComponentStory<
  typeof ToggleButtonGroup
> = () => {
  return (
    <ToggleButtonGroup disabled focusableWhenDisabled selectedIndex={1}>
      <ToggleButton ariaLabel="alert" tooltipText="Alert">
        <NotificationIcon /> Alert
      </ToggleButton>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        <HomeIcon /> Home
      </ToggleButton>
      <ToggleButton ariaLabel="search" tooltipText="Search">
        <SearchIcon /> Search
      </ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        <PrintIcon /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const VerticalButtonGroupWithIconAndText: ComponentStory<
  typeof ToggleButtonGroup
> = ({ onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndex(index);
  };

  return (
    <ToggleButtonGroup
      data-testid="toggle-button-group-next"
      onChange={handleChange}
      orientation="vertical"
      selectedIndex={selectedIndex}
    >
      <ToggleButton ariaLabel="alert" tooltipText="Alert">
        <NotificationIcon size={12} /> Alert
      </ToggleButton>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        <HomeIcon size={12} /> Home
      </ToggleButton>
      <ToggleButton ariaLabel="search" tooltipText="Search">
        <SearchIcon size={12} /> Search
      </ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        <PrintIcon size={12} /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const VerticalButtonGroupWithIconOnly: ComponentStory<
  typeof ToggleButtonGroup
> = ({ onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [selectedIndexCta, setSelectedIndexCta] = useState<number>(1);
  const [selectedIndexSecondary, setSelectedIndexSecondary] =
    useState<number>(1);

  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndex(index);
  };

  const handleChangeCta: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndexCta(index);
  };

  const handleChangeSecondary: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndexSecondary(index);
  };

  return (
    <div
      style={{
        display: "flex",
        width: 250,
        justifyContent: "space-between",
      }}
    >
      <ToggleButtonGroup
        onChange={handleChangeSecondary}
        orientation="vertical"
        selectedIndex={selectedIndexSecondary}
        variant="secondary"
      >
        <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
          <NotificationIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="home" tooltipText="Home">
          <HomeIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="search" tooltipText="Search">
          <SearchIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="print" tooltipText="Print">
          <PrintIcon size={12} />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        onChange={handleChange}
        orientation="vertical"
        selectedIndex={selectedIndex}
      >
        <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
          <NotificationIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="home" tooltipText="Home">
          <HomeIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="search" tooltipText="Search">
          <SearchIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="print" tooltipText="Print">
          <PrintIcon size={12} />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        onChange={handleChangeCta}
        orientation="vertical"
        selectedIndex={selectedIndexCta}
        variant="cta"
      >
        <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
          <NotificationIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="home" tooltipText="Home">
          <HomeIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="search" tooltipText="Search">
          <SearchIcon size={12} />
        </ToggleButton>
        <ToggleButton ariaLabel="print" tooltipText="Print">
          <PrintIcon size={12} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export const VerticalButtonGroupWithTextOnly: ComponentStory<
  typeof ToggleButtonGroup
> = ({ onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    onChange?.(event, index, toggled);
    setSelectedIndex(index);
  };

  return (
    <ToggleButtonGroup
      onChange={handleChange}
      orientation="vertical"
      selectedIndex={selectedIndex}
    >
      <ToggleButton ariaLabel="alert" disabled tooltipText="Alert">
        Alert
      </ToggleButton>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        Home
      </ToggleButton>
      <ToggleButton tooltipText="Search">Search</ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const VerticalButtonGroupDisabledWithFocus: ComponentStory<
  typeof ToggleButtonGroup
> = () => {
  return (
    <ToggleButtonGroup
      disabled
      focusableWhenDisabled
      orientation="vertical"
      selectedIndex={1}
    >
      <ToggleButton ariaLabel="alert" tooltipText="Alert">
        <NotificationIcon /> Alert
      </ToggleButton>
      <ToggleButton ariaLabel="home" tooltipText="Home">
        <HomeIcon /> Home
      </ToggleButton>
      <ToggleButton ariaLabel="search" tooltipText="Search">
        <SearchIcon /> Search
      </ToggleButton>
      <ToggleButton ariaLabel="print" tooltipText="Print">
        <PrintIcon /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
