import * as React from 'react';
import {
  AppHeader,
  Logo,
  LogoProps,
  Tab,
  Tabstrip,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
  Tooltray,
} from '@jpmorganchase/uitk-lab';
import PlaceholderLogo from '../logo.svg';

type ResponsiveItem = { 'data-collapsed'?: boolean };

const CollapsibleLogo = (props: LogoProps & ResponsiveItem) => (
  <Logo {...props} compact={props['data-collapsed']} />
);
const tabs = ['Home', 'About'];

export const Nav = ({
  onThemeChange,
  theme = 'light',
}: {
  onThemeChange?: (theme: 'light' | 'dark') => void;
  theme?: 'light' | 'dark';
}): JSX.Element => {
  const handleChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled,
  ) => {
    onThemeChange?.(index === 1 ? 'dark' : 'light');
  };
  return (
    <AppHeader>
      <CollapsibleLogo
        data-align-start
        data-collapsible="instant"
        data-index={0}
        data-priority={1}
        src={PlaceholderLogo}
        appTitle="Toolkit"
      />
      <Tabstrip
        data-index={1}
        data-priority={2}
        onChange={(tabIndex: number) => {
          console.log('Tab selected', tabIndex);
        }}
      >
        {tabs.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
      <Tooltray
        data-index={2}
        data-priority={1}
        data-align-end
        data-reclaim-space
      >
        <ToggleButtonGroup
          onChange={handleChange}
          selectedIndex={theme === 'light' ? 0 : 1}
        >
          <ToggleButton tooltipText="Light theme">Light</ToggleButton>
          <ToggleButton tooltipText="Dark theme">Dark</ToggleButton>
        </ToggleButtonGroup>
      </Tooltray>
    </AppHeader>
  );
};
