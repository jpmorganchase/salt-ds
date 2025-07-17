import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import "./vertical-navigation.stories.css";
import { SaltShakerIcon } from "@salt-ds/icons";

export default {
  title: "Lab/Vertical Navigation/Vertical Navigation QA",
  component: VerticalNavigation,
};

const Simple = () => {
  return (
    <VerticalNavigation>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>One</VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
      <VerticalNavigationItem active>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>Two</VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>Three</VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>Four</VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
    </VerticalNavigation>
  );
};

const CollapsibleNested = () => {
  return (
    <VerticalNavigation>
      <Collapsible open>
        <VerticalNavigationItem>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<VerticalNavigationItemTrigger />}>
              One
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              <VerticalNavigationItem active>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger>
                    Submenu One
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
              <VerticalNavigationSubMenu>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      Submenu Two
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      Submenu Three
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
              </VerticalNavigationSubMenu>
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    </VerticalNavigation>
  );
};

const CollapsibleIcons = () => {
  return (
    <VerticalNavigation>
      <Collapsible open>
        <VerticalNavigationItem>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<VerticalNavigationItemTrigger />}>
              <SaltShakerIcon /> One
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              <VerticalNavigationItem active>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger>
                    <SaltShakerIcon /> Submenu One
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
              <VerticalNavigationSubMenu>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      <SaltShakerIcon /> Submenu Two
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      <SaltShakerIcon /> Submenu Three
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
              </VerticalNavigationSubMenu>
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    </VerticalNavigation>
  );
};

export const Example: StoryFn = () => {
  return (
    <QAContainer itemPadding={10} cols={2}>
      <Simple />
      <CollapsibleNested />
      <CollapsibleIcons />
    </QAContainer>
  );
};

Example.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
