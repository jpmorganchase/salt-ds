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
} from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import "./vertical-navigation.stories.css";
import { SaltShakerIcon } from "@salt-ds/icons";

export default {
  title: "Core/Vertical Navigation/Vertical Navigation QA",
  component: VerticalNavigation,
};

const Simple = ({ appearance }: VerticalNavigationProps) => {
  return (
    <VerticalNavigation appearance={appearance} style={{ maxWidth: "30ch" }}>
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
            <VerticalNavigationItemLabel>
              Super long title that should wrap to the next line and extend the
              vertical indicator in the indicator appearance.
            </VerticalNavigationItemLabel>
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
      <Simple appearance="indicator" />
      <CollapsibleNested appearance="indicator" />
      <CollapsibleIcons appearance="indicator" />
    </QAContainer>
  );
};

Example.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
