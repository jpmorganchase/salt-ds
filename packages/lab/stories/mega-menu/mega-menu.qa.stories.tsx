import {
  Badge,
  FlexLayout,
  Link,
  NavigationItem,
  StackLayout,
  Tag,
  Text,
} from "@salt-ds/core";
import {
  CallIcon,
  DatasetManagerIcon,
  DevicesIcon,
  PasteIcon,
  UserSearchIcon,
} from "@salt-ds/icons";
import {
  MegaMenu,
  MegaMenuActions,
  MegaMenuAside,
  MegaMenuContent,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuList,
  MegaMenuListItem,
  MegaMenuPanel,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import "./mega-menu.stories.css";

export default {
  title: "Lab/Mega Menu/Mega Menu QA",
  component: MegaMenu,
} as Meta;

export const Default: StoryFn<QAContainerProps> = () => (
  <QAContainer vertical itemPadding={180}>
    <MegaMenu defaultOpen>
      <MegaMenuTrigger>
        <NavigationItem>Solutions</NavigationItem>
      </MegaMenuTrigger>
      <MegaMenuPanel aria-label="Solutions menu">
        <MegaMenuContent>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Digital banking</MegaMenuListItem>
                <MegaMenuListItem href="#">Risk management</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Patient management</MegaMenuListItem>
                <MegaMenuListItem href="#">Telemedicine</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuContent>
      </MegaMenuPanel>
    </MegaMenu>
  </QAContainer>
);
Default.parameters = {
  chromatic: { disableSnapshot: false },
};

export const MultipleTriggers: StoryFn<QAContainerProps> = () => (
  <QAContainer vertical itemPadding={180}>
    <nav>
      <StackLayout
        as="ul"
        direction="row"
        gap={1}
        style={{ listStyle: "none", padding: 0 }}
      >
        <li>
          <MegaMenu>
            <MegaMenuTrigger>
              <NavigationItem>Solutions</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Solutions menu">
              <MegaMenuContent>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem href="#">Item</MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuContent>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu defaultOpen>
            <MegaMenuTrigger>
              <NavigationItem>Services</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Services menu">
              <MegaMenuContent>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem href="#">Item</MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuContent>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
        <li>
          <MegaMenu>
            <MegaMenuTrigger>
              <NavigationItem>Resources</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel aria-label="Resources menu">
              <MegaMenuContent>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Group</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem href="#">Item</MegaMenuListItem>
                    </MegaMenuList>
                  </MegaMenuGroup>
                </MegaMenuGroups>
              </MegaMenuContent>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>
    </nav>
  </QAContainer>
);
MultipleTriggers.parameters = {
  chromatic: { disableSnapshot: false },
};

export const WithIcons: StoryFn<QAContainerProps> = () => (
  <QAContainer vertical itemPadding={180}>
    <MegaMenu defaultOpen>
      <MegaMenuTrigger>
        <NavigationItem>Solutions</NavigationItem>
      </MegaMenuTrigger>
      <MegaMenuPanel aria-label="Solutions menu">
        <MegaMenuContent>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">
                  <DevicesIcon aria-hidden />
                  Digital banking
                </MegaMenuListItem>
                <MegaMenuListItem href="#">
                  <DatasetManagerIcon aria-hidden />
                  Risk management
                </MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">
                  <UserSearchIcon aria-hidden />
                  Patient management
                </MegaMenuListItem>
                <MegaMenuListItem href="#">
                  <CallIcon aria-hidden />
                  Telemedicine
                </MegaMenuListItem>
                <MegaMenuListItem href="#">
                  <PasteIcon aria-hidden />
                  Compliance solutions
                </MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuContent>
      </MegaMenuPanel>
    </MegaMenu>
  </QAContainer>
);
WithIcons.parameters = {
  chromatic: { disableSnapshot: false },
};

export const WithAdornment: StoryFn<QAContainerProps> = () => (
  <QAContainer vertical itemPadding={180}>
    <MegaMenu defaultOpen>
      <MegaMenuTrigger>
        <NavigationItem>Solutions</NavigationItem>
      </MegaMenuTrigger>
      <MegaMenuPanel aria-label="Solutions menu">
        <MegaMenuContent>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Patient management</MegaMenuListItem>
                <MegaMenuListItem href="#">
                  Telemedicine
                  <div className="menu-item-adornment">
                    <Tag category={1} variant="primary">
                      Premium
                    </Tag>
                  </div>
                </MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Resources</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">
                  Release notes
                  <div className="menu-item-adornment">
                    <Badge />
                  </div>
                </MegaMenuListItem>
                <MegaMenuListItem href="#">FAQs</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuContent>
      </MegaMenuPanel>
    </MegaMenu>
  </QAContainer>
);
WithAdornment.parameters = {
  chromatic: { disableSnapshot: false },
};

export const WithContent: StoryFn<QAContainerProps> = () => (
  <QAContainer vertical itemPadding={180}>
    <MegaMenu defaultOpen>
      <MegaMenuTrigger>
        <NavigationItem>Solutions</NavigationItem>
      </MegaMenuTrigger>
      <MegaMenuPanel aria-label="Solutions menu">
        <MegaMenuContent>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Digital banking</MegaMenuListItem>
                <MegaMenuListItem href="#">Risk management</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Patient management</MegaMenuListItem>
                <MegaMenuListItem href="#">Telemedicine</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
          </MegaMenuGroups>
          <MegaMenuActions>
            <FlexLayout gap={3}>
              <Link color="primary" underline="default" href="#">
                Book a demo
              </Link>
              <Link color="primary" underline="default" href="#">
                Support center
              </Link>
            </FlexLayout>
          </MegaMenuActions>
        </MegaMenuContent>
        <MegaMenuAside>
          <StackLayout gap={1} style={{ maxWidth: 240 }}>
            <Text styleAs="h2" as="h2">
              Featured resource
            </Text>
            <Text>
              Explore our latest accessibility guidelines to ensure your
              components meet ADA standards.
            </Text>
            <Link
              color="primary"
              underline="default"
              href="#"
              style={{ width: "fit-content" }}
            >
              View guidelines
            </Link>
          </StackLayout>
        </MegaMenuAside>
      </MegaMenuPanel>
    </MegaMenu>
  </QAContainer>
);
WithContent.parameters = {
  chromatic: { disableSnapshot: false },
};

// Flanked layout (aside, body with an action bar, aside) reused by the
// RegionsLayout* stories. Pass a panel className to drive per-story variants.
const flankedRegions = (panelClassName?: string) => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu" className={panelClassName}>
      <MegaMenuAside>
        <StackLayout gap={1} align="start" className="mega-menu-aside">
          <Text styleAs="h4" as="h2">
            Featured
          </Text>
          <Link color="primary" href="#">
            See all solutions
          </Link>
        </StackLayout>
      </MegaMenuAside>
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
            <MegaMenuList>
              <MegaMenuListItem href="#">Digital banking</MegaMenuListItem>
              <MegaMenuListItem href="#">Risk management</MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
          <MegaMenuGroup>
            <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
            <MegaMenuList>
              <MegaMenuListItem href="#">Patient management</MegaMenuListItem>
              <MegaMenuListItem href="#">Telemedicine</MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
        <MegaMenuActions>
          <FlexLayout gap={3} align="center">
            <Link color="primary" href="#">
              Book a demo
            </Link>
            <Link color="primary" href="#">
              Support center
            </Link>
          </FlexLayout>
        </MegaMenuActions>
      </MegaMenuContent>
      <MegaMenuAside>
        <StackLayout gap={1} align="start" className="mega-menu-aside">
          <Text styleAs="h4" as="h2">
            Resources
          </Text>
          <Link color="primary" href="#">
            Documentation
          </Link>
        </StackLayout>
      </MegaMenuAside>
    </MegaMenuPanel>
  </MegaMenu>
);

