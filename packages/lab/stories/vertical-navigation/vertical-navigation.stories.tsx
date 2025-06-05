import {
  VerticalNavigation,
  VerticalNavigationGroup,
  VerticalNavigationGroupContent,
  VerticalNavigationGroupTrigger,
  VerticalNavigationItem,
  VerticalNavigationItemExpansionIcon,
} from "@salt-ds/lab";

import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Vertical Navigation",
  component: VerticalNavigation,
} as Meta<typeof VerticalNavigation>;

export const Default: StoryFn<typeof VerticalNavigation> = () => {
  return (
    <VerticalNavigation>
      <VerticalNavigationItem>Level 0 - A</VerticalNavigationItem>
      <VerticalNavigationItem active>Level 0 - B</VerticalNavigationItem>
      <VerticalNavigationItem>Level 0 - C</VerticalNavigationItem>
      <VerticalNavigationItem>Level 0 - D</VerticalNavigationItem>
    </VerticalNavigation>
  );
};

export const Nested: StoryFn<typeof VerticalNavigation> = () => {
  return (
    <VerticalNavigation>
      <VerticalNavigationGroup>
        <VerticalNavigationGroupTrigger>
          <VerticalNavigationItem>
            Level 0 - A <VerticalNavigationItemExpansionIcon />
          </VerticalNavigationItem>
        </VerticalNavigationGroupTrigger>
        <VerticalNavigationGroupContent>
          <VerticalNavigationItem>Level 1 - A</VerticalNavigationItem>
          <VerticalNavigationItem>Level 1 - B</VerticalNavigationItem>
        </VerticalNavigationGroupContent>
      </VerticalNavigationGroup>
      <VerticalNavigationItem active>Level 0 - B</VerticalNavigationItem>
      <VerticalNavigationItem>Level 0 - C</VerticalNavigationItem>
      <VerticalNavigationItem>Level 0 - D</VerticalNavigationItem>
    </VerticalNavigation>
  );
};

export const MultipleLevels: StoryFn<typeof VerticalNavigation> = () => {
  return (
    <VerticalNavigation>
      <VerticalNavigationGroup>
        <VerticalNavigationGroupTrigger>
          <VerticalNavigationItem>
            Level 0 - A <VerticalNavigationItemExpansionIcon />
          </VerticalNavigationItem>
        </VerticalNavigationGroupTrigger>
        <VerticalNavigationGroupContent>
          <VerticalNavigationGroup>
            <VerticalNavigationGroupTrigger>
              <VerticalNavigationItem>
                Level 1 - A <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItem>
            </VerticalNavigationGroupTrigger>
            <VerticalNavigationGroupContent>
              <VerticalNavigationItem>Level 2 - A </VerticalNavigationItem>
              <VerticalNavigationGroup>
                <VerticalNavigationGroupTrigger>
                  <VerticalNavigationItem>
                    Level 2 - B <VerticalNavigationItemExpansionIcon />
                  </VerticalNavigationItem>
                </VerticalNavigationGroupTrigger>
                <VerticalNavigationGroupContent>
                  <VerticalNavigationItem>Level 3 - A</VerticalNavigationItem>
                  <VerticalNavigationGroup>
                    <VerticalNavigationGroupTrigger>
                      <VerticalNavigationItem>
                        Level 3 - B <VerticalNavigationItemExpansionIcon />
                      </VerticalNavigationItem>
                    </VerticalNavigationGroupTrigger>
                    <VerticalNavigationGroupContent>
                      <VerticalNavigationItem>
                        Level 4 - A
                      </VerticalNavigationItem>
                      <VerticalNavigationItem>
                        Level 4 - B
                      </VerticalNavigationItem>
                    </VerticalNavigationGroupContent>
                  </VerticalNavigationGroup>
                </VerticalNavigationGroupContent>
              </VerticalNavigationGroup>
            </VerticalNavigationGroupContent>
          </VerticalNavigationGroup>
          <VerticalNavigationItem>Level 1 - B</VerticalNavigationItem>
        </VerticalNavigationGroupContent>
      </VerticalNavigationGroup>
      <VerticalNavigationItem active>Level 0 - B</VerticalNavigationItem>
      <VerticalNavigationItem>Level 0 - C</VerticalNavigationItem>
      <VerticalNavigationItem>Level 0 - D</VerticalNavigationItem>
    </VerticalNavigation>
  );
};
