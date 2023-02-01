import { useState } from "react";

import {
  ToggleButtonGroupChangeEventHandler,
  ToggleButtonToggleEventHandler,
  ToggleButtonGroup,
  ToggleButton,
} from "@salt-ds/lab";
import {
  NotificationIcon,
  HomeIcon,
  SearchIcon,
  PrintIcon,
} from "@salt-ds/icons";
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
      aria-label="toggle button"
      onToggle={handleToggle}
      toggled={toggled}
      {...args}
    >
      Toggle Button
    </ToggleButton>
  );
};

export const Primary = ToggleButtonTemplate.bind({});
Primary.args = {
  variant: "primary",
};

export const CTA = ToggleButtonTemplate.bind({});
CTA.args = {
  variant: "cta",
};

export const Secondary = ToggleButtonTemplate.bind({});
Secondary.args = {
  variant: "secondary",
};

export const Disabled = ToggleButtonTemplate.bind({});
Disabled.args = {
  disabled: true,
};

export const WithIconAndText: ComponentStory<
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
      <ToggleButton aria-label="alert" tooltipText="Alert">
        <NotificationIcon /> Alert
      </ToggleButton>
      <ToggleButton aria-label="home" tooltipText="Home">
        <HomeIcon /> Home
      </ToggleButton>
      <ToggleButton aria-label="search" tooltipText="Search">
        <SearchIcon /> Search
      </ToggleButton>
      <ToggleButton aria-label="print" tooltipText="Print">
        <PrintIcon /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const WithIconOnly: ComponentStory<
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
        <ToggleButton aria-label="alert" disabled tooltipText="Alert">
          <NotificationIcon />
        </ToggleButton>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup onChange={handleChange} selectedIndex={selectedIndex}>
        <ToggleButton aria-label="alert" disabled tooltipText="Alert">
          <NotificationIcon />
        </ToggleButton>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        onChange={handleChangeCta}
        selectedIndex={selectedIndexCta}
        variant="cta"
      >
        <ToggleButton aria-label="alert" disabled tooltipText="Alert">
          <NotificationIcon />
        </ToggleButton>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export const WithTextOnly: ComponentStory<
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
      <ToggleButton aria-label="alert" disabled tooltipText="Alert">
        Alert
      </ToggleButton>
      <ToggleButton aria-label="home" tooltipText="Home">
        Home
      </ToggleButton>
      <ToggleButton tooltipText="Search">Search</ToggleButton>
      <ToggleButton aria-label="print" tooltipText="Print">
        Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const DisabledWithFocus: ComponentStory<
  typeof ToggleButtonGroup
> = () => {
  return (
    <ToggleButtonGroup disabled focusableWhenDisabled selectedIndex={1}>
      <ToggleButton aria-label="alert" tooltipText="Alert">
        <NotificationIcon /> Alert
      </ToggleButton>
      <ToggleButton aria-label="home" tooltipText="Home">
        <HomeIcon /> Home
      </ToggleButton>
      <ToggleButton aria-label="search" tooltipText="Search">
        <SearchIcon /> Search
      </ToggleButton>
      <ToggleButton aria-label="print" tooltipText="Print">
        <PrintIcon /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const VerticalWithIconAndText: ComponentStory<
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
      <ToggleButton aria-label="alert" tooltipText="Alert">
        <NotificationIcon /> Alert
      </ToggleButton>
      <ToggleButton aria-label="home" tooltipText="Home">
        <HomeIcon /> Home
      </ToggleButton>
      <ToggleButton aria-label="search" tooltipText="Search">
        <SearchIcon /> Search
      </ToggleButton>
      <ToggleButton aria-label="print" tooltipText="Print">
        <PrintIcon /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const VerticalWithIconOnly: ComponentStory<
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
        <ToggleButton aria-label="alert" disabled tooltipText="Alert">
          <NotificationIcon />
        </ToggleButton>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        onChange={handleChange}
        orientation="vertical"
        selectedIndex={selectedIndex}
      >
        <ToggleButton aria-label="alert" disabled tooltipText="Alert">
          <NotificationIcon />
        </ToggleButton>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        onChange={handleChangeCta}
        orientation="vertical"
        selectedIndex={selectedIndexCta}
        variant="cta"
      >
        <ToggleButton aria-label="alert" disabled tooltipText="Alert">
          <NotificationIcon />
        </ToggleButton>
        <ToggleButton aria-label="home" tooltipText="Home">
          <HomeIcon />
        </ToggleButton>
        <ToggleButton aria-label="search" tooltipText="Search">
          <SearchIcon />
        </ToggleButton>
        <ToggleButton aria-label="print" tooltipText="Print">
          <PrintIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export const VerticalWithTextOnly: ComponentStory<
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
      <ToggleButton aria-label="alert" disabled tooltipText="Alert">
        Alert
      </ToggleButton>
      <ToggleButton aria-label="home" tooltipText="Home">
        Home
      </ToggleButton>
      <ToggleButton tooltipText="Search">Search</ToggleButton>
      <ToggleButton aria-label="print" tooltipText="Print">
        Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const VerticalDisabledWithFocus: ComponentStory<
  typeof ToggleButtonGroup
> = () => {
  return (
    <ToggleButtonGroup
      disabled
      focusableWhenDisabled
      orientation="vertical"
      selectedIndex={1}
    >
      <ToggleButton toggled={true} aria-label="alert" tooltipText="Alert">
        <NotificationIcon /> Alert
      </ToggleButton>
      <ToggleButton aria-label="home" tooltipText="Home">
        <HomeIcon /> Home
      </ToggleButton>
      <ToggleButton aria-label="search" tooltipText="Search">
        <SearchIcon /> Search
      </ToggleButton>
      <ToggleButton aria-label="print" tooltipText="Print">
        <PrintIcon /> Print
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