export const RegionsLayoutLTR: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} itemPadding={180}>
    {flankedRegions()}
  </QAContainer>
);
RegionsLayoutLTR.parameters = {
  chromatic: { disableSnapshot: false },
};

export const RegionsLayoutRTL: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} itemPadding={180}>
    <div dir="rtl">{flankedRegions()}</div>
  </QAContainer>
);
RegionsLayoutRTL.parameters = {
  chromatic: { disableSnapshot: false },
};

export const RegionsLayoutSmallViewport: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} densities={["medium"]} itemPadding={40}>
    {flankedRegions("mega-menu-regions-stacked")}
  </QAContainer>
);
RegionsLayoutSmallViewport.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Overflow: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} itemPadding={40}>
    <MegaMenu defaultOpen>
      <MegaMenuTrigger>
        <NavigationItem>Solutions</NavigationItem>
      </MegaMenuTrigger>
      <MegaMenuPanel aria-label="Solutions menu" className="mega-menu-capped">
        <MegaMenuContent>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>All solutions</MegaMenuGroupHeading>
              <MegaMenuList>
                {Array.from({ length: 24 }, (_, index) => (
                  <MegaMenuListItem key={index} href="#">
                    Solution {index + 1}
                  </MegaMenuListItem>
                ))}
              </MegaMenuList>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuContent>
      </MegaMenuPanel>
    </MegaMenu>
  </QAContainer>
);
Overflow.parameters = {
  chromatic: { disableSnapshot: false },
};

export const SmallViewport: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} densities={["medium"]} itemPadding={40}>
    <MegaMenu defaultOpen>
      <MegaMenuTrigger>
        <NavigationItem>Solutions</NavigationItem>
      </MegaMenuTrigger>
      <MegaMenuPanel
        aria-label="Solutions menu"
        className="mega-menu-small-viewport"
      >
        <MegaMenuContent>
          <MegaMenuGroups>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Digital banking</MegaMenuListItem>
                <MegaMenuListItem href="#">Risk management</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
            <MegaMenuGroup>
              <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
              <MegaMenuList>
                <MegaMenuListItem href="#">Patient management</MegaMenuListItem>
                <MegaMenuListItem href="#">Telemedicine</MegaMenuListItem>
              </MegaMenuList>
            </MegaMenuGroup>
          </MegaMenuGroups>
        </MegaMenuContent>
      </MegaMenuPanel>
    </MegaMenu>
  </QAContainer>
);
SmallViewport.parameters = {
  chromatic: { disableSnapshot: false },
};
