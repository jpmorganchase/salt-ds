import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  type VerticalNavigationProps,
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

const Simple = ({ appearance }: VerticalNavigationProps) => {
  return (
    <VerticalNavigation appearance={appearance}>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>
            <VerticalNavigationItemLabel>One</VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
      <VerticalNavigationItem active>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>
            <VerticalNavigationItemLabel>Two</VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>
            <VerticalNavigationItemLabel>Three</VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger>
            <VerticalNavigationItemLabel>Four</VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
    </VerticalNavigation>
  );
};

const CollapsibleNested = ({ appearance }: VerticalNavigationProps) => {
  return (
    <VerticalNavigation appearance={appearance}>
      <Collapsible open>
        <VerticalNavigationItem>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <VerticalNavigationItemLabel>One</VerticalNavigationItemLabel>
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              <VerticalNavigationItem active>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger>
                    <VerticalNavigationItemLabel>
                      Submenu One
                    </VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
              <VerticalNavigationSubMenu>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      <VerticalNavigationItemLabel>
                        Submenu Two
                      </VerticalNavigationItemLabel>
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      <VerticalNavigationItemLabel>
                        Submenu Three
                      </VerticalNavigationItemLabel>
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

const CollapsibleIcons = ({ appearance }: VerticalNavigationProps) => {
  return (
    <VerticalNavigation appearance={appearance}>
      <Collapsible open>
        <VerticalNavigationItem>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                <SaltShakerIcon />
                <VerticalNavigationItemLabel>One</VerticalNavigationItemLabel>
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              <VerticalNavigationItem active>
                <VerticalNavigationItemContent>
                  <VerticalNavigationItemTrigger>
                    <SaltShakerIcon />
                    <VerticalNavigationItemLabel>
                      Submenu One
                    </VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
              <VerticalNavigationSubMenu>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      <SaltShakerIcon />
                      <VerticalNavigationItemLabel>
                        Submenu Two
                      </VerticalNavigationItemLabel>
                    </VerticalNavigationItemTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
                <VerticalNavigationItem>
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger>
                      <SaltShakerIcon />
                      <VerticalNavigationItemLabel>
                        Submenu Three
                      </VerticalNavigationItemLabel>
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
      <Simple appearance="bordered" />
      <CollapsibleNested appearance="bordered" />
      <CollapsibleIcons appearance="bordered" />
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
